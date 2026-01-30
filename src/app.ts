import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import standardsRoutes from "./modules/standards/standards.routes";
import weightFlocksRoutes from "./modules/weight/flocks/weightFlocks.routes";
import productionFlocksRoutes from "./modules/production/flocks/productionFlocks.routes";
import productionFarmsRoutes from "./modules/production/farms/productionFarms.routes";
import productionProductsRoutes from "./modules/production/products/productionProducts.routes";
import productionPlanningRoutes from "./modules/production/planning/productionPlanning.routes";
import adminUsersRoutes from "./modules/admin/users/adminUsers.routes";
import adminWeightFlocksRoutes from "./modules/admin/weight/adminWeightFlocks.routes";
import adminProductionFlocksRoutes from "./modules/admin/production/adminProductionFlocks.routes";
import adminStandardsRoutes from "./modules/admin/standards/adminStandards.routes";
import weightProductsRoutes from "./modules/weight/products/weightProducts.routes";
import weightUniformityRoutes from "./modules/weight/uniformity/weightUniformity.routes";

const app: Application = express();

app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      message: "Too many requests from this IP, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/standards", standardsRoutes);
app.use("/api/weight/flocks", weightFlocksRoutes);
app.use("/api/weight/products", weightProductsRoutes);
app.use("/api/weight/uniformity", weightUniformityRoutes);
app.use("/api/production/farms", productionFarmsRoutes);
app.use("/api/production/flocks", productionFlocksRoutes);
app.use("/api/production/products", productionProductsRoutes);
app.use("/api/production/planning", productionPlanningRoutes);

// Admin routes
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/admin/weight/flocks", adminWeightFlocksRoutes);
app.use("/api/admin/production/flocks", adminProductionFlocksRoutes);
app.use("/api/admin/standards", adminStandardsRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
