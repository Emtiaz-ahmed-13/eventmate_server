import cron from "node-cron";
import { computeTrendingEvents } from "./trendingCache";

export const startTrendingCron = () => {
  computeTrendingEvents().catch((err) =>
    console.error("Initial trending cache refresh failed:", err),
  );

  cron.schedule("0 * * * *", async () => {
    console.log("Running trending events cron (sliding window + max-heap)...");
    try {
      const result = await computeTrendingEvents();
      console.log(`Trending cache updated: ${result.events.length} events`);
    } catch (err) {
      console.error("Trending cron failed:", err);
    }
  });

  console.log("Trending events cron started (every hour).");
};
