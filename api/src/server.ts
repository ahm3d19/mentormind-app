import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./routes/auth";
import { classesRouter } from "./routes/classes";
import { assignmentsRouter } from "./routes/assignments";
import { authenticateToken } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware with request ID
app.use((req, res, next) => {
  const requestId = Math.random().toString(36).substring(7);
  (req as any).requestId = requestId;

  console.log(
    `[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.path}`
  );
  next();
});

// Routes
app.use("/auth", authRouter);
app.use("/classes", authenticateToken, classesRouter);
app.use("/assignments", authenticateToken, assignmentsRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Simple 404 handler without wildcard
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log("");
  console.log("📋 Available endpoints:");
  console.log("   POST /auth/login");
  console.log("   GET  /classes");
  console.log("   GET  /classes/:id/roster");
  console.log("   GET  /classes/:id/metrics");
  console.log("   POST /assignments");
  console.log("");
  console.log("👤 Demo credentials: teacher1@school.com / password");
});
