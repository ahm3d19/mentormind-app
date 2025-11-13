"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const assignments_1 = require("../src/routes/assignments");
const prisma_1 = require("../src/lib/prisma");
// Create app with proper middleware
const createTestApp = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    // Add mock auth middleware
    app.use((req, res, next) => {
        req.user = {
            userId: "user-123",
            role: "TEACHER",
            schoolId: "school-123",
        };
        next();
    });
    app.use("/assignments", assignments_1.assignmentsRouter);
    return app;
};
(0, vitest_1.describe)("Assignments API", () => {
    let app;
    (0, vitest_1.beforeEach)(() => {
        app = createTestApp();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)("POST /assignments", () => {
        (0, vitest_1.it)("should create a new assignment", async () => {
            const mockClass = {
                id: "class-1",
                teacherId: "user-123",
            };
            const dueAt = new Date("2024-01-15T00:00:00.000Z");
            const mockAssignment = {
                id: "assignment-1",
                title: "Math Homework",
                topic: "Algebra",
                dueAt: dueAt,
                timeEstimateMin: 60,
                classId: "class-1",
            };
            vitest_1.vi.mocked(prisma_1.prisma.class.findFirst).mockResolvedValue(mockClass);
            vitest_1.vi.mocked(prisma_1.prisma.assignment.create).mockResolvedValue(mockAssignment);
            const response = await (0, supertest_1.default)(app).post("/assignments").send({
                classId: "class-1",
                title: "Math Homework",
                topic: "Algebra",
                dueAt: dueAt.toISOString(), // Send as ISO string
                timeEstimateMin: 60,
            });
            (0, vitest_1.expect)(response.status).toBe(201);
            // Compare individual properties instead of the whole object
            (0, vitest_1.expect)(response.body.id).toBe("assignment-1");
            (0, vitest_1.expect)(response.body.title).toBe("Math Homework");
            (0, vitest_1.expect)(response.body.topic).toBe("Algebra");
            (0, vitest_1.expect)(response.body.timeEstimateMin).toBe(60);
            (0, vitest_1.expect)(response.body.classId).toBe("class-1");
            // For date, compare the ISO string representation
            (0, vitest_1.expect)(new Date(response.body.dueAt).toISOString()).toBe(dueAt.toISOString());
            (0, vitest_1.expect)(prisma_1.prisma.class.findFirst).toHaveBeenCalledWith({
                where: {
                    id: "class-1",
                    teacherId: "user-123",
                },
            });
        });
        (0, vitest_1.it)("should return 404 when class not found", async () => {
            vitest_1.vi.mocked(prisma_1.prisma.class.findFirst).mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app)
                .post("/assignments")
                .send({
                classId: "non-existent-class",
                title: "Math Homework",
                topic: "Algebra",
                dueAt: new Date("2024-01-15T00:00:00.000Z").toISOString(),
                timeEstimateMin: 60,
            });
            (0, vitest_1.expect)(response.status).toBe(404);
            (0, vitest_1.expect)(response.body).toHaveProperty("error", "Class not found");
        });
        (0, vitest_1.it)("should validate required fields", async () => {
            const response = await (0, supertest_1.default)(app).post("/assignments").send({
                // Missing required fields
                topic: "Algebra",
            });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body).toHaveProperty("error", "Invalid input");
        });
        (0, vitest_1.it)("should validate data types", async () => {
            const response = await (0, supertest_1.default)(app).post("/assignments").send({
                classId: "class-1",
                title: "Math Homework",
                topic: "Algebra",
                dueAt: "invalid-date",
                timeEstimateMin: "not-a-number",
            });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body).toHaveProperty("error", "Invalid input");
        });
    });
});
//# sourceMappingURL=assignments.test.js.map