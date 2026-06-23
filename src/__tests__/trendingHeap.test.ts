import { describe, expect, it } from "vitest";
import {
  MaxHeap,
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
});

describe("getTopTrendingScores", () => {
  it("returns top K events by join count", () => {
    const scores = new Map([
      ["e1", 5],
      ["e2", 12],
      ["e3", 8],
      ["e4", 1],
    ]);

    expect(getTopTrendingScores(scores, 3)).toEqual([
      { eventId: "e2", score: 12 },
      { eventId: "e3", score: 8 },
      { eventId: "e1", score: 5 },
    ]);
  });
});
