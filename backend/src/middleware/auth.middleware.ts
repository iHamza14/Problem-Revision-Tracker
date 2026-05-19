/**
 * Auth Middleware — verifies JWT and loads user with platform handles
 * Updated for the new schema where handle/rating live in UserPlatformHandle
 */
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../prismac";

export interface AuthedRequest extends Request {
  user?: {
    userId: string;
    email?: string;
    // Convenience fields resolved from UserPlatformHandle
    handle?: string | null;
    leetCodeHandle?: string | null;
    handles?: { platform: string; handle: string }[];
  };
}

export const checkAuth = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = verifyToken(token); // { userId: string }

    // Load user from DB with platform handles
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        handles: {
          include: { platform: true },
        },
      },
    });

    if (!dbUser) {
      return res.status(401).json({ error: "User not found" });
    }

    // Find the Codeforces handle if linked
    const cfHandle = dbUser.handles.find(
      (h) => h.platform.name.toLowerCase() === "codeforces"
    );
    const leetCodeHandle = dbUser.handles.find(
      (h) => h.platform.name.toLowerCase() === "leetcode"
    );

    req.user = {
      userId: dbUser.id,
      email: dbUser.email,
      handle: cfHandle?.handle ?? null,
      leetCodeHandle: leetCodeHandle?.handle ?? null,
      handles: dbUser.handles.map((h) => ({
        platform: h.platform.name,
        handle: h.handle,
      })),
    };

    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
