import { Role } from "../../../../generated/prisma/client";
import express from "express";
import auth from "../../middleware/auth";
import { upload } from "../../shared/uploader";
import { EventControllers } from "./event.controllers";

const router = express.Router();

router.get("/", EventControllers.getAllEvents);
router.get("/trending", EventControllers.getTrendingEvents);
router.get(
  "/saved",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  EventControllers.getSavedEvents,
);
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
router.get(
  "/:id/ticket/download",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  EventControllers.downloadTicket,
);
router.post(
  "/:id/invite",
  auth(Role.HOST, Role.ADMIN),
  EventControllers.inviteFriend,
);
router.get(
  "/:id/invites",
  auth(Role.HOST, Role.ADMIN),
  EventControllers.getEventInvites,
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
router.post(
  "/:id/save",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  EventControllers.saveEvent,
);
router.delete(
  "/:id/unsave",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  EventControllers.unsaveEvent,
);

// Analytics
router.get(
  "/:id/analytics",
  auth(Role.HOST, Role.ADMIN),
  EventControllers.getEventAnalytics,
);

// Duplicate
router.post(
  "/:id/duplicate",
  auth(Role.HOST, Role.ADMIN),
  EventControllers.duplicateEvent,
);

// Check-in
router.patch(
  "/:id/participants/:userId/checkin",
  auth(Role.HOST, Role.ADMIN),
  EventControllers.checkInParticipant,
);
router.patch(
  "/:id/participants/:userId/undo-checkin",
  auth(Role.HOST, Role.ADMIN),
  EventControllers.undoCheckIn,
);

router.patch(
  "/:eventId/participants/verify/:ticketId",
  auth(Role.HOST, Role.ADMIN),
  EventControllers.verifyTicket,
);

export const EventRoutes = router;
