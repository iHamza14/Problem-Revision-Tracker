import { Router } from "express";
import { checkAuth } from "../middleware/auth.middleware";
import { reviseController } from "../controllers/revise.controller";
import {
  setHandleController,
  setLeetCodeHandleController,
} from "../controllers/setHandler.controller";
import { histogramController } from "../controllers/stats.controller";
import { refreshController } from "../controllers/refresh.controller";
import { runDailyCfSyncJob } from "../jobs/dailySync.job";
const router = Router();

router.post("/handle", checkAuth, setHandleController);
router.post("/handle/leetcode", checkAuth, setLeetCodeHandleController);
router.get("/revise", checkAuth, reviseController);
router.get("/stats/histogram", checkAuth, histogramController);
router.get("/refresh/user", checkAuth, refreshController);
router.post("/sync", async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  const incomingSecret = req.headers["cron-secret"];

  if (!cronSecret) {
    return res.status(500).json({ error: "CRON_SECRET is not configured" });
  }

  if (typeof incomingSecret !== "string" || incomingSecret !== cronSecret) {
    return res.status(401).end();
  }

  try {
    await runDailyCfSyncJob();
    res.json({ success: true });
  } catch (err) {
    console.error("Manual sync failed", err);
    res.status(500).json({ error: "Sync failed" });
  }
});

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});


export default router;
