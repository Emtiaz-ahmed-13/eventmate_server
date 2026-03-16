import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { SavedEventServices } from "./savedEvent.services";

const saveEvent = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await SavedEventServices.saveEvent(
    user.id,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Event Saved Successfully.",
    data: result,
  });
});

const unsaveEvent = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await SavedEventServices.unsaveEvent(
    user.id,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

const getSavedEvents = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await SavedEventServices.getSavedEvents(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Saved Events Fetched Successfully.",
    data: result,
  });
});

export const SavedEventControllers = {
  saveEvent,
  unsaveEvent,
  getSavedEvents,
};
