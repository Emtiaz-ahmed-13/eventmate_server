import express from "express";
import { AnalyticsRoutes } from "../modules/Analytics/analytics.routes";

import { EventRoutes } from "../modules/Event/event.routes";
import { ReviewRoutes } from "../modules/Review/review.routes";
import { SavedEventRoutes } from "../modules/SavedEvent/savedEvent.routes";
import { UserRoutes } from "../modules/User/user.routes";
import { PaymentRoutes } from "../modules/Payment/payment.routes";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { AdminRoutes } from "../modules/Admin/Admin.routes";

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
  {
    path:"/payments",
    route:PaymentRoutes
  },
  {
    path:"/Admin",
    route:AdminRoutes
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
