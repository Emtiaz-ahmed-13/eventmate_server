import cron from "node-cron";
import prisma from "../app/shared/prisma";
import { sendEventReminderEmail } from "./sendEmail";

export const startEventReminderCron = () => {
  cron.schedule("0 9 * * *", async () => {
    console.log("Running event reminder cron job...");

    const now = new Date();

    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(now);
    tomorrowEnd.setDate(now.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const events = await prisma.event.findMany({
      where: {
        dateTime: {
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
        status: "OPEN",
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log(`Found ${events.length} events tomorrow`);

    
    for (const event of events) {
      for (const participant of event.participants) {
        await sendEventReminderEmail(
          participant.user.email,
          event.name,
          event.dateTime,
          event.location
        );
        await prisma.notification.create({
          data: {
            userId: participant.userId,
            message: `Reminder: "${event.name}" is tomorrow at ${event.location}!`,
            type: "EVENT_REMINDER",
          },
        });

        console.log(`Reminder sent to ${participant.user.email}`);
      }
    }
  });

  console.log("Event reminder cron job started!");
};