import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { ReviewServices } from "./review.services";
import sendResponse from "../../shared/sendResponse";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await ReviewServices.createReview(user.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review Posted Successful.",
    data: result,
  });
});

const getHostReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewServices.getHostReviews(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews Fetched Successful.",
    data: result,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 6;
  const result = await ReviewServices.getAllReviews(limit);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews Fetched Successful.",
    data: result,
  });
});

export const ReviewControllers = {
  createReview,
  getHostReviews,
  getAllReviews,
};
