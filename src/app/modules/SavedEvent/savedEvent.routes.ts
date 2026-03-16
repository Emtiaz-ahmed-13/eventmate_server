import { Role } from "../../../../generated/prisma/client";
import express from "express";
import auth from "../../middleware/auth";
import { SavedEventControllers } from "./savedEvent.controllers";

const router = express.Router();

router.post(
  "/:id/save",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  SavedEventControllers.saveEvent,
);
router.delete(
  "/:id/unsave",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  SavedEventControllers.unsaveEvent,
);
router.get(
  "/saved",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  SavedEventControllers.getSavedEvents,
);

export const SavedEventRoutes = router;
