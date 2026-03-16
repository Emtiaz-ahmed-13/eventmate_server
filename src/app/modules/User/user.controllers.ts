import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserServices } from "./user.services";
import sendResponse from "../../shared/sendResponse";
import ApiError from "../../errors/ApiError";

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await UserServices.updateProfile(user.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile Updated Successful.",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await UserServices.getMyProfile(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile Fetched Successful.",
    data: result,
  });
});

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getUserProfile(req.params.id as string);

  if (!result) {
    throw new ApiError(404, "User Not Found");
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Profile Fetched Successful.",
    data: result,
  });
});

const getUserEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getUserEvents(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Events Fetched Successful.",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsers();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users Fetched Successful.",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.deleteUser(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Deleted Successful.",
    data: result,
  });
});
const updateProfileImage = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const file = req.file;

  if (!file) throw new ApiError(400, "No image provided");

  const result = await UserServices.updateProfileImage(user.id, file);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile image updated successfully.",
    data: result,
  });
});

export const UserControllers = {
  updateProfile,
  getMyProfile,
  getUserProfile,
  getUserEvents,
  getAllUsers,
  deleteUser,
  updateProfileImage
};
