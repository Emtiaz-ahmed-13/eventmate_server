import { describe, expect, it } from "vitest";
import {
  MaxHeap,
  aggregateJoinStatsInWindow,
  countJoinsInSlidingWindow,
  getTopTrendingScores,
} from "../utils/trendingHeap";

describe("MaxHeap", () => {
  it("returns highest scores first", () => {
    const heap = new MaxHeap();
    heap.push({ eventId: "a", score: 3 });
    heap.push({ eventId: "b", score: 10 });
    heap.push({ eventId: "c", score: 7 });

    expect(heap.extractTop(2)).toEqual([
      { eventId: "b", score: 10 },
      { eventId: "c", score: 7 },
    ]);
  });
});

describe("sliding window join counts", () => {
  it("counts only joins inside the last 24 hours", () => {
    const now = new Date("2026-06-23T12:00:00.000Z");
    const joins = [
      { eventId: "e1", joinedAt: new Date("2026-06-23T11:00:00.000Z") },
      { eventId: "e1", joinedAt: new Date("2026-06-22T11:00:00.000Z") },
      { eventId: "e2", joinedAt: new Date("2026-06-23T10:00:00.000Z") },
      { eventId: "e2", joinedAt: new Date("2026-06-21T10:00:00.000Z") },
    ];

    const counts = countJoinsInSlidingWindow(joins, 24, now);
    expect(counts.get("e1")).toBe(1);
    expect(counts.get("e2")).toBe(1);
  });

  it("tracks the most recent join per event", () => {
    const now = new Date("2026-06-23T12:00:00.000Z");
    const joins = [
      { eventId: "e1", joinedAt: new Date("2026-06-23T09:00:00.000Z") },
      { eventId: "e1", joinedAt: new Date("2026-06-23T11:30:00.000Z") },
    ];

    const stats = aggregateJoinStatsInWindow(joins, 24, now);
    expect(stats.get("e1")?.count).toBe(2);
    expect(stats.get("e1")?.lastJoinedAt.toISOString()).toBe(
      "2026-06-23T11:30:00.000Z",
    );
  });
});

describe("getTopTrendingScores", () => {
  it("prioritizes the event with the most recent join", () => {
    const stats = new Map([
      ["e1", { count: 10, lastJoinedAt: new Date("2026-06-23T08:00:00.000Z") }],
      ["e2", { count: 2, lastJoinedAt: new Date("2026-06-23T11:00:00.000Z") }],
    ]);

    expect(getTopTrendingScores(stats, 2)).toEqual([
      { eventId: "e2", score: 2 },
      { eventId: "e1", score: 10 },
    ]);
  });
});
