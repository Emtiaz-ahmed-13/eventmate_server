import express from "express";
import { Role } from "../../../../generated/prisma/client";
import auth from "../../middleware/auth";
import { AdminControllers } from "./Admin.controller";


const router = express.Router();

// User Management
router.get("/users", auth(Role.ADMIN), AdminControllers.getAllUsers);
router.get("/hosts", auth(Role.ADMIN), AdminControllers.getAllHosts);
router.patch("/users/:id/role", auth(Role.ADMIN), AdminControllers.changeUserRole);
router.patch("/users/:id/ban", auth(Role.ADMIN), AdminControllers.toggleUserBan);
router.delete("/users/:id", auth(Role.ADMIN), AdminControllers.deleteUser);

// Event Management
router.get("/events", auth(Role.ADMIN), AdminControllers.getAllEvents);
router.delete("/events/:id", auth(Role.ADMIN), AdminControllers.deleteEvent);

// Stats
router.get("/stats", auth(Role.ADMIN), AdminControllers.getAdminStats);

export const AdminRoutes = router;