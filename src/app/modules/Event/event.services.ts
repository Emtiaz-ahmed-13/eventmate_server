import { EventStatus } from "../../../../generated/prisma/client";
import {
  sendEventCancellationEmail,
  sendWaitlistPromotionEmail,
  sendApprovalEmail,
  sendRejectionEmail,
} from "../../../utils/sendEmail";
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
  return result;
};

// ✅ Pagination সহ getAllEvents — duplicate নেই
const getAllEvents = async (filters: any) => {
  const { searchTerm, type, location, page, limit } = filters;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" as any } },
        { description: { contains: searchTerm, mode: "insensitive" as any } },
      ],
    });
  }

  if (type) andConditions.push({ type });

  if (location) {
    andConditions.push({
      location: { contains: location, mode: "insensitive" as any },
    });
  }

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: whereConditions,
      include: { host: { select: hostSelect } },
      skip,
      take: limitNumber,
      orderBy: { createdAt: "desc" },
    }),
    prisma.event.count({ where: whereConditions }),
  ]);

  return {
    events,
    meta: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
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

  await prisma.participant.update({
    where: { userId_eventId: { userId, eventId } },
    data: { status: "APPROVED" },
  });

  await sendApprovalEmail(participant.user.email, event.name);

  await NotificationServices.sendNotification({
    userId,
    message: `Your request to join "${event.name}" has been approved!`,
    type: "EVENT_JOIN",
    email: participant.user.email,
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
};