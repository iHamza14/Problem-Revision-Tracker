/**
 * Daily Sync Job — syncs last 24h of CF solves for all users
 * Updated for new schema: reads handle from UserPlatformHandle
 */
import { prisma } from "../prismac";
import { syncLast24HoursSolves } from "../services/cfSolveSync.service";
import { syncLast24HoursLeetCodeSolves } from "../services/lcSolveSync.service";

const CONCURRENCY = 5;

export async function runDailyCfSyncJob() {
  console.log("Starting daily platform sync...");

  // Find the codeforces platform
  const cfPlatform = await prisma.platform.findUnique({
    where: { name: "codeforces" },
  });

  if (!cfPlatform) {
    console.log("No codeforces platform found, skipping sync.");
  } else {
    await syncPlatformHandles(cfPlatform.id, "Codeforces", (userId, handle) =>
      syncLast24HoursSolves(userId, handle, cfPlatform.id)
    );
  }

  const lcPlatform = await prisma.platform.findUnique({
    where: { name: "leetcode" },
  });

  if (!lcPlatform) {
    console.log("No leetcode platform found, skipping sync.");
  } else {
    await syncPlatformHandles(lcPlatform.id, "LeetCode", (userId, handle) =>
      syncLast24HoursLeetCodeSolves(userId, handle, lcPlatform.id)
    );
  }

  console.log("Daily platform sync complete.");
}

async function syncPlatformHandles(
  platformId: number,
  label: string,
  syncFn: (userId: string, handle: string) => Promise<void>
) {
  const handles = await prisma.userPlatformHandle.findMany({
    where: { platformId },
    select: { userId: true, handle: true },
  });

  let index = 0;

  async function worker() {
    while (index < handles.length) {
      const current = handles[index++];
      try {
        await syncFn(current.userId, current.handle);
        console.log(`Synced ${label} ${current.handle}`);
      } catch (err) {
        console.error(`Failed for ${label} ${current.handle}`, err);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
}
