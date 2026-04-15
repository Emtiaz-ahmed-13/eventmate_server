import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { DiscussionServices } from "./discussion.services";

const createQuestion = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { eventId } = req.params;
  const { question } = req.body;

  const result = await DiscussionServices.createQuestion(user.id, eventId, question);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Question posted successfully.",
    data: result,
  });
});

const answerQuestion = catchAsync(async (req: Request, res: Response) => {
  const host = (req as any).user;
  const { discussionId } = req.params;
  const { answer } = req.body;

  const result = await DiscussionServices.answerQuestion(host.id, discussionId, answer);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Question answered successfully.",
    data: result,
  });
});

const getEventDiscussions = catchAsync(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const result = await DiscussionServices.getEventDiscussions(eventId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Discussions fetched successfully.",
    data: result,
  });
});

export const DiscussionControllers = {
  createQuestion,
  answerQuestion,
  getEventDiscussions,
};
