import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { AnalyticsServices } from "./analytics.services";
import sendResponse from "../../shared/sendResponse";

const getOverviewStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsServices.getOverviewStats();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Analytics data fetched successfully",
    data: result,
  });
});

export const AnalyticsControllers = {
  getOverviewStats,
};
