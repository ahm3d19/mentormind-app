"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("../src/routes/auth");
const prisma_1 = require("../src/lib/prisma");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/auth", auth_1.authRouter);
(0, vitest_1.describe)("Auth API", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)("should login with valid credentials", async () => {
        const mockUser = {
            id: "user-123",
            email: "teacher1@school.com",
            name: "John Smith",
            role: "teacher",
            schoolId: "school-1",
            school: { id: "school-1", name: "Test School" },
        };
        vitest_1.vi.mocked(prisma_1.prisma.user.findUnique).mockResolvedValue(mockUser);
        const response = await (0, supertest_1.default)(app).post("/auth/login").send({
            email: "teacher1@school.com",
            password: "password",
        });
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body).toHaveProperty("token");
        (0, vitest_1.expect)(response.body).toHaveProperty("user");
        (0, vitest_1.expect)(response.body.user.email).toBe("teacher1@school.com");
        (0, vitest_1.expect)(response.body.user.name).toBe("John Smith");
    });
    (0, vitest_1.it)("should reject invalid credentials - wrong password", async () => {
        const mockUser = {
            id: "user-123",
            email: "teacher1@school.com",
            name: "John Smith",
            role: "teacher",
            schoolId: "school-1",
        };
        vitest_1.vi.mocked(prisma_1.prisma.user.findUnique).mockResolvedValue(mockUser);
        const response = await (0, supertest_1.default)(app).post("/auth/login").send({
            email: "teacher1@school.com",
            password: "wrongpassword",
        });
        (0, vitest_1.expect)(response.status).toBe(401);
        (0, vitest_1.expect)(response.body).toHaveProperty("error", "Invalid credentials");
    });
    (0, vitest_1.it)("should reject invalid credentials - user not found", async () => {
        vitest_1.vi.mocked(prisma_1.prisma.user.findUnique).mockResolvedValue(null);
        const response = await (0, supertest_1.default)(app).post("/auth/login").send({
            email: "nonexistent@school.com",
            password: "password",
        });
        (0, vitest_1.expect)(response.status).toBe(401);
        (0, vitest_1.expect)(response.body).toHaveProperty("error", "Invalid credentials");
    });
    (0, vitest_1.it)("should validate input - invalid email", async () => {
        const response = await (0, supertest_1.default)(app).post("/auth/login").send({
            email: "invalid-email",
            password: "password",
        });
        (0, vitest_1.expect)(response.status).toBe(400);
        (0, vitest_1.expect)(response.body).toHaveProperty("error", "Invalid input");
    });
    (0, vitest_1.it)("should validate input - missing password", async () => {
        const response = await (0, supertest_1.default)(app).post("/auth/login").send({
            email: "teacher1@school.com",
            password: "",
        });
        (0, vitest_1.expect)(response.status).toBe(400);
        (0, vitest_1.expect)(response.body).toHaveProperty("error", "Invalid input");
    });
});
//# sourceMappingURL=auth.test.js.map