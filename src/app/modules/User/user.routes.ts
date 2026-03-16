import express from "express";
import { UserControllers } from "./user.controllers";
import auth from "../../middleware/auth";
import { Role } from "../../../../generated/prisma/client";
import { upload } from "../../shared/uploader";
const router = express.Router();

router.get("/me", auth(Role.USER, Role.HOST, Role.ADMIN), UserControllers.getMyProfile);
router.patch("/update-profile", auth(Role.USER, Role.HOST, Role.ADMIN), UserControllers.updateProfile);
router.get("/", auth(Role.ADMIN), UserControllers.getAllUsers);
router.delete("/:id", auth(Role.ADMIN), UserControllers.deleteUser);
router.get("/:id", UserControllers.getUserProfile);
router.get("/:id/events", UserControllers.getUserEvents);
router.patch(
  "/update-profile-image",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  upload.single("image"),
  UserControllers.updateProfileImage
);

export const UserRoutes = router;
