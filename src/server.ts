import { Server } from "http";
import app from "./app";
import config from "./config";
import { NotificationServices } from "./app/modules/Notification/notification.services";

async function main() {
  const server: Server = app.listen(config.port, () => {
    console.log("Sever is running on port ", config.port);
  });

  // Initialize Socket.io
  NotificationServices.initSocket(server);
}

main();
