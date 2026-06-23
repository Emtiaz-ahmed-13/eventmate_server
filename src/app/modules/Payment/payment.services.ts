import Stripe from "stripe";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import { PromoCodeServices } from "../PromoCode/promoCode.services";

const stripe = new Stripe(config.stripe.secret_key as string);

const createPaymentIntent = async (
  userId: string,
  eventId: string,
  promoCode?: string,
) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, "Event Not Found");

  if (event.joiningFee === 0) {
    throw new ApiError(400, "This event is free, no payment needed");
  }

  let amount = event.joiningFee;
  let discountAmount = 0;
  let promoCodeId: string | null = null;

  if (promoCode) {
    const promoResult = await PromoCodeServices.validatePromoCode(promoCode, eventId, userId);
    discountAmount = promoResult.discountAmount;
    promoCodeId = promoResult.promoCodeId;
    amount = promoResult.finalAmount;
  }

  if (amount === 0) {
    const alreadyJoined = await prisma.participant.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    if (alreadyJoined) throw new ApiError(400, "Already joined this event");

    await prisma.$transaction(async (tx) => {
      await tx.participant.create({
        data: { userId, eventId, status: "APPROVED" },
      });

      if (promoCodeId) {
        await tx.promoCode.update({
          where: { id: promoCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.payment.create({
        data: {
          userId,
          eventId,
          amount: event.joiningFee,
          discountAmount,
          finalAmount: 0,
          stripePaymentId: `free-promo-${userId}-${eventId}-${Date.now()}`,
          promoCodeId,
          status: "SUCCEEDED",
        },
      });
    });

    return {
      freeJoin: true,
      amount: 0,
      eventName: event.name,
      message: "Promo code applied. Event joined for free!",
    };
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    metadata: {
      userId,
      eventId,
      originalAmount: String(event.joiningFee),
      discountAmount: String(discountAmount),
      promoCodeId: promoCodeId || "",
    },
  });

  await prisma.payment.create({
    data: {
      userId,
      eventId,
      amount: event.joiningFee,
      discountAmount,
      finalAmount: amount,
      stripePaymentId: paymentIntent.id,
      promoCodeId,
      status: "PENDING",
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    amount,
    originalAmount: event.joiningFee,
    discountAmount,
    eventName: event.name,
    paymentIntentId: paymentIntent.id,
  };
};

const confirmPayment = async (paymentIntentId: string) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    await prisma.payment.updateMany({
      where: { stripePaymentId: paymentIntentId },
      data: { status: "FAILED" },
    });
    throw new ApiError(400, "Payment not completed");
  }

  const { userId, eventId, promoCodeId } = paymentIntent.metadata;

  const alreadyJoined = await prisma.participant.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (alreadyJoined) {
    await prisma.payment.updateMany({
      where: { stripePaymentId: paymentIntentId },
      data: { status: "SUCCEEDED" },
    });
    return { message: "Payment already confirmed." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.participant.create({
      data: { userId, eventId, status: "APPROVED" },
    });

    await tx.payment.updateMany({
      where: { stripePaymentId: paymentIntentId },
      data: { status: "SUCCEEDED" },
    });

    if (promoCodeId) {
      await tx.promoCode.update({
        where: { id: promoCodeId },
        data: { usedCount: { increment: 1 } },
      });
    }

    const user = await tx.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (user?.email) {
      await tx.eventInvite.updateMany({
        where: { eventId, email: user.email, status: "SENT" },
        data: { status: "ACCEPTED" },
      });
    }
  });

  return { message: "Payment confirmed and event joined successfully!" };
};

const getMyPayments = async (userId: string) => {
  return prisma.payment.findMany({
    where: { userId },
    include: {
      event: { select: { id: true, name: true, dateTime: true, location: true } },
      promoCode: { select: { code: true, discountType: true, discountValue: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getEventPayments = async (hostId: string, eventId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, "Event Not Found");
  if (event.hostId !== hostId) throw new ApiError(403, "Not authorized");

  return prisma.payment.findMany({
    where: { eventId, status: "SUCCEEDED" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      promoCode: { select: { code: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const PaymentServices = {
  createPaymentIntent,
  confirmPayment,
  getMyPayments,
  getEventPayments,
};
