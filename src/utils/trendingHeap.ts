export type TrendingScore = {
  eventId: string;
  score: number;
};

export class MaxHeap {
  private heap: TrendingScore[] = [];

  get size() {
    return this.heap.length;
  }

  push(entry: TrendingScore) {
    this.heap.push(entry);
    this.bubbleUp(this.heap.length - 1);
  }

  peek(): TrendingScore | undefined {
    return this.heap[0];
  }

  /** Remove and return the maximum element. */
  pop(): TrendingScore | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const max = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return max;
  }

  /** Extract top K entries sorted by score descending. */
  extractTop(k: number): TrendingScore[] {
    const copy = new MaxHeap();
    copy.heap = this.heap.map((item) => ({ ...item }));
    const result: TrendingScore[] = [];

    for (let i = 0; i < k && copy.size > 0; i++) {
      const item = copy.pop();
      if (item) result.push(item);
    }

    return result;
  }

  buildFromEntries(entries: TrendingScore[]) {
    this.heap = [];
    for (const entry of entries) {
      this.push(entry);
    }
  }

  private bubbleUp(index: number) {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.heap[current].score <= this.heap[parent].score) break;
      this.swap(current, parent);
      current = parent;
    }
  }

  private bubbleDown(index: number) {
    let current = index;
    const length = this.heap.length;

    while (true) {
      const left = current * 2 + 1;
      const right = current * 2 + 2;
      let largest = current;

      if (left < length && this.heap[left].score > this.heap[largest].score) {
        largest = left;
      }
      if (right < length && this.heap[right].score > this.heap[largest].score) {
        largest = right;
      }
      if (largest === current) break;
      this.swap(current, largest);
      current = largest;
    }
  }

  private swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}

export type JoinRecord = {
  eventId: string;
  joinedAt: Date;
};

const HOUR_MS = 60 * 60 * 1000;

export const countJoinsInSlidingWindow = (
  joins: JoinRecord[],
  windowHours: number,
  now: Date = new Date(),
): Map<string, number> => {
  const windowStart = new Date(now.getTime() - windowHours * HOUR_MS);
  const counts = new Map<string, number>();

  for (const join of joins) {
    if (join.joinedAt >= windowStart && join.joinedAt <= now) {
      counts.set(join.eventId, (counts.get(join.eventId) ?? 0) + 1);
    }
  }

  return counts;
};

export const getTopTrendingScores = (
  scoreByEvent: Map<string, number>,
  limit = 10,
): TrendingScore[] => {
  const heap = new MaxHeap();
  for (const [eventId, score] of scoreByEvent) {
    if (score > 0) heap.push({ eventId, score });
  }
  return heap.extractTop(limit);
};
