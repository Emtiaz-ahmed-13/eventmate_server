import prisma from "../../shared/prisma";
import ApiError from "../../errors/ApiError";

const followHost = async (followerId: string, hostId: string) => {
  if (followerId === hostId) throw new ApiError(400, "You cannot follow yourself");

  return await prisma.follower.create({
    data: {
      followerId,
      hostId,
    },
  });
};

const unfollowHost = async (followerId: string, hostId: string) => {
  return await prisma.follower.delete({
    where: {
      followerId_hostId: {
        followerId,
        hostId,
      },
    },
  });
};

const getHostFollowers = async (hostId: string) => {
  return await prisma.follower.findMany({
    where: { hostId },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: {
              profileImage: true,
            },
          },
        },
      },
    },
  });
};

const getFollowingHosts = async (userId: string) => {
  return await prisma.follower.findMany({
    where: { followerId: userId },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          profile: {
            select: {
              profileImage: true,
            },
          },
        },
      },
    },
  });
};

export const FollowServices = {
  followHost,
  unfollowHost,
  getHostFollowers,
  getFollowingHosts,
};
