import prisma from "../app/shared/prisma";
import {
  countJoinsInSlidingWindow,
  getTopTrendingScores,
} from "./trendingHeap";

const WINDOW_HOURS = 24;
const DEFAULT_LIMIT = 10;

export type TrendingEvent = Awaited<
  ReturnType<typeof prisma.event.findMany>
>[number] & {
  trendingScore: number;
  host: {
    id: string;
    name: string;
    profile: { profileImage: string | null } | null;
  };
  _count: { participants: number; reviews: number };
};

type TrendingCachePayload = {
  events: TrendingEvent[];
  computedAt: Date;
  windowHours: number;
  limit: number;
};

let cache: TrendingCachePayload | null = null;

const eventInclude = {
  host: {
    select: {
      id: true,
      name: true,
      profile: { select: { profileImage: true } },
    },
  },
  _count: { select: { participants: true, reviews: true } },
};

export const computeTrendingEvents = async (
  limit = DEFAULT_LIMIT,
): Promise<TrendingCachePayload> => {
  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_HOURS * 60 * 60 * 1000);

  const recentJoins = await prisma.participant.findMany({
    where: {
      joinedAt: { gte: windowStart },
      status: "APPROVED",
      event: {
        status: { in: ["OPEN", "FULL"] },
        dateTime: { gte: now },
      },
    },
    select: {
      eventId: true,
      joinedAt: true,
    },
  });

  const scoreByEvent = countJoinsInSlidingWindow(recentJoins, WINDOW_HOURS, now);
  const topScores = getTopTrendingScores(scoreByEvent, limit);

  if (topScores.length === 0) {
    const fallbackEvents = await prisma.event.findMany({
      where: {
        status: { in: ["OPEN", "FULL"] },
        dateTime: { gte: now },
      },
      include: eventInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const payload: TrendingCachePayload = {
      events: fallbackEvents.map((event) => ({
        ...event,
        trendingScore: event._count.participants,
      })),
      computedAt: now,
      windowHours: WINDOW_HOURS,
      limit,
    };

    cache = payload;
    return payload;
  }

  const eventIds = topScores.map((item) => item.eventId);
  const events = await prisma.event.findMany({
    where: { id: { in: eventIds } },
    include: eventInclude,
  });

  const eventMap = new Map(events.map((event) => [event.id, event]));
  const rankedEvents = topScores
    .map(({ eventId, score }) => {
      const event = eventMap.get(eventId);
      if (!event) return null;
      return { ...event, trendingScore: score };
    })
    .filter((event) => event !== null);

  const payload: TrendingCachePayload = {
    events: rankedEvents,
    computedAt: now,
    windowHours: WINDOW_HOURS,
    limit,
  };

  cache = payload;
  return payload;
};

export const getTrendingEvents = async (limit = DEFAULT_LIMIT) => {
  if (!cache) {
    return computeTrendingEvents(limit);
  }

  if (cache.limit >= limit) {
    return {
      ...cache,
      events: cache.events.slice(0, limit),
    };
  }

  return computeTrendingEvents(limit);
};

export const getTrendingCacheMeta = () => ({
  computedAt: cache?.computedAt ?? null,
  windowHours: WINDOW_HOURS,
  algorithm: "sliding-window + max-heap",
});
