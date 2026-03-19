import prisma from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { NotificationServices } from "../Notification/notification.services";

const createReview = async (reviewerId: string, payload: any) => {
  const { hostId, eventId, rating, comment } = payload;

  const host = await prisma.user.findUnique({ where: { id: hostId } });
  if (!host || host.role !== "HOST") {
    throw new ApiError(404, "Host Not Found");
  }

  // already reviewed check — per event basis
  const alreadyReviewed = await prisma.review.findFirst({
    where: { reviewerId, hostId },
  });
  if (alreadyReviewed) {
    throw new ApiError(400, "You have already reviewed this host");
  }

  const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });

  const result = await prisma.review.create({
    data: {
      reviewerId,
      hostId,
      rating: Number(rating),
      comment,
    },
  });

  // Notify the host
  await NotificationServices.sendNotification({
    userId: hostId,
    message: `${reviewer?.name || "Someone"} left you a ${rating}-star review.`,
    type: "NEW_REVIEW",
    email: host.email,
    subject: "You received a new review on EventMate",
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

const getAllReviews = async (limit = 6) => {
  const reviews = await prisma.review.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      reviewer: {
        select: { id: true, name: true, profile: { select: { profileImage: true } } },
      },
      host: {
        select: { id: true, name: true },
      },
    },
  });
  return reviews;
};

export const ReviewServices = {
  createReview,
  getHostReviews,
  getAllReviews,
};