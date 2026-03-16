import { Server } from "http";
import app from "./app";
import config from "./config";
import { NotificationServices } from "./app/modules/Notification/notification.services";
import { startEventReminderCron } from "./utils/eventReminder";

let server: Server | null = null;

async function main() {
  if (!server) {
    server = app.listen(config.port, () => {
      console.log("Server is running on port ", config.port);
    });

    NotificationServices.initSocket(server);
    startEventReminderCron();
  }
}

// Only start server in non-Vercel environment
if (!process.env.VERCEL) {
  main();
}

export default app;


