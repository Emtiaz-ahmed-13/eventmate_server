import express from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../../generated/prisma/client";
import { FollowControllers } from "./follow.controllers";

const router = express.Router();

router.post(
  "/:hostId/follow",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  FollowControllers.followHost
);

router.delete(
  "/:hostId/unfollow",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  FollowControllers.unfollowHost
);

router.get(
  "/:hostId/followers",
  FollowControllers.getHostFollowers
);

router.get(
  "/following",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  FollowControllers.getFollowingHosts
);

export const FollowRoutes = router;
