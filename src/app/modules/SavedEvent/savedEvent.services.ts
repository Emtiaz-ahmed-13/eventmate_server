import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

const hostSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isVerified: true,
  profile: true,
};

const saveEvent = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, "Event Not Found");

  const alreadySaved = await prisma.savedEvent.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (alreadySaved) throw new ApiError(400, "Event already saved");

  const result = await prisma.savedEvent.create({
    data: { userId, eventId },
    include: {
      event: {
        include: {
          host: { select: hostSelect },
        },
      },
    },
  });
  return result;
};

const unsaveEvent = async (userId: string, eventId: string) => {
  const saved = await prisma.savedEvent.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (!saved) throw new ApiError(400, "Event not saved");

  await prisma.savedEvent.delete({
    where: { userId_eventId: { userId, eventId } },
  });

  return { message: "Event removed from saved list." };
};

const getSavedEvents = async (userId: string) => {
  const result = await prisma.savedEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        include: {
          host: { select: hostSelect },
        },
      },
    },
  });
  return result;
};

export const SavedEventServices = {
  saveEvent,
  unsaveEvent,
  getSavedEvents,
};
