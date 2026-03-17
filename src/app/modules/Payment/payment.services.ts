import Stripe from "stripe";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

// Temporarily disable Stripe for testing
const USE_MOCK_STRIPE = true;

const stripe = USE_MOCK_STRIPE ? null : new Stripe(config.stripe.secret_key as string);

const createPaymentIntent = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, "Event Not Found");

  if (event.joiningFee === 0) {
    throw new ApiError(400, "This event is free, no payment needed");
  }

  // Mock payment intent for testing
  if (USE_MOCK_STRIPE) {
    return {
      clientSecret: "pi_mock_client_secret_for_testing",
      amount: event.joiningFee,
      eventName: event.name,
      paymentIntentId: "pi_mock_payment_intent_id"
    };
  }

  // Real Stripe implementation
  const amount = Math.round(event.joiningFee * 100);

  const paymentIntent = await stripe!.paymentIntents.create({
    amount,
    currency: "usd",
    metadata: {
      userId,
      eventId,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    amount: event.joiningFee,
    eventName: event.name,
    paymentIntentId: paymentIntent.id
  };
};

const confirmPayment = async (paymentIntentId: string) => {
  // Mock payment confirmation for testing
  if (USE_MOCK_STRIPE || paymentIntentId.includes("mock")) {
    // For mock payments, we'll simulate success
    // In a real scenario, you'd want to validate the mock payment somehow
    return { message: "Mock payment confirmed successfully!" };
  }

  // Real Stripe implementation
  const paymentIntent = await stripe!.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    throw new ApiError(400, "Payment not completed");
  }

  const { userId, eventId } = paymentIntent.metadata;

  // already joined কিনা check
  const alreadyJoined = await prisma.participant.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (alreadyJoined) throw new ApiError(400, "Already joined this event");

  // join করো
  await prisma.participant.create({
    data: { userId, eventId, status: "APPROVED" },
  });

  return { message: "Payment confirmed and event joined successfully!" };
};

export const PaymentServices = {
  createPaymentIntent,
  confirmPayment,
};