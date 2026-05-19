/**
 * Handle Service — links a Codeforces handle to a user
 * Updated for new schema: uses UserPlatformHandle + Platform
 */
import { prisma } from "../prismac";
import { getUserInfo } from "./codeforces";
import { syncLast30DaysSolves } from "./cfSolveSync.service";
import { getLeetCodeUserInfo } from "./leetcode";
import { syncLast30DaysLeetCodeSolves } from "./lcSolveSync.service";

// Codeforces platform ID constant (we ensure it exists)
const CF_PLATFORM_NAME = "codeforces";
const CF_PLATFORM_URL = "https://codeforces.com";
const LEETCODE_PLATFORM_NAME = "leetcode";
const LEETCODE_PLATFORM_URL = "https://leetcode.com";

/** Ensure the Codeforces platform row exists, return its id */
async function ensureCfPlatform(): Promise<number> {
  const platform = await prisma.platform.upsert({
    where: { name: CF_PLATFORM_NAME },
    create: { name: CF_PLATFORM_NAME, url: CF_PLATFORM_URL },
    update: {},
  });
  return platform.id;
}

async function ensureLeetCodePlatform(): Promise<number> {
  const platform = await prisma.platform.upsert({
    where: { name: LEETCODE_PLATFORM_NAME },
    create: { name: LEETCODE_PLATFORM_NAME, url: LEETCODE_PLATFORM_URL },
    update: {},
  });
  return platform.id;
}

export const setUserHandle = async (userId: string, handle: string) => {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { handles: { include: { platform: true } } },
  });

  if (!currentUser) {
    throw new Error("User not found");
  }

  // Check if user already has a CF handle
  const existingCf = currentUser.handles.find(
    (h) => h.platform.name === CF_PLATFORM_NAME
  );
  if (existingCf) {
    throw new Error("Handle already set and cannot be changed");
  }

  // 1. Verify CF handle exists on Codeforces
  const cfUser = await getUserInfo(handle);
  if (!cfUser) {
    throw new Error("Codeforces handle does not exist");
  }

  // 2. Ensure platform row exists
  const platformId = await ensureCfPlatform();

  // 3. Ensure handle not already taken by another user
  const existing = await prisma.userPlatformHandle.findUnique({
    where: { platformId_handle: { platformId, handle: cfUser.handle! } },
  });
  if (existing) {
    throw new Error("Handle already linked to another user");
  }

  // 4. Create the platform handle link
  await prisma.userPlatformHandle.create({
    data: {
      userId,
      platformId,
      handle: cfUser.handle!,
    },
  });

  // 5. Fire-and-forget initial sync
  syncLast30DaysSolves(userId, cfUser.handle!, platformId);

  return { handle: cfUser.handle };
};

export const setUserLeetCodeHandle = async (
  userId: string,
  username: string
) => {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { handles: { include: { platform: true } } },
  });

  if (!currentUser) {
    throw new Error("User not found");
  }

  const existingLeetCode = currentUser.handles.find(
    (h) => h.platform.name === LEETCODE_PLATFORM_NAME
  );
  if (existingLeetCode) {
    throw new Error("LeetCode username already set and cannot be changed");
  }

  const lcUser = await getLeetCodeUserInfo(username.trim());
  const platformId = await ensureLeetCodePlatform();

  const existing = await prisma.userPlatformHandle.findUnique({
    where: {
      platformId_handle: {
        platformId,
        handle: lcUser.username,
      },
    },
  });

  if (existing) {
    throw new Error("LeetCode username already linked to another user");
  }

  await prisma.userPlatformHandle.create({
    data: {
      userId,
      platformId,
      handle: lcUser.username,
    },
  });

  syncLast30DaysLeetCodeSolves(userId, lcUser.username, platformId).catch(
    (err) => {
      console.error(`Initial LeetCode sync failed for ${lcUser.username}:`, err);
    }
  );

  return { handle: lcUser.username };
};
