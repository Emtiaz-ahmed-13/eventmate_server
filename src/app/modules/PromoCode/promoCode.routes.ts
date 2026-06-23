import { Role } from "../../../../generated/prisma/client";
import express from "express";
import auth from "../../middleware/auth";
import { PromoCodeControllers } from "./promoCode.controllers";

const router = express.Router();

router.post("/validate", auth(Role.USER, Role.HOST, Role.ADMIN), PromoCodeControllers.validatePromoCode);
router.post("/", auth(Role.HOST, Role.ADMIN), PromoCodeControllers.createPromoCode);
router.get("/event/:eventId", auth(Role.HOST, Role.ADMIN), PromoCodeControllers.getEventPromoCodes);
router.delete("/:id", auth(Role.HOST, Role.ADMIN), PromoCodeControllers.deletePromoCode);

export const PromoCodeRoutes = router;
