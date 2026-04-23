import { EventStatus } from "../../../../generated/prisma/client";
import {
  sendEventCancellationEmail,
  sendWaitlistPromotionEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendTicketEmail,
} from "../../../utils/sendEmail";
import { generateTicketPDF } from "../../../utils/pdf.utils";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import { NotificationServices } from "../Notification/notification.services";

const hostSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
  profile: true,
};

const createEvent = async (hostId: string, payload: any) => {
  const { capacity, joiningFee, ...rest } = payload;

  const host = await prisma.user.findUnique({ where: { id: hostId } });
  if (!host?.isVerified) {
    throw new ApiError(403, "Please verify your email before creating an event.");
  }

  const result = await prisma.event.create({
    data: {
      ...rest,
      hostId,
      dateTime: new Date(payload.dateTime),
      maxParticipants: Number(capacity),
      minParticipants: 1,
      joiningFee: Number(joiningFee || 0),
    },
  });

  // Notify Followers
  const followers = await prisma.follower.findMany({
    where: { hostId },
    include: { follower: { select: { email: true, id: true } } }
  });

  for (const f of followers) {
    NotificationServices.sendNotification({
      userId: f.followerId,
      message: `${host.name} has created a new event: ${result.name}`,
      type: "NEW_EVENT",
      email: f.follower.email,
      subject: `New Event from ${host.name}!`
    }).catch(err => console.error("Notification failed for follower:", f.followerId, err));
  }

  return result;
};

const getAllEvents = async (filters: any) => {
  const { 
    searchTerm, 
    type, 
    location, 
    dateRange, 
    paidOnly, 
    page, 
    limit,
    minPrice,
    maxPrice,
    category,
    sortBy,
    latitude,
    longitude,
    radius, // in kilometers
  } = filters;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const andConditions: any[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" as any } },
        { description: { contains: searchTerm, mode: "insensitive" as any } },
      ],
    });
  }

  if (type) andConditions.push({ type: { contains: type, mode: "insensitive" as any } });

  if (category) {
    andConditions.push({ category: { contains: category, mode: "insensitive" as any } });
  }

  if (location) {
    andConditions.push({
      location: { contains: location, mode: "insensitive" as any },
    });
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: any = {};
    if (minPrice !== undefined) priceCondition.gte = Number(minPrice);
    if (maxPrice !== undefined) priceCondition.lte = Number(maxPrice);
    andConditions.push({ joiningFee: priceCondition });
  }

  if (paidOnly === true || paidOnly === "true") {
    andConditions.push({ joiningFee: { gt: 0 } });
  }

  if (dateRange) {
    const now = new Date();
    let dateFrom: Date | undefined;
    let dateTo: Date | undefined;

    if (dateRange === "today") {
      dateFrom = new Date(now.setHours(0, 0, 0, 0));
      dateTo = new Date(now.setHours(23, 59, 59, 999));
    } else if (dateRange === "week") {
      dateFrom = new Date();
      dateTo = new Date();
      dateTo.setDate(dateTo.getDate() + 7);
    } else if (dateRange === "month") {
      dateFrom = new Date();
      dateTo = new Date();
      dateTo.setMonth(dateTo.getMonth() + 1);
    }

    if (dateFrom && dateTo) {
      andConditions.push({ dateTime: { gte: dateFrom, lte: dateTo } });
    }
  }

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  // Determine sort order
  let orderBy: any = { createdAt: "desc" }; // default

  if (sortBy === "date") {
    orderBy = { dateTime: "asc" };
  } else if (sortBy === "price-low") {
    orderBy = { joiningFee: "asc" };
  } else if (sortBy === "price-high") {
    orderBy = { joiningFee: "desc" };
  } else if (sortBy === "popularity") {
    // We'll handle this after fetching
    orderBy = { createdAt: "desc" };
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: whereConditions,
      include: {
        host: { select: hostSelect },
        _count: { select: { participants: true, reviews: true } },
        reviews: {
          select: { rating: true },
        },
      },
      skip,
      take: limitNumber,
      orderBy,
    }),
    prisma.event.count({ where: whereConditions }),
  ]);


  let processedEvents = events.map((event) => {
    const avgRating = event.reviews.length > 0
      ? event.reviews.reduce((sum, r) => sum + r.rating, 0) / event.reviews.length
      : 0;

    let distance: number | null = null;
    if (latitude && longitude && event.latitude && event.longitude) {
      const R = 6371;
      const dLat = ((event.latitude - latitude) * Math.PI) / 180;
      const dLon = ((event.longitude - longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((latitude * Math.PI) / 180) *
          Math.cos((event.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = R * c;
    }

    return {
      ...event,
      avgRating: Math.round(avgRating * 10) / 10,
      distance: distance ? Math.round(distance * 10) / 10 : null,
    };
  });
  if (radius && latitude && longitude) {
    processedEvents = processedEvents.filter(
      (e) => e.distance !== null && e.distance <= Number(radius)
    );
  }
  if (sortBy === "distance" && latitude && longitude) {
    processedEvents.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  }
  if (sortBy === "popularity") {
    processedEvents.sort((a, b) => b._count.participants - a._count.participants);
  }
  if (sortBy === "rating") {
    processedEvents.sort((a, b) => b.avgRating - a.avgRating);
  }

  return {
    events: processedEvents,
    meta: {
      total: processedEvents.length,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(processedEvents.length / limitNumber),
    },
  };
};

const getSingleEvent = async (id: string) => {
  const result = await prisma.event.findUnique({
    where: { id },
    include: {
      host: { select: hostSelect },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isVerified: true,
              profile: true,
            },
          },
        },
      },
      savedBy: {
        select: {
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
  return result;
};

const joinEvent = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { participants: true },
  });

  if (!event) throw new ApiError(404, "Event Not Found");
  if (event.status === EventStatus.CANCELLED)
    throw new ApiError(400, "Event is cancelled");

  const alreadyJoined = await prisma.participant.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (alreadyJoined) throw new ApiError(400, "You already joined this event");

  const alreadyWaitlisted = await prisma.waitlist.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (alreadyWaitlisted)
    throw new ApiError(400, "You are already on the waitlist");

  if (event.participants.length >= event.maxParticipants) {
    await prisma.waitlist.create({ data: { userId, eventId } });
    return {
      waitlisted: true,
      message: "Event is full. You have been added to the waitlist!",
    };
  }

  const status = event.approvalRequired ? "PENDING" : "APPROVED";

  const result = await prisma.participant.create({
    data: { userId, eventId, status },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          profile: true,
        },
      },
      event: {
        include: { host: { select: hostSelect } },
      },
    },
  });

  if (result.event.host) {
    await NotificationServices.sendNotification({
      userId: result.event.hostId,
      message: event.approvalRequired
        ? `${result.user.name} has requested to join: ${result.event.name}`
        : `${result.user.name} has joined your event: ${result.event.name}`,
      type: "EVENT_JOIN",
      email: result.event.host.email,
      subject: event.approvalRequired ? "New Join Request" : "New Participant Joined",
    });
  }

  if (status === "APPROVED") {
    const pdfBuffer = await generateTicketPDF(
      result.event.name,
      result.user.name,
      result.event.dateTime.toISOString(),
      result.event.location,
      result.ticketId
    );
    await sendTicketEmail(result.user.email, result.event.name, pdfBuffer);
  }

  return result;
};

const updateEvent = async (id: string, payload: any) => {
  return await prisma.event.update({ where: { id }, data: payload });
};

const leaveEvent = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { participants: true },
  });

  if (!event) throw new ApiError(404, "Event Not Found");

  const participant = await prisma.participant.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  const waitlisted = await prisma.waitlist.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (!participant && !waitlisted)
    throw new ApiError(400, "You are not in this event or waitlist");

  if (waitlisted) {
    await prisma.waitlist.delete({
      where: { userId_eventId: { userId, eventId } },
    });
    return { message: "Removed from waitlist successfully." };
  }

  await prisma.participant.delete({
    where: { userId_eventId: { userId, eventId } },
  });

  const nextInWaitlist = await prisma.waitlist.findFirst({
    where: { eventId },
    orderBy: { createdAt: "asc" },
    include: { user: true },
  });

  if (nextInWaitlist) {
    await prisma.waitlist.delete({
      where: { userId_eventId: { userId: nextInWaitlist.userId, eventId } },
    });

    await prisma.participant.create({
      data: { userId: nextInWaitlist.userId, eventId },
    });

    await sendWaitlistPromotionEmail(nextInWaitlist.user.email, event.name);

    await NotificationServices.sendNotification({
      userId: nextInWaitlist.userId,
      message: `A spot opened up! You have been added to "${event.name}"`,
      type: "EVENT_JOIN",
      email: nextInWaitlist.user.email,
      subject: `You're in! ${event.name}`,
    });
  }

  return { message: "Left event successfully." };
};

const deleteEvent = async (id: string) => {
  return await prisma.event.delete({ where: { id } });
};

const cancelEvent = async (eventId: string, hostId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { participants: { include: { user: true } } },
  });

  if (!event) throw new ApiError(404, "Event Not Found");
  if (event.hostId !== hostId)
    throw new ApiError(403, "You are not authorized to cancel this event");
  if (event.status === EventStatus.CANCELLED)
    throw new ApiError(400, "Event is already cancelled");

  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: { status: EventStatus.CANCELLED, cancelledAt: new Date() },
  });

  for (const participant of event.participants) {
    await NotificationServices.sendNotification({
      userId: participant.userId,
      message: `Event "${event.name}" has been cancelled by the host.`,
      type: "EVENT_CANCELLED",
      email: participant.user.email,
      subject: `Event Cancelled: ${event.name}`,
    });
    await sendEventCancellationEmail(participant.user.email, event.name);
  }

  return updatedEvent;
};

const getEventWaitlist = async (eventId: string) => {
  return await prisma.waitlist.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, profile: true },
      },
    },
  });
};

const approveParticipant = async (hostId: string, eventId: string, userId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, "Event Not Found");
  if (event.hostId !== hostId) throw new ApiError(403, "You are not authorized");

  const participant = await prisma.participant.findUnique({
    where: { userId_eventId: { userId, eventId } },
    include: { user: true },
  });

  if (!participant) throw new ApiError(404, "Participant Not Found");
  if (participant.status === "APPROVED") throw new ApiError(400, "Already approved");

  const updatedParticipant = await prisma.participant.update({
    where: { userId_eventId: { userId, eventId } },
    data: { status: "APPROVED" },
    include: { user: true, event: true },
  });

  const pdfBuffer = await generateTicketPDF(
    updatedParticipant.event.name,
    updatedParticipant.user.name,
    updatedParticipant.event.dateTime.toISOString(),
    updatedParticipant.event.location,
    updatedParticipant.ticketId
  );
  await sendTicketEmail(updatedParticipant.user.email, updatedParticipant.event.name, pdfBuffer);

  await NotificationServices.sendNotification({
    userId,
    message: `Your request to join "${event.name}" has been approved!`,
    type: "EVENT_JOIN",
    email: updatedParticipant.user.email,
    subject: `Approved: ${event.name}`,
  });

  return { message: "Participant approved successfully." };
};

const rejectParticipant = async (hostId: string, eventId: string, userId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, "Event Not Found");
  if (event.hostId !== hostId) throw new ApiError(403, "You are not authorized");

  const participant = await prisma.participant.findUnique({
    where: { userId_eventId: { userId, eventId } },
    include: { user: true },
  });

  if (!participant) throw new ApiError(404, "Participant Not Found");

  await prisma.participant.delete({
    where: { userId_eventId: { userId, eventId } },
  });

  await sendRejectionEmail(participant.user.email, event.name);

  await NotificationServices.sendNotification({
    userId,
    message: `Your request to join "${event.name}" has been rejected.`,
    type: "EVENT_CANCELLED",
    email: participant.user.email,
    subject: `Update: ${event.name}`,
  });

  return { message: "Participant rejected successfully." };
};

const saveEvent = async (userId: string, eventId: string) => {
  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // Check if already saved
  const existingSave = await prisma.savedEvent.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  if (existingSave) {
    throw new ApiError(400, "Event already saved");
  }

  // Save the event
  const result = await prisma.savedEvent.create({
    data: {
      userId,
      eventId,
    },
  });

  return result;
};

const unsaveEvent = async (userId: string, eventId: string) => {
  // Check if event is saved
  const savedEvent = await prisma.savedEvent.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  if (!savedEvent) {
    throw new ApiError(404, "Event not found in saved list");
  }

  // Remove from saved
  await prisma.savedEvent.delete({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  return { message: "Event removed from saved successfully" };
};

const getSavedEvents = async (userId: string) => {
  return await prisma.savedEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        include: { host: { select: hostSelect } },
      },
    },
  });
};

// ✅ Check-in participant
const checkInParticipant = async (hostId: string, eventId: string, userId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, "Event Not Found");
  if (event.hostId !== hostId) throw new ApiError(403, "Not authorized");

  const participant = await prisma.participant.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (!participant) throw new ApiError(404, "Participant Not Found");
  if (participant.status !== "APPROVED") throw new ApiError(400, "Participant not approved");

  return await prisma.participant.update({
    where: { userId_eventId: { userId, eventId } },
    data: { checkedIn: true, checkedInAt: new Date() },
    include: { user: { select: { id: true, name: true, email: true, profile: true } } },
  });
};

// ✅ Undo check-in
const undoCheckIn = async (hostId: string, eventId: string, userId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, "Event Not Found");
  if (event.hostId !== hostId) throw new ApiError(403, "Not authorized");

  return await prisma.participant.update({
    where: { userId_eventId: { userId, eventId } },
    data: { checkedIn: false, checkedInAt: null },
    include: { user: { select: { id: true, name: true, email: true, profile: true } } },
  });
};

// ✅ Event analytics for host
const getEventAnalytics = async (requesterId: string, eventId: string, isAdmin = false) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, email: true, profile: true } } },
      },
      Waitlist: true,
    },
  });

  if (!event) throw new ApiError(404, "Event Not Found");
  if (!isAdmin && event.hostId !== requesterId) throw new ApiError(403, "Not authorized");

  const approved = event.participants.filter((p) => p.status === "APPROVED");
  const pending = event.participants.filter((p) => p.status === "PENDING");
  const checkedIn = approved.filter((p) => p.checkedIn);

  const revenue = approved.length * event.joiningFee;
  const attendanceRate = event.maxParticipants > 0
    ? Math.round((approved.length / event.maxParticipants) * 100)
    : 0;
  const checkInRate = approved.length > 0
    ? Math.round((checkedIn.length / approved.length) * 100)
    : 0;

  return {
    event: {
      id: event.id,
      name: event.name,
      dateTime: event.dateTime,
      status: event.status,
      joiningFee: event.joiningFee,
      maxParticipants: event.maxParticipants,
    },
    stats: {
      totalApproved: approved.length,
      totalPending: pending.length,
      totalWaitlisted: event.Waitlist.length,
      totalCheckedIn: checkedIn.length,
      revenue,
      attendanceRate,
      checkInRate,
    },
    participants: approved.map((p) => ({
      ...p.user,
      joinedAt: p.joinedAt,
      checkedIn: p.checkedIn,
      checkedInAt: p.checkedInAt,
    })),
  };
};

// ✅ Duplicate event
const duplicateEvent = async (hostId: string, eventId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, "Event Not Found");
  if (event.hostId !== hostId) throw new ApiError(403, "Not authorized");

  const { id, createdAt, updatedAt, cancelledAt, status, ...rest } = event;

  return await prisma.event.create({
    data: {
      ...rest,
      name: `${event.name} (Copy)`,
      status: "OPEN",
    },
  });
};

const verifyTicket = async (hostId: string, eventId: string, ticketId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, "Event Not Found");
  if (event.hostId !== hostId) throw new ApiError(403, "Not authorized to verify tickets for this event");

  const participant = await prisma.participant.findUnique({
    where: { ticketId },
    include: { user: { select: { name: true, email: true, profile: true } } }
  });

  if (!participant || participant.eventId !== eventId) {
    throw new ApiError(404, "Invalid Ticket");
  }

  if (participant.status !== "APPROVED") {
    throw new ApiError(400, "Participant not approved for this event");
  }

  if (participant.checkedIn) {
    return {
      alreadyCheckedIn: true,
      participant: participant.user,
      checkedInAt: participant.checkedInAt,
    };
  }

  const result = await prisma.participant.update({
    where: { ticketId },
    data: { checkedIn: true, checkedInAt: new Date() },
    include: { user: { select: { name: true, email: true, profile: true } } }
  });

  return {
    success: true,
    participant: result.user,
    checkedInAt: result.checkedInAt,
  };
};

export const EventServices = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  joinEvent,
  leaveEvent,
  updateEvent,
  deleteEvent,
  cancelEvent,
  getEventWaitlist,
  approveParticipant,
  rejectParticipant,
  saveEvent,
  unsaveEvent,
  getSavedEvents,
  checkInParticipant,
  undoCheckIn,
  getEventAnalytics,
  duplicateEvent,
  verifyTicket,
};