import { Role } from "../../../../generated/prisma/client";
import express from "express";
import auth from "../../middleware/auth";
import { ReportControllers } from "./report.controllers";

const router = express.Router();

router.post("/", auth(Role.USER, Role.HOST, Role.ADMIN), ReportControllers.createReport);

export const ReportRoutes = router;

export const AdminReportRoutes = express.Router();
AdminReportRoutes.get("/", auth(Role.ADMIN), ReportControllers.getAllReports);
AdminReportRoutes.patch("/:id/status", auth(Role.ADMIN), ReportControllers.updateReportStatus);
