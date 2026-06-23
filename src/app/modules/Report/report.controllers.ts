import { Request, Response } from "express";
import { ReportStatus } from "../../../../generated/prisma/client";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ReportServices } from "./report.services";

const createReport = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await ReportServices.createReport(user.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Report submitted successfully.",
    data: result,
  });
});

const getAllReports = catchAsync(async (req: Request, res: Response) => {
  const status = req.query.status as ReportStatus | undefined;
  const result = await ReportServices.getAllReports(status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reports fetched successfully.",
    data: result,
  });
});

const updateReportStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportServices.updateReportStatus(
    req.params.id as string,
    req.body.status,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Report status updated successfully.",
    data: result,
  });
});

export const ReportControllers = {
  createReport,
  getAllReports,
  updateReportStatus,
};
