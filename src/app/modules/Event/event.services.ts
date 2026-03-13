import { EventStatus } from "@prisma/client";
import {
  sendEventCancellationEmail,
  sendWaitlistPromotionEmail,
} from "../../../utils/sendEmail";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import { NotificationServices } from "../Notification/notification.services";

// ✅ reusable host select — sensitive fields বাদ
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

  // ✅ verified check
  const host = await prisma.user.findUnique({ where: { id: hostId } });
  if (!host?.isVerified) {
    throw new ApiError(
      403,
      "Please verify your email before creating an event.",
    );
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

const getAllEvents = async (filters: any) => {
  const { searchTerm, type, location } = filters;
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

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.event.findMany({
    where: whereConditions,
    include: {
      host: {
        select: hostSelect, // ✅ sensitive fields বাদ
      },
    },
  });
  return result;
};

const getSingleEvent = async (id: string) => {
  const result = await prisma.event.findUnique({
    where: { id },
    include: {
      host: {
        select: hostSelect, // ✅ sensitive fields বাদ
      },
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

  // ✅ already joined কিনা check
  const alreadyJoined = await prisma.participant.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (alreadyJoined) throw new ApiError(400, "You already joined this event");

  // ✅ already waitlisted কিনা check
  const alreadyWaitlisted = await prisma.waitlist.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (alreadyWaitlisted)
    throw new ApiError(400, "You are already on the waitlist");

  // ✅ event full হলে waitlist এ add করো
  if (event.participants.length >= event.maxParticipants) {
    await prisma.waitlist.create({
      data: { userId, eventId },
    });

    return {
      waitlisted: true,
      message: "Event is full. You have been added to the waitlist!",
    };
  }

  // event full না হলে normally join করো
  const result = await prisma.participant.create({
    data: { userId, eventId },
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
        include: {
          host: { select: hostSelect },
        },
      },
    },
  });

  if (result.event.host) {
    await NotificationServices.sendNotification({
      userId: result.event.hostId,
      message: `${result.user.name} has joined your event: ${result.event.name}`,
      type: "EVENT_JOIN",
      email: result.event.host.email,
      subject: "New Participant Joined Your Event",
    });
  }

  return result;
};

const updateEvent = async (id: string, payload: any) => {
  const result = await prisma.event.update({
    where: { id },
    data: payload,
  });
  return result;
};

const leaveEvent = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { participants: true },
  });

  if (!event) throw new ApiError(404, "Event Not Found");

  // participant আছে কিনা check
  const participant = await prisma.participant.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  // waitlist এ আছে কিনা check
  const waitlisted = await prisma.waitlist.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (!participant && !waitlisted)
    throw new ApiError(400, "You are not in this event or waitlist");

  // waitlist থেকে remove করো
  if (waitlisted) {
    await prisma.waitlist.delete({
      where: { userId_eventId: { userId, eventId } },
    });
    return { message: "Removed from waitlist successfully." };
  }

  // participant remove করো
  await prisma.participant.delete({
    where: { userId_eventId: { userId, eventId } },
  });

  // ✅ waitlist এর 1st user কে promote করো
  const nextInWaitlist = await prisma.waitlist.findFirst({
    where: { eventId },
    orderBy: { createdAt: "asc" }, // সবচেয়ে আগে add হওয়াজন
    include: { user: true },
  });

  if (nextInWaitlist) {
    // waitlist থেকে remove করো
    await prisma.waitlist.delete({
      where: { userId_eventId: { userId: nextInWaitlist.userId, eventId } },
    });

    // participant হিসেবে add করো
    await prisma.participant.create({
      data: { userId: nextInWaitlist.userId, eventId },
    });

    // email + notification পাঠাও
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
  const result = await prisma.event.delete({
    where: { id },
  });
  return result;
};

const cancelEvent = async (eventId: string, hostId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      participants: {
        include: { user: true },
      },
    },
  });

  if (!event) throw new ApiError(404, "Event Not Found");
  if (event.hostId !== hostId)
    throw new ApiError(403, "You are not authorized to cancel this event");
  if (event.status === EventStatus.CANCELLED)
    throw new ApiError(400, "Event is already cancelled");

  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: {
      status: EventStatus.CANCELLED,
      cancelledAt: new Date(), // ✅
    },
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
  const waitlist = await prisma.waitlist.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: true,
        },
      },
    },
  });
  return waitlist;
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
};
