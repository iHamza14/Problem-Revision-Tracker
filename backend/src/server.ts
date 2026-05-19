import express from "express";
import cors from "cors";
import router from "./routes/route";
import { startInternalCron } from "./scheduler/cron";
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// mount routes
app.use("/api", router);

startInternalCron();

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
export default app;
