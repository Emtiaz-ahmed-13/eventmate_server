import express from "express";
import { Role } from "../../../../generated/prisma/client";
import auth from "../../middleware/auth";
import { PaymentControllers } from "./payment.controllers";

const router = express.Router();

router.post(
  "/create-intent",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  PaymentControllers.createPaymentIntent
);

router.post(
  "/confirm",
  auth(Role.USER, Role.HOST, Role.ADMIN),
  PaymentControllers.confirmPayment
);

router.get("/me", auth(Role.USER, Role.HOST, Role.ADMIN), PaymentControllers.getMyPayments);
router.get(
  "/event/:eventId",
  auth(Role.HOST, Role.ADMIN),
  PaymentControllers.getEventPayments,
);

export const PaymentRoutes = router;