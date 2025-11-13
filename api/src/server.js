"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_1 = require("./routes/auth");
const classes_1 = require("./routes/classes");
const assignments_1 = require("./routes/assignments");
const auth_2 = require("./middleware/auth");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logging middleware with request ID
app.use((req, res, next) => {
    const requestId = Math.random().toString(36).substring(7);
    req.requestId = requestId;
    console.log(`[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.path}`);
    next();
});
// Routes
app.use("/auth", auth_1.authRouter);
app.use("/classes", auth_2.authenticateToken, classes_1.classesRouter);
app.use("/assignments", auth_2.authenticateToken, assignments_1.assignmentsRouter);
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});
// Simple 404 handler without wildcard
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});
// Error handler
app.use((err, req, res, next) => {
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
//# sourceMappingURL=server.js.map