/**
 * Set Handler Controller — links Codeforces handle to user
 * Updated for new schema
 */
import { Response } from "express";
import { AuthedRequest } from "../middleware/auth.middleware";
import {
  setUserHandle,
  setUserLeetCodeHandle,
} from "../services/handle.service";

export const setHandleController = async (
  req: AuthedRequest,
  res: Response
) => {
  try {
    const { handle } = req.body;
    const { userId } = req.user!;

    if (!handle) {
      return res.status(400).json({ error: "Handle is required" });
    }

    const result = await setUserHandle(userId, handle);

    return res.status(200).json({
      success: true,
      handle: result.handle,
    });
  } catch (err: any) {
    return res.status(400).json({
      error: err.message || "Failed to set handle",
    });
  }
};

export const setLeetCodeHandleController = async (
  req: AuthedRequest,
  res: Response
) => {
  try {
    const { handle, username } = req.body;
    const { userId } = req.user!;
    const leetCodeUsername = username ?? handle;

    if (!leetCodeUsername) {
      return res.status(400).json({ error: "LeetCode username is required" });
    }

    const result = await setUserLeetCodeHandle(userId, leetCodeUsername);

    return res.status(200).json({
      success: true,
      handle: result.handle,
    });
  } catch (err: any) {
    return res.status(400).json({
      error: err.message || "Failed to set LeetCode username",
    });
  }
};
