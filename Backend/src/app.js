import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import i18n from "./config/i18n.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import incomeRoutes from "./routes/income.routes.js";
import reportRoutes from "./routes/report.routes.js";
import errorHandler from "./middlewares/error.js";

const app = express();

// middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));
app.use(i18n);

// health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/reports", reportRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: req.t("errors.notFound") });
});

// error handler
app.use(errorHandler);

export default app;   // ✅ ESM export
