import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import { generalLimiter } from "./app/middleware/rateLimiter";
const app: Application = express();
// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://eventmate-client-2.onrender.com",
    "https://eventmate-client.vercel.app",
  ],
  credentials: true,
}));

app.use(cookieParser());
app.use(generalLimiter);
//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "Backend is running successfully 🏃🏻‍♂️‍➡️",
  });
});

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
