import nodemailer from "nodemailer";
import { Server as SocketServer } from "socket.io";
import prisma from "../../shared/prisma";

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

let io: SocketServer;

const initSocket = (server: any) => {
  io = new SocketServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join", (userId: string) => {
      socket.join(userId);
      console.log(`User ${userId} joined their notification room`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};

const sendNotification = async (payload: {
  userId: string;
  message: string;
  type: string;
  email?: string;
  subject?: string;
}) => {
  const { userId, message, type, email, subject } = payload;

  // 1. Save to Database
  const notification = await prisma.notification.create({
    data: {
      userId,
      message,
      type,
    },
  });

  // 2. Send via Socket.io (Real-time)
  if (io) {
    io.to(userId).emit("new-notification", notification);
  }

  // 3. Send via Email (if email provided)
  if (email && subject) {
    try {
      await transporter.sendMail({
        from: '"EventMate" <no-reply@eventmate.com>',
        to: email,
        subject: subject,
        text: message,
        html: `<p>${message}</p>`,
      });
    } catch (error) {
      console.error("Email sending failed:", error);
    }
  }

  return notification;
};

export const NotificationServices = {
  initSocket,
  sendNotification,
};

