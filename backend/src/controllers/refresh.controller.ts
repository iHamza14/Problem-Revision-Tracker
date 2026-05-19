/**
 * Refresh Controller — re-syncs user's CF data
 * Updated for new schema: reads handle from UserPlatformHandle
 */
import { Response } from "express";
import { AuthedRequest } from "../middleware/auth.middleware";
import { prisma } from "../prismac";
import { CodeforcesUser, CodeforcesResponse } from "../types/codeforces";
import { syncLast30DaysSolves } from "../services/cfSolveSync.service";
import { syncLast30DaysLeetCodeSolves } from "../services/lcSolveSync.service";
import { getLeetCodeContestRanking } from "../services/leetcode";

export const refreshController = async (req: AuthedRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user || (!user.handle && !user.leetCodeHandle)) {
      return res.status(400).json({ error: "Handle not set" });
    }

    let rating: number | null = null;
    let leetCodeRating: number | null = null;
    let cfHandle: string | null = user.handle ?? null;

    // Find the codeforces platform ID
    const cfPlatform = await prisma.platform.findUnique({
      where: { name: "codeforces" },
    });

    if (user.handle && cfPlatform) {
      const cfRes = await fetch(
        `https://codeforces.com/api/user.info?handles=${user.handle}`
      );

      const cfData = (await cfRes.json()) as CodeforcesResponse<CodeforcesUser>;

      if (cfData.status !== "OK") {
        return res.status(400).json({ error: "Failed to fetch CF data" });
      }

      const cfUser = cfData.result[0];
      rating = cfUser.rating ?? null;
      cfHandle = cfUser.handle ?? user.handle;

      await syncLast30DaysSolves(user.userId, user.handle, cfPlatform.id);
    }

    const lcPlatform = await prisma.platform.findUnique({
      where: { name: "leetcode" },
    });

    if (user.leetCodeHandle && lcPlatform) {
      const ranking = await getLeetCodeContestRanking(user.leetCodeHandle);
      leetCodeRating =
        ranking && ranking.attendedContestsCount > 0
          ? Math.round(ranking.rating)
          : null;

      await syncLast30DaysLeetCodeSolves(
        user.userId,
        user.leetCodeHandle,
        lcPlatform.id
      );
    }

    console.log("synced");
    return res.json({
      success: true,
      rating,
      leetCodeRating,
      handle: cfHandle,
      leetCodeHandle: user.leetCodeHandle ?? null,
    });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
