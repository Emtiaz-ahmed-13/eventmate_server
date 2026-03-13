import prisma from "../../shared/prisma";
import ApiError from "../../errors/ApiError";

const createReview = async (reviewerId: string, payload: any) => {
  const { hostId, rating, comment } = payload;
  
  const host = await prisma.user.findUnique({
    where: { id: hostId },
  });

  if (!host || host.role !== "HOST") {
    throw new ApiError(404, "Host Not Found");
  }

  const result = await prisma.review.create({
    data: {
      reviewerId,
      hostId,
      rating: Number(rating),
      comment,
    },
  });
  return result;
};

const getHostReviews = async (hostId: string) => {
  const result = await prisma.review.findMany({
    where: { hostId },
    include: {
      reviewer: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return result;
};

export const ReviewServices = {
  createReview,
  getHostReviews,
};
