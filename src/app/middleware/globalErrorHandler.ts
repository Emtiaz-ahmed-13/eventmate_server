import { NextFunction, Request, Response } from "express";

const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("DEBUG ERROR:", error);

  // Prisma unique constraint violation (P2002)
  if (error.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists.",
    });
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong",
    error: error,
  });
};

export default globalErrorHandler;
