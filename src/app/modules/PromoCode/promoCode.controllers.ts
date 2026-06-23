import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PromoCodeServices } from "./promoCode.services";

const validatePromoCode = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await PromoCodeServices.validatePromoCode(
    req.body.code,
    req.body.eventId,
    user.id,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Promo code applied successfully.",
    data: result,
  });
});

const createPromoCode = catchAsync(async (req: Request, res: Response) => {
  const host = (req as any).user;
  const result = await PromoCodeServices.createPromoCode(host.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Promo code created successfully.",
    data: result,
  });
});

const getEventPromoCodes = catchAsync(async (req: Request, res: Response) => {
  const host = (req as any).user;
  const result = await PromoCodeServices.getEventPromoCodes(host.id, req.params.eventId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Promo codes fetched successfully.",
    data: result,
  });
});

const deletePromoCode = catchAsync(async (req: Request, res: Response) => {
  const host = (req as any).user;
  const result = await PromoCodeServices.deletePromoCode(host.id, req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Promo code deactivated successfully.",
    data: result,
  });
});

export const PromoCodeControllers = {
  validatePromoCode,
  createPromoCode,
  getEventPromoCodes,
  deletePromoCode,
};
