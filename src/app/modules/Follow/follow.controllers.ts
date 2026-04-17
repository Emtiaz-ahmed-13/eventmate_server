import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { FollowServices } from "./follow.services";

const followHost = catchAsync(async (req: Request, res: Response) => {
  const followerId = (req as any).user.id;
  const { hostId } = req.params;

  const result = await FollowServices.followHost(followerId, hostId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Host followed successfully.",
    data: result,
  });
});

const unfollowHost = catchAsync(async (req: Request, res: Response) => {
  const followerId = (req as any).user.id;
  const { hostId } = req.params;

  const result = await FollowServices.unfollowHost(followerId, hostId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Host unfollowed successfully.",
    data: result,
  });
});

const getHostFollowers = catchAsync(async (req: Request, res: Response) => {
  const { hostId } = req.params;
  const result = await FollowServices.getHostFollowers(hostId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Followers fetched successfully.",
    data: result,
  });
});

const getFollowingHosts = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await FollowServices.getFollowingHosts(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Following hosts fetched successfully.",
    data: result,
  });
});

export const FollowControllers = {
  followHost,
  unfollowHost,
  getHostFollowers,
  getFollowingHosts,
};
