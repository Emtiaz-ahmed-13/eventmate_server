import prisma from "../../shared/prisma";
import ApiError from "../../errors/ApiError";

const createReview = async (reviewerId: string, payload: any) => {
  const { hostId, rating, comment } = payload;

  const host = await prisma.user.findUnique({ where: { id: hostId } });
  if (!host || host.role !== "HOST") {
    throw new ApiError(404, "Host Not Found");
  }

  // ✅ already reviewed কিনা check
  const alreadyReviewed = await prisma.review.findFirst({
    where: { reviewerId, hostId },
  });
  if (alreadyReviewed) {
    throw new ApiError(400, "You have already reviewed this host");
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
  const reviews = await prisma.review.findMany({
    where: { hostId },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // ✅ average rating calculate করো
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0
    ? Math.round((totalRating / reviews.length) * 10) / 10
    : 0;

  return {
    reviews,
    totalReviews: reviews.length,
    averageRating,
  };
};

export const ReviewServices = {
  createReview,
  getHostReviews,
};