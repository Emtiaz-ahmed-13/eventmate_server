import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AdminServices } from "./Admin.services";


const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllUsers();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users fetched successfully.",
    data: result,
  });
});

const getAllHosts = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllHosts();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Hosts fetched successfully.",
    data: result,
  });
});

const changeUserRole = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.changeUserRole(
    req.params.id as string,
    req.body.role
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User role updated successfully.",
    data: result,
  });
});

const toggleUserBan = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.toggleUserBan(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User status updated successfully.",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.deleteUser(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllEvents();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Events fetched successfully.",
    data: result,
  });
});

const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.deleteEvent(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAdminStats();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin stats fetched successfully.",
    data: result,
  });
});

const getSystemLogs = catchAsync(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 50;
  const type = req.query.type as string | undefined;
  const result = await AdminServices.getSystemLogs(limit, type);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "System logs fetched successfully.",
    data: result,
  });
});

const getPendingHosts = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getPendingHosts();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Host list fetched successfully.",
    data: result,
  });
});

export const AdminControllers = {
  getAllUsers,
  getAllHosts,
  changeUserRole,
  toggleUserBan,
  deleteUser,
  getAllEvents,
  deleteEvent,
  getAdminStats,
  getSystemLogs,
  getPendingHosts,
};