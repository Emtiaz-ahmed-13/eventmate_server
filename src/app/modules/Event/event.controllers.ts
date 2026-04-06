import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { uploadToImageKit } from "../../shared/uploader";
import { EventServices } from "./event.services";

const createEvent = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const file = req.file;
  let payload = { ...req.body };

  if (file) {
    const uploadResponse = await uploadToImageKit(file, `event_${Date.now()}`);
    payload.image = uploadResponse.url;
  }

  const result = await EventServices.createEvent(user.id, payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Event Created Successful.",
    data: result,
  });
});

const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await EventServices.getAllEvents(req.query as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Events Fetched Successful.",
    data: result,
  });
});

const getSingleEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventServices.getSingleEvent(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event Fetched Successful.",
    data: result,
  });
});

const joinEvent = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await EventServices.joinEvent(
    user.id,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Joined Event Successful.",
    data: result,
  });
});

const leaveEvent = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await EventServices.leaveEvent(
    user.id,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Left Event Successful.",
    data: result,
  });
});

const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventServices.updateEvent(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event Updated Successful.",
    data: result,
  });
});

const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventServices.deleteEvent(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event Deleted Successful.",
    data: result,
  });
});
const cancelEvent = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;

  const result = await EventServices.cancelEvent(
    req.params.id as string,
    user.id,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event Cancelled Successfully.",
    data: result,
  });
});
const getEventWaitlist = catchAsync(async (req: Request, res: Response) => {
  const result = await EventServices.getEventWaitlist(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Waitlist Fetched Successful.",
    data: result,
  });
});
const approveParticipant = catchAsync(async (req: Request, res: Response) => {
  const host = (req as any).user;
  const { eventId, userId } = req.params;

  const result = await EventServices.approveParticipant(host.id, eventId as string, userId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});
const rejectParticipant = catchAsync(async (req: Request, res: Response) => {
  const host = (req as any).user;
  const { eventId, userId } = req.params;

  const result = await EventServices.rejectParticipant(host.id, eventId as string, userId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

const saveEvent = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const eventId = req.params.id as string;

  const result = await EventServices.saveEvent(user.id, eventId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event saved successfully.",
    data: result,
  });
});

const unsaveEvent = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const eventId = req.params.id as string;

  const result = await EventServices.unsaveEvent(user.id, eventId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event removed from saved.",
    data: result,
  });
});

const getSavedEvents = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await EventServices.getSavedEvents(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Saved events fetched.",
    data: result,
  });
});

const checkInParticipant = catchAsync(async (req: Request, res: Response) => {
  const host = (req as any).user;
  const eventId = req.params.id as string;
  const userId = req.params.userId as string;

  const result = await EventServices.checkInParticipant(host.id, eventId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Participant checked in successfully.",
    data: result,
  });
});

const undoCheckIn = catchAsync(async (req: Request, res: Response) => {
  const host = (req as any).user;
  const eventId = req.params.id as string;
  const userId = req.params.userId as string;

  const result = await EventServices.undoCheckIn(host.id, eventId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Check-in undone.",
    data: result,
  });
});

const getEventAnalytics = catchAsync(async (req: Request, res: Response) => {
  const requester = (req as any).user;
  const isAdmin = requester.role === "ADMIN";
  const result = await EventServices.getEventAnalytics(requester.id, req.params.id as string, isAdmin);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event analytics fetched.",
    data: result,
  });
});

const duplicateEvent = catchAsync(async (req: Request, res: Response) => {
  const host = (req as any).user;
  const result = await EventServices.duplicateEvent(host.id, req.params.id as string);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Event duplicated successfully.",
    data: result,
  });
});

const verifyTicket = catchAsync(async (req: Request, res: Response) => {
  const host = (req as any).user;
  const { eventId, ticketId } = req.params;

  const result = await EventServices.verifyTicket(host.id, eventId, ticketId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.alreadyCheckedIn ? "Participant already checked in." : "Participant verified and checked in.",
    data: result,
  });
});

export const EventControllers = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  joinEvent,
  leaveEvent,
  updateEvent,
  deleteEvent,
  cancelEvent,
  getEventWaitlist,
  approveParticipant,
  rejectParticipant,
  saveEvent,
  unsaveEvent,
  getSavedEvents,
  checkInParticipant,
  undoCheckIn,
  getEventAnalytics,
  duplicateEvent,
  verifyTicket,
};
