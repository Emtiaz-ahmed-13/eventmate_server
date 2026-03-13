import prisma from "../../shared/prisma";

const getOverviewStats = async () => {
  const [userCount, eventCount, participantCount] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.participant.count(),
  ]);
  const allParticipants = await prisma.participant.findMany({
    include: {
      event: {
        select: {
          joiningFee: true,
        },
      },
    },
  });

  const totalRevenue = allParticipants.reduce(
    (acc, curr) => acc + curr.event.joiningFee,
    0,
  );

  const activeHosts = await prisma.user.findMany({
    where: {
      hostedEvents: {
        some: {},
      },
    },
    include: {
      _count: {
        select: { hostedEvents: true },
      },
      profile: true,
    },
    orderBy: {
      hostedEvents: {
        _count: "desc",
      },
    },
    take: 5,
  });

  const events = await prisma.event.findMany({
    include: {
      participants: true,
    },
  });

  const categoryStats: Record<string, number> = {};
  events.forEach((event) => {
    if (!categoryStats[event.type]) {
      categoryStats[event.type] = 0;
    }
    categoryStats[event.type] += event.participants.length;
  });

  const trendingCategories = Object.entries(categoryStats)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    overview: {
      totalUsers: userCount,
      totalEvents: eventCount,
      totalParticipants: participantCount,
      totalRevenue,
    },
    activeHosts: activeHosts.map((host) => ({
      id: host.id,
      name: host.name,
      email: host.email,
      eventCount: host._count.hostedEvents,
      image: host.profile?.profileImage,
    })),
    trendingCategories,
  };
};

export const AnalyticsServices = {
  getOverviewStats,
};
