"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("../src/routes/auth");
const classes_1 = require("../src/routes/classes");
const assignments_1 = require("../src/routes/assignments");
const prisma_1 = require("../src/lib/prisma");
// Create a test app with all routes and proper auth middleware
const createTestApp = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    // Auth routes don't need the middleware
    app.use("/auth", auth_1.authRouter);
    // Protected routes need the mock auth middleware
    app.use("/classes", (req, res, next) => {
        req.user = {
            userId: "user-123",
            role: "TEACHER",
            schoolId: "school-123",
        };
        next();
    }, classes_1.classesRouter);
    app.use("/assignments", (req, res, next) => {
        req.user = {
            userId: "user-123",
            role: "TEACHER",
            schoolId: "school-123",
        };
        next();
    }, assignments_1.assignmentsRouter);
    return app;
};
(0, vitest_1.describe)("Integration Tests", () => {
    let app;
    (0, vitest_1.beforeEach)(() => {
        app = createTestApp();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)("should complete full flow: login -> get classes -> create assignment", async () => {
        // Mock login
        const mockUser = {
            id: "user-123",
            email: "teacher1@school.com",
            name: "John Smith",
            role: "teacher",
            schoolId: "school-1",
            school: { id: "school-1", name: "Test School" },
        };
        vitest_1.vi.mocked(prisma_1.prisma.user.findUnique).mockResolvedValue(mockUser);
        // Login
        const loginResponse = await (0, supertest_1.default)(app).post("/auth/login").send({
            email: "teacher1@school.com",
            password: "password",
        });
        (0, vitest_1.expect)(loginResponse.status).toBe(200);
        const token = loginResponse.body.token;
        // Mock classes data
        const mockClasses = [
            {
                id: "class-1",
                name: "Math 101",
                schoolId: "school-1",
                teacherId: "user-123",
                students: [{ id: "student-1" }],
                assignments: [],
            },
        ];
        vitest_1.vi.mocked(prisma_1.prisma.class.findMany).mockResolvedValue(mockClasses);
        // Get classes (would normally use the token, but we're mocking auth)
        const classesResponse = await (0, supertest_1.default)(app).get("/classes");
        (0, vitest_1.expect)(classesResponse.status).toBe(200);
        (0, vitest_1.expect)(classesResponse.body).toHaveLength(1);
        // Mock assignment creation
        const mockClass = { id: "class-1", teacherId: "user-123" };
        const mockAssignment = {
            id: "assignment-1",
            title: "Integration Test Assignment",
            topic: "Testing",
            dueAt: new Date("2024-01-20T00:00:00.000Z"),
            timeEstimateMin: 45,
            classId: "class-1",
        };
        vitest_1.vi.mocked(prisma_1.prisma.class.findFirst).mockResolvedValue(mockClass);
        vitest_1.vi.mocked(prisma_1.prisma.assignment.create).mockResolvedValue(mockAssignment);
        // Create assignment
        const assignmentResponse = await (0, supertest_1.default)(app).post("/assignments").send({
            classId: "class-1",
            title: "Integration Test Assignment",
            topic: "Testing",
            dueAt: "2024-01-20T00:00:00.000Z",
            timeEstimateMin: 45,
        });
        (0, vitest_1.expect)(assignmentResponse.status).toBe(201);
        (0, vitest_1.expect)(assignmentResponse.body.title).toBe("Integration Test Assignment");
    });
});
//# sourceMappingURL=integration.test.js.map