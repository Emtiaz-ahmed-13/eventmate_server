import { DiscountType } from "../../../../generated/prisma/client";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

const calculateDiscount = (
  amount: number,
  discountType: DiscountType,
  discountValue: number,
) => {
  if (discountType === "PERCENT") {
    return Math.min(amount, (amount * discountValue) / 100);
  }
  return Math.min(amount, discountValue);
};

const validatePromoCode = async (code: string, eventId: string, userId: string) => {
  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
    include: { event: { select: { id: true, name: true, joiningFee: true } } },
  });

  if (!promo || !promo.isActive) throw new ApiError(404, "Invalid promo code");
  if (promo.eventId && promo.eventId !== eventId) {
    throw new ApiError(400, "Promo code is not valid for this event");
  }
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    throw new ApiError(400, "Promo code has expired");
  }
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    throw new ApiError(400, "Promo code usage limit reached");
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, "Event Not Found");

  const amount = event.joiningFee;
  const discountAmount = calculateDiscount(amount, promo.discountType, promo.discountValue);
  const finalAmount = Math.max(0, amount - discountAmount);

  return {
    promoCodeId: promo.id,
    code: promo.code,
    amount,
    discountAmount,
    finalAmount,
    eventName: event.name,
  };
};

const createPromoCode = async (
  hostId: string,
  payload: {
    code: string;
    eventId?: string;
    discountType: DiscountType;
    discountValue: number;
    maxUses?: number;
    expiresAt?: string;
  },
) => {
  if (payload.eventId) {
    const event = await prisma.event.findUnique({ where: { id: payload.eventId } });
    if (!event) throw new ApiError(404, "Event Not Found");
    if (event.hostId !== hostId) throw new ApiError(403, "Not authorized");
  }

  const code = payload.code.trim().toUpperCase();
  const existing = await prisma.promoCode.findUnique({ where: { code } });
  if (existing) throw new ApiError(400, "Promo code already exists");

  return prisma.promoCode.create({
    data: {
      code,
      hostId,
      eventId: payload.eventId || null,
      discountType: payload.discountType,
      discountValue: Number(payload.discountValue),
      maxUses: payload.maxUses ?? null,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
    },
  });
};

const getEventPromoCodes = async (hostId: string, eventId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, "Event Not Found");
  if (event.hostId !== hostId) throw new ApiError(403, "Not authorized");

  return prisma.promoCode.findMany({
    where: { OR: [{ eventId }, { eventId: null, hostId }] },
    orderBy: { createdAt: "desc" },
  });
};

const deletePromoCode = async (hostId: string, promoCodeId: string) => {
  const promo = await prisma.promoCode.findUnique({ where: { id: promoCodeId } });
  if (!promo) throw new ApiError(404, "Promo code not found");
  if (promo.hostId !== hostId) throw new ApiError(403, "Not authorized");

  return prisma.promoCode.update({
    where: { id: promoCodeId },
    data: { isActive: false },
  });
};

export const PromoCodeServices = {
  validatePromoCode,
  createPromoCode,
  getEventPromoCodes,
  deletePromoCode,
  calculateDiscount,
};
