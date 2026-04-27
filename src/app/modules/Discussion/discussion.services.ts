import prisma from "../../shared/prisma";
import ApiError from "../../errors/ApiError";

const createQuestion = async (userId: string, eventId: string, question: string) => {
  return await prisma.discussion.create({
    data: {
      userId,
      eventId,
      question,
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
};

const answerQuestion = async (hostId: string, discussionId: string, answer: string) => {
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    include: { event: true },
  });

  if (!discussion) throw new ApiError(404, "Discussion not found");
  if (discussion.event.hostId !== hostId) throw new ApiError(403, "Only the host can answer questions");

  return await prisma.discussion.update({
    where: { id: discussionId },
    data: { answer },
  });
};

const getEventDiscussions = async (eventId: string) => {
  return await prisma.discussion.findMany({
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
      createdAt: "desc",
    },
  });
};

export const DiscussionServices = {
  createQuestion,
  answerQuestion,
  getEventDiscussions,
};
// Added validation for host authority in discussion replies
