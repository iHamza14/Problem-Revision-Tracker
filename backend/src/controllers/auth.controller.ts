/**
 * Auth Controller — handles Google OAuth callback, me, and logout
 * Updated: /me returns handle from UserPlatformHandle + CF rating via API
 */
import { Request, Response } from "express";
import { googleOAuthLogin } from "../services/oauth.services";
import { AuthedRequest } from "../middleware/auth.middleware";
import { CodeforcesUser, CodeforcesResponse } from "../types/codeforces";
import { getLeetCodeContestRanking } from "../services/leetcode";

export const googleCallbackController = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).send("Missing OAuth code");
    }

    const { user, token } = await googleOAuthLogin(code);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.redirect(
      new URL("/auth/finish", process.env.FRONTEND_URL!).toString()
    );
  } catch (err) {
    console.error("Google OAuth error:", err);
    return res.status(401).send("Google OAuth failed");
  }
};

/** GET /auth/me — returns user info with handle and live CF rating */
export const meController = async (req: AuthedRequest, res: Response) => {
  const { userId, email, handle, leetCodeHandle, handles } = req.user!;

  // If user has a CF handle, fetch live rating from CF API
  let rating: number | null = null;
  let leetCodeRating: number | null = null;
  if (handle) {
    try {
      const cfRes = await fetch(
        `https://codeforces.com/api/user.info?handles=${handle}`
      );
      const cfData = (await cfRes.json()) as CodeforcesResponse<CodeforcesUser>;
      if (cfData.status === "OK" && cfData.result.length > 0) {
        rating = cfData.result[0].rating ?? null;
      }
    } catch {
      // CF API might be down, return null rating
    }
  }

  if (leetCodeHandle) {
    try {
      const ranking = await getLeetCodeContestRanking(leetCodeHandle);
      leetCodeRating =
        ranking && ranking.attendedContestsCount > 0
          ? Math.round(ranking.rating)
          : null;
    } catch {
      // LeetCode API might be down, return null rating
    }
  }

  return res.json({
    userId,
    email,
    handle,
    leetCodeHandle,
    handles,
    rating,
    leetCodeRating,
  });
};

export const logoutController = (_req: AuthedRequest, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  return res.sendStatus(200);
};
