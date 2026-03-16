import { Role } from "../../../../generated/prisma/client";
import express from "express";
import auth from "../../middleware/auth";
import { upload } from "../../shared/uploader";
import { EventControllers } from "./event.controllers";

const router = express.Router();

router.get("/", EventControllers.getAllEvents);
router.get("/:id", EventControllers.getSingleEvent);

router.post(
  "/",
  auth(Role.HOST, Role.ADMIN),
  upload.single("image"),
  EventControllers.createEvent,
);
router.patch("/:id", auth(Role.HOST, Role.ADMIN), EventControllers.updateEvent);
router.delete(
  "/:id",
  auth(Role.HOST, Role.ADMIN),
  EventControllers.deleteEvent,
);
router.post(
  "/:id/join",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  EventControllers.joinEvent,
);
router.delete(
  "/:id/leave",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  EventControllers.leaveEvent,
);
router.patch(
  "/:id/cancel",
  auth(Role.HOST, Role.ADMIN),
  EventControllers.cancelEvent,
);
router.get(
  "/:id/waitlist",
  auth(Role.HOST, Role.ADMIN),
  EventControllers.getEventWaitlist,
);
router.patch(
  "/:eventId/participants/:userId/approve",
  auth(Role.HOST, Role.ADMIN),
  EventControllers.approveParticipant
);
router.patch(
  "/:eventId/participants/:userId/reject",
  auth(Role.HOST, Role.ADMIN),
  EventControllers.rejectParticipant
);

export const EventRoutes = router;
