import { User } from "../../../../generated/prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import {
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "../../../utils/sendEmail";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

type TLogin = {
  email: string;
  password: string;
};

type TRegister = Pick<User, "name" | "email" | "password" | "role">;

const register = async (payload: TRegister) => {
  const hashedPassword = await bcrypt.hash(payload.password, 12);

  const verifyToken = crypto.randomBytes(32).toString("hex");
  const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const result = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
      verifyToken,
      verifyTokenExpiry,
      isVerified: false,
    },
    include: {
      profile: true,
    },
  });

  await sendVerificationEmail(result.email, verifyToken);

  const { password: _, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

const login = async (payload: TLogin) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user) throw new ApiError(404, "User Not Found");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid Credentials.");

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email before logging in.");
  }

  const { password: _, ...userWithoutPassword } = user;

  const accessToken = jwtHelpers.generateToken(
    userWithoutPassword,
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string,
  );

  // ✅ login এ variable নাম আলাদা রাখা হয়েছে
  const newRefreshToken = jwtHelpers.generateToken(
    userWithoutPassword,
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string,
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: userWithoutPassword,
  };
};

const verifyEmail = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: {
      verifyToken: token,
      verifyTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) throw new ApiError(400, "Invalid or expired verification link.");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verifyToken: null,
      verifyTokenExpiry: null,
    },
  });

  return { message: "Email verified successfully!" };
};

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new ApiError(404, "No account found with this email.");

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: { resetToken, resetTokenExpiry },
  });

  await sendResetPasswordEmail(email, resetToken);

  return { message: "Password reset link sent to your email." };
};

const resetPassword = async (token: string, newPassword: string) => {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) throw new ApiError(400, "Invalid or expired reset link.");

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { message: "Password reset successful! Please login." };
};

// ✅ rename করা হয়েছে — naming conflict নেই
const refreshAccessToken = async (token: string) => {
  const decoded = jwtHelpers.verifyToken(
    token,
    config.jwt.refresh_token_secret as Secret,
  );

  if (!decoded) throw new ApiError(401, "Invalid refresh token.");

  const user = await prisma.user.findFirst({
    where: {
      id: decoded.id,
      refreshToken: token,
    },
  });

  if (!user) throw new ApiError(401, "Invalid or expired refresh token.");

  const { password: _, ...userWithoutPassword } = user;

  const newAccessToken = jwtHelpers.generateToken(
    userWithoutPassword,
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string,
  );

  return { accessToken: newAccessToken };
};

const logout = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });

  return { message: "Logged out successfully." };
};

export const AuthServices = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken: refreshAccessToken,
  logout,
};
