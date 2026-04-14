import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ChatServices } from "./chat.services";

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { eventId } = req.params;
  const { message } = req.body;

  const result = await ChatServices.sendMessage(user.id, eventId, message);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Message sent successfully.",
    data: result,
  });
});

const getEventMessages = catchAsync(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const result = await ChatServices.getEventMessages(eventId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Messages fetched successfully.",
    data: result,
  });
});

export const ChatControllers = {
  sendMessage,
  getEventMessages,
};
