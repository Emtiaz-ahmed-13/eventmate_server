import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PaymentServices } from "./payment.services";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { eventId } = req.body;

  const result = await PaymentServices.createPaymentIntent(user.id, eventId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment intent created successfully.",
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

export const PaymentControllers = {
  createPaymentIntent,
  confirmPayment,
};