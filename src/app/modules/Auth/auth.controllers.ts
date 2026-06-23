import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserServices } from "../User/user.services";
import { AuthServices } from "./auth.services";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.register(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User Registered Successful.",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.login(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Login Successful.",
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await UserServices.getMyProfile(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Profile Fetched Successful.",
    data: result,
  });
});


const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  const result = await AuthServices.forgotPassword(email);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  const result = await AuthServices.resetPassword(token as string, newPassword);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const result = await AuthServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Access token refreshed successfully.",
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;

  const result = await AuthServices.logout(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

const sendLoginOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.sendLoginOtp(req.body.email);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

const verifyLoginOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.verifyLoginOtp(req.body.email, req.body.otp);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Login successful.",
    data: result,
  });
});


export const AuthControllers = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  sendLoginOtp,
  verifyLoginOtp,
};