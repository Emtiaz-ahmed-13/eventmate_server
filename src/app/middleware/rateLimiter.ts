import { rateLimit } from "express-rate-limit";

// General API limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // 100 requests per 15 minutes
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again after 15 minutes.",
  },
});

// Auth limiter — login/register এ কড়া limit
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 requests per 15 minutes
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts, please try again after 15 minutes.",
  },
});

// Password reset limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3, // 3 requests per hour
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password reset attempts, please try again after 1 hour.",
  },
});