import express from "express";
import { AnalyticsRoutes } from "../modules/Analytics/analytics.routes";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { EventRoutes } from "../modules/Event/event.routes";
import { ReviewRoutes } from "../modules/Review/review.routes";
import { SavedEventRoutes } from "../modules/SavedEvent/savedEvent.routes";
import { UserRoutes } from "../modules/User/user.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/events",
    route: EventRoutes,
  },
  {
    path: "/reviews",
    route: ReviewRoutes,
  },
  {
    path: "/analytics",
    route: AnalyticsRoutes,
  },
  {
    path: "/events",
    route: SavedEventRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
