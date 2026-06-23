import prisma from "../app/shared/prisma";
import {
  aggregateJoinStatsInWindow,
  getTopTrendingScores,
} from "./trendingHeap";

const WINDOW_HOURS = 24;
const DEFAULT_LIMIT = 10;

export type TrendingEvent = Awaited<
  ReturnType<typeof prisma.event.findMany>
>[number] & {
  trendingScore: number;
  lastJoinedAt?: Date | null;
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

export const invalidateTrendingCache = () => {
  cache = null;
};

const fetchRecentJoinFallback = async (limit: number) => {
  const recentJoins = await prisma.participant.findMany({
    where: {
      status: "APPROVED",
      event: { status: { in: ["OPEN", "FULL", "COMPLETED"] } },
    },
    orderBy: { joinedAt: "desc" },
    take: 50,
    select: {
      eventId: true,
      joinedAt: true,
    },
  });

  const seen = new Set<string>();
  const ranked: { eventId: string; lastJoinedAt: Date }[] = [];

  for (const join of recentJoins) {
    if (seen.has(join.eventId)) continue;
    seen.add(join.eventId);
    ranked.push({ eventId: join.eventId, lastJoinedAt: join.joinedAt });
    if (ranked.length >= limit) break;
  }

  if (ranked.length === 0) return [];

  const events = await prisma.event.findMany({
    where: { id: { in: ranked.map((item) => item.eventId) } },
    include: eventInclude,
  });

  const eventMap = new Map(events.map((event) => [event.id, event]));

  return ranked
    .map(({ eventId, lastJoinedAt }) => {
      const event = eventMap.get(eventId);
      if (!event) return null;
      return {
        ...event,
        trendingScore: event._count.participants,
        lastJoinedAt,
      };
    })
    .filter((event) => event !== null) as TrendingEvent[];
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
      },
    },
    select: {
      eventId: true,
      joinedAt: true,
    },
  });

  const statsByEvent = aggregateJoinStatsInWindow(recentJoins, WINDOW_HOURS, now);
  const topScores = getTopTrendingScores(statsByEvent, limit);

  if (topScores.length === 0) {
    const fallbackEvents = await fetchRecentJoinFallback(limit);

    if (fallbackEvents.length === 0) {
      const latestEvents = await prisma.event.findMany({
        where: { status: { in: ["OPEN", "FULL"] } },
        include: eventInclude,
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      const payload: TrendingCachePayload = {
        events: latestEvents.map((event) => ({
          ...event,
          trendingScore: event._count.participants,
          lastJoinedAt: null,
        })),
        computedAt: now,
        windowHours: WINDOW_HOURS,
        limit,
      };
      cache = payload;
      return payload;
    }

    const payload: TrendingCachePayload = {
      events: fallbackEvents,
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
      const stats = statsByEvent.get(eventId);
      return {
        ...event,
        trendingScore: score,
        lastJoinedAt: stats?.lastJoinedAt ?? null,
      };
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
  algorithm: "sliding-window + max-heap + recency priority",
});
