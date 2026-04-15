import express from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../../generated/prisma/client";
import { DiscussionControllers } from "./discussion.controllers";

const router = express.Router();

router.get(
  "/:eventId",
  DiscussionControllers.getEventDiscussions
);

router.post(
  "/:eventId",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  DiscussionControllers.createQuestion
);

router.patch(
  "/:discussionId/answer",
  auth(Role.HOST, Role.ADMIN),
  DiscussionControllers.answerQuestion
);

export const DiscussionRoutes = router;
