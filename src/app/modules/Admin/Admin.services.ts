import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
  profile: true,
};

const getAllUsers = async () => {
  return await prisma.user.findMany({ select: safeUserSelect });
};

const getAllHosts = async () => {
  return await prisma.user.findMany({
    where: { role: "HOST" },
    select: safeUserSelect,
  });
};

const changeUserRole = async (id: string, role: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(404, "User Not Found");
  return await prisma.user.update({
    where: { id },
    data: { role: role as any },
    select: safeUserSelect,
  });
};

const toggleUserBan = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(404, "User Not Found");
  return await prisma.user.update({
    where: { id },
    data: { isVerified: !user.isVerified },
    select: safeUserSelect,
  });
};

const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(404, "User Not Found");
  await prisma.$transaction(async (tx) => {
    await tx.profile.deleteMany({ where: { userId: id } });
    await tx.participant.deleteMany({ where: { userId: id } });
    await tx.notification.deleteMany({ where: { userId: id } });
    await tx.savedEvent.deleteMany({ where: { userId: id } });
    await tx.waitlist.deleteMany({ where: { userId: id } });
    await tx.user.delete({ where: { id } });
  });
  return { message: "User deleted successfully." };
};

const getAllEvents = async () => {
  return await prisma.event.findMany({
    include: {
      host: { select: safeUserSelect },
      participants: true,
    },
  });
};

const deleteEvent = async (id: string) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new ApiError(404, "Event Not Found");
  await prisma.$transaction(async (tx) => {
    await tx.participant.deleteMany({ where: { eventId: id } });
    await tx.waitlist.deleteMany({ where: { eventId: id } });
    await tx.savedEvent.deleteMany({ where: { eventId: id } });
    await tx.notification.deleteMany({ where: { userId: event.hostId } });
    await tx.event.delete({ where: { id } });
  });
  return { message: "Event deleted successfully." };
};

const getAdminStats = async () => {
  const [
    totalUsers,
    totalHosts,
    totalEvents,
    openEvents,
    cancelledEvents,
    totalParticipants,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "HOST" } }),
    prisma.event.count(),
    prisma.event.count({ where: { status: "OPEN" } }),
    prisma.event.count({ where: { status: "CANCELLED" } }),
    prisma.participant.count(),
  ]);

  return {
    totalUsers,
    totalHosts,
    totalEvents,
    openEvents,
    cancelledEvents,
    totalParticipants,
  };
};

const getSystemLogs = async (limit = 50, type?: string) => {
  const notifications = await prisma.notification.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    where: type && type !== "all" ? { type } : undefined,
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });
  return notifications;
};

const getPendingHosts = async () => {
  // Users who registered as HOST role but not yet "verified" by admin
  // We treat isVerified=true as admin-approved for hosts
  return await prisma.user.findMany({
    where: { role: "HOST" },
    select: {
      ...safeUserSelect,
      hostedEvents: { select: { id: true } },
      reviewsReceived: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const AdminServices = {
  getAllUsers,
  getAllHosts,
  changeUserRole,
  toggleUserBan,
  deleteUser,
  getAllEvents,
  deleteEvent,
  getAdminStats,
  getSystemLogs,
  getPendingHosts,
};