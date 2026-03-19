import express from "express";
import { ReviewControllers } from "./review.controllers";
import auth from "../../middleware/auth";
import { Role } from "../../../../generated/prisma/client";

const router = express.Router();

router.get("/", ReviewControllers.getAllReviews);
router.get("/host/:id", ReviewControllers.getHostReviews);
router.post("/", auth(Role.USER, Role.HOST, Role.ADMIN), ReviewControllers.createReview);

export const ReviewRoutes = router;
