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

    // Initialize Socket.io (only in non-serverless environment)
    if (process.env.VERCEL !== "1") {
      NotificationServices.initSocket(server);
      startEventReminderCron();
    }
  }
}

// For Vercel serverless
if (process.env.VERCEL === "1") {
  // Export the Express app for Vercel
  export default app;
} else {
  // Start server normally for local/Railway
  main();
}

