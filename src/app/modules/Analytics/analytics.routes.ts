import express from "express";
import { AnalyticsControllers } from "./analytics.controllers";
import auth from "../../middleware/auth";
import { Role } from "@prisma/client";

const router = express.Router();

router.get("/overview", auth(Role.ADMIN), AnalyticsControllers.getOverviewStats);

export const AnalyticsRoutes = router;
