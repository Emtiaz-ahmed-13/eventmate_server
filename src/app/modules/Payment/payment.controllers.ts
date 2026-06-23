import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PaymentServices } from "./payment.services";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { eventId, promoCode } = req.body;

  const result = await PaymentServices.createPaymentIntent(user.id, eventId, promoCode);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.freeJoin ? result.message : "Payment intent created successfully.",
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { paymentIntentId } = req.body;

  const result = await PaymentServices.confirmPayment(paymentIntentId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await PaymentServices.getMyPayments(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payments fetched successfully.",
    data: result,
  });
});

const getEventPayments = catchAsync(async (req: Request, res: Response) => {
  const host = (req as any).user;
  const result = await PaymentServices.getEventPayments(host.id, req.params.eventId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event payments fetched successfully.",
    data: result,
  });
});

export const PaymentControllers = {
  createPaymentIntent,
  confirmPayment,
  getMyPayments,
  getEventPayments,
};
