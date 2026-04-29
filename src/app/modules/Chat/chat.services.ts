import prisma from "../../shared/prisma";
import { NotificationServices } from "../Notification/notification.services";

const sendMessage = async (userId: string, eventId: string, message: string) => {
  const result = await prisma.chatMessage.create({
    data: {
      userId,
      eventId,
      message,
    },
    include: {
      user: {
        select: {
          name: true,
          profile: {
            select: {
              profileImage: true,
            },
          },
        },
      },
    },
  });

  // Emit via Socket.io
  NotificationServices.emitChatMessage(eventId, result);

  return result;
};

const getEventMessages = async (eventId: string) => {
  return await prisma.chatMessage.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          name: true,
          profile: {
            select: {
              profileImage: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const ChatServices = {
  sendMessage,
  getEventMessages,
};
// Cleaned up messaging logs
