import { Server } from "http";
import app from "./app.js"; 
import config from "./config/index.js";
import { NotificationServices } from "./app/modules/Notification/notification.services.js";
import { startTrendingCron } from "./utils/trendingCron.js";

let server: Server | null = null;



async function main() {
  if (!server) {
    server = app.listen(config.port, () => {
      console.log("Server is running on port ", config.port);
    });

    NotificationServices.initSocket(server);
    startTrendingCron();
  }
}

if (!process.env.VERCEL) {
  main();
}

export default app;


