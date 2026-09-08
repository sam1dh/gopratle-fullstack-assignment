import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { requestId } from "./middleware/request-id.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import healthRoutes from "./routes/health.routes.js";
import requirementRoutes from "./routes/requirement.routes.js";
import { getEnv } from "./config/env.js";

const app: Express = express();

app.use(helmet());
app.use(requestId);
app.use(
  cors({
    origin(origin, callback) {
      const env = getEnv();
      const allowed = [env.FRONTEND_URL];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/requirements", requirementRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
