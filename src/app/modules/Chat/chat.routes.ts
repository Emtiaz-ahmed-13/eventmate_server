import express from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../../generated/prisma/client";
import { ChatControllers } from "./chat.controllers";

const router = express.Router();

router.post(
  "/:eventId",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  ChatControllers.sendMessage
);

router.get(
  "/:eventId",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  ChatControllers.getEventMessages
);

export const ChatRoutes = router;
