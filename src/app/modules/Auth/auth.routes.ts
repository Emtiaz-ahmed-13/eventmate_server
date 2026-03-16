import { Role } from "../../../../generated/prisma/client";
import express from "express";
import auth from "../../middleware/auth";
import { AuthControllers } from "./auth.controllers";

const router = express.Router();

router.post("/register", AuthControllers.register);
router.post("/login", AuthControllers.login);
router.get(
  "/me",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  AuthControllers.getMe,
);
router.get("/verify-email", AuthControllers.verifyEmail);
router.post("/forgot-password", AuthControllers.forgotPassword);
router.post("/reset-password", AuthControllers.resetPassword);
router.post("/refresh-token", AuthControllers.refreshToken);
router.post(
  "/logout",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  AuthControllers.logout,
);
export const AuthRoutes = router;