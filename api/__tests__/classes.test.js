"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const classes_1 = require("../src/routes/classes");
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
    app.use("/classes", classes_1.classesRouter);
    return app;
};
(0, vitest_1.describe)("Classes API", () => {
    let app;
    (0, vitest_1.beforeEach)(() => {
        app = createTestApp();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)("GET /classes", () => {
        (0, vitest_1.it)("should return classes for authenticated teacher", async () => {
            const mockClasses = [
                {
                    id: "class-1",
                    name: "Math 101",
                    schoolId: "school-1",
                    teacherId: "user-123",
                    students: [{ id: "student-1" }, { id: "student-2" }],
                    assignments: [{ id: "assignment-1" }],
                },
                {
                    id: "class-2",
                    name: "Science 201",
                    schoolId: "school-1",
                    teacherId: "user-123",
                    students: [{ id: "student-3" }],
                    assignments: [],
                },
            ];
            vitest_1.vi.mocked(prisma_1.prisma.class.findMany).mockResolvedValue(mockClasses);
            const response = await (0, supertest_1.default)(app).get("/classes");
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toEqual([
                {
                    id: "class-1",
                    name: "Math 101",
                    schoolId: "school-1",
                    teacherId: "user-123",
                    studentCount: 2,
                    assignmentCount: 1,
                },
                {
                    id: "class-2",
                    name: "Science 201",
                    schoolId: "school-1",
                    teacherId: "user-123",
                    studentCount: 1,
                    assignmentCount: 0,
                },
            ]);
            // Verify the correct query was made
            (0, vitest_1.expect)(prisma_1.prisma.class.findMany).toHaveBeenCalledWith({
                where: {
                    teacherId: "user-123",
                },
                include: {
                    students: {
                        select: { id: true },
                    },
                    assignments: {
                        select: { id: true },
                    },
                },
            });
        });
        (0, vitest_1.it)("should handle database errors", async () => {
            vitest_1.vi.mocked(prisma_1.prisma.class.findMany).mockRejectedValue(new Error("DB error"));
            const response = await (0, supertest_1.default)(app).get("/classes");
            (0, vitest_1.expect)(response.status).toBe(500);
            (0, vitest_1.expect)(response.body).toHaveProperty("error", "Internal server error");
        });
    });
    (0, vitest_1.describe)("GET /classes/:id/roster", () => {
        (0, vitest_1.it)("should return class roster", async () => {
            const mockClass = {
                id: "class-1",
                name: "Math 101",
                teacherId: "user-123",
            };
            const mockStudents = [
                { id: "student-1", name: "Alice Johnson", email: "alice@student.com" },
                { id: "student-2", name: "Bob Williams", email: "bob@student.com" },
            ];
            vitest_1.vi.mocked(prisma_1.prisma.class.findFirst).mockResolvedValue(mockClass);
            vitest_1.vi.mocked(prisma_1.prisma.student.findMany).mockResolvedValue(mockStudents);
            const response = await (0, supertest_1.default)(app).get("/classes/class-1/roster");
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toEqual(mockStudents);
            (0, vitest_1.expect)(prisma_1.prisma.class.findFirst).toHaveBeenCalledWith({
                where: {
                    id: "class-1",
                    teacherId: "user-123",
                },
            });
        });
        (0, vitest_1.it)("should return 404 for non-existent class", async () => {
            vitest_1.vi.mocked(prisma_1.prisma.class.findFirst).mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app).get("/classes/non-existent/roster");
            (0, vitest_1.expect)(response.status).toBe(404);
            (0, vitest_1.expect)(response.body).toHaveProperty("error", "Class not found");
        });
    });
    (0, vitest_1.describe)("GET /classes/:id/assignments", () => {
        (0, vitest_1.it)("should return class assignments", async () => {
            const mockClass = {
                id: "class-1",
                name: "Math 101",
                teacherId: "user-123",
            };
            const mockAssignments = [
                {
                    id: "assignment-1",
                    title: "Algebra Basics",
                    topic: "Linear Equations",
                    dueAt: new Date("2024-01-15"),
                    timeEstimateMin: 60,
                },
            ];
            vitest_1.vi.mocked(prisma_1.prisma.class.findFirst).mockResolvedValue(mockClass);
            vitest_1.vi.mocked(prisma_1.prisma.assignment.findMany).mockResolvedValue(mockAssignments);
            const response = await (0, supertest_1.default)(app).get("/classes/class-1/assignments");
            (0, vitest_1.expect)(response.status).toBe(200);
            // Convert the mock assignments to include serialized dates for comparison
            const expectedAssignments = mockAssignments.map((assignment) => ({
                ...assignment,
                dueAt: assignment.dueAt.toISOString(), // Convert Date to ISO string
            }));
            (0, vitest_1.expect)(response.body).toEqual(expectedAssignments);
        });
        (0, vitest_1.it)("should return 404 for non-existent class", async () => {
            vitest_1.vi.mocked(prisma_1.prisma.class.findFirst).mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app).get("/classes/non-existent/assignments");
            (0, vitest_1.expect)(response.status).toBe(404);
            (0, vitest_1.expect)(response.body).toHaveProperty("error", "Class not found");
        });
        (0, vitest_1.it)("should handle database errors", async () => {
            vitest_1.vi.mocked(prisma_1.prisma.class.findFirst).mockResolvedValue({
                id: "class-1",
                name: "Math 101",
                teacherId: "user-123",
            });
            vitest_1.vi.mocked(prisma_1.prisma.assignment.findMany).mockRejectedValue(new Error("DB error"));
            const response = await (0, supertest_1.default)(app).get("/classes/class-1/assignments");
            (0, vitest_1.expect)(response.status).toBe(500);
            (0, vitest_1.expect)(response.body).toHaveProperty("error", "Internal server error");
        });
    });
});
//# sourceMappingURL=classes.test.js.map