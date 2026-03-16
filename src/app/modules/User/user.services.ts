import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import { uploadToImageKit } from "../../shared/uploader";

// ✅ reusable select object — বারবার লিখতে হবে না
const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
  // ❌ password, verifyToken, verifyTokenExpiry — বাদ
};

const updateProfile = async (userId: string, payload: any) => {
  const result = await prisma.profile.upsert({
    where: { userId },
    update: payload,
    create: {
      ...payload,
      userId,
    },
  });
  return result;
};

const getMyProfile = async (userId: string) => {
  const result = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...safeUserSelect,
      profile: true,
      hostedEvents: true,
      joinedEvents: {
        include: {
          event: true,
        },
      },
    },
  });

  if (!result) throw new ApiError(404, "User Not Found");
  return result;
};

const getUserProfile = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: { id },
    select: {
      ...safeUserSelect,
      profile: true,
      hostedEvents: {
        where: { status: "OPEN" },
      },
      reviewsReceived: true,
    },
  });

  if (!result) throw new ApiError(404, "User Not Found");
  return result;
};

const getUserEvents = async (id: string) => {
  const joined = await prisma.participant.findMany({
    where: { userId: id },
    include: {
      event: {
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const hosted = await prisma.event.findMany({
    where: { hostId: id },
  });

  return {
    joined: joined.map((p) => p.event),
    hosted,
  };
};

const getAllUsers = async () => {
  const result = await prisma.user.findMany({
    select: {
      ...safeUserSelect, // ✅ password বাদ
      profile: true,
    },
  });
  return result;
};

const deleteUser = async (id: string) => {
  const result = await prisma.$transaction(async (tx) => {
    await tx.profile.deleteMany({ where: { userId: id } });
    await tx.participant.deleteMany({ where: { userId: id } });
    return await tx.user.delete({ where: { id } });
  });
  return result;
};
const updateProfileImage = async (userId: string, file: Express.Multer.File) => {
  const uploadResponse = await uploadToImageKit(file, `profile_${userId}`);
  
  const result = await prisma.profile.upsert({
    where: { userId },
    update: { profileImage: uploadResponse.url },
    create: {
      userId,
      profileImage: uploadResponse.url,
    },
  });
  return result;
};

export const UserServices = {
  updateProfile,
  getMyProfile,
  getUserProfile,
  getUserEvents,
  getAllUsers,
  deleteUser,
  updateProfileImage
};
