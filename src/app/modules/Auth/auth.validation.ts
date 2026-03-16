import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }).min(2, "Name must be at least 2 characters"),
    email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
    password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
    role: z.enum(["USER", "HOST", "ADMIN"]).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
    password: z.string({ required_error: "Password is required" }),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
  }),
});