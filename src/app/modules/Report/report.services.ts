import { ReportStatus, ReportTarget } from "../../../../generated/prisma/client";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

const createReport = async (
  reporterId: string,
  payload: {
    targetType: ReportTarget;
    targetId: string;
    reason: string;
    description?: string;
  },
) => {
  if (payload.targetType === "EVENT") {
    const event = await prisma.event.findUnique({ where: { id: payload.targetId } });
    if (!event) throw new ApiError(404, "Event not found");
  }

  if (payload.targetType === "USER") {
    const user = await prisma.user.findUnique({ where: { id: payload.targetId } });
    if (!user) throw new ApiError(404, "User not found");
    if (user.id === reporterId) throw new ApiError(400, "You cannot report yourself");
  }

  if (payload.targetType === "REVIEW") {
    const review = await prisma.review.findUnique({ where: { id: payload.targetId } });
    if (!review) throw new ApiError(404, "Review not found");
  }

  return prisma.report.create({
    data: {
      reporterId,
      targetType: payload.targetType,
      targetId: payload.targetId,
      reason: payload.reason,
      description: payload.description,
    },
  });
};

const getAllReports = async (status?: ReportStatus) => {
  return prisma.report.findMany({
    where: status ? { status } : undefined,
    include: {
      reporter: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateReportStatus = async (reportId: string, status: ReportStatus) => {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new ApiError(404, "Report not found");

  return prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      reviewedAt: new Date(),
    },
  });
};

export const ReportServices = {
  createReport,
  getAllReports,
  updateReportStatus,
};
