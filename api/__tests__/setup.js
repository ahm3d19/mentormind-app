"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// Mock Prisma client globally
vitest_1.vi.mock("../src/lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: vitest_1.vi.fn(),
            findMany: vitest_1.vi.fn(),
        },
        class: {
            findMany: vitest_1.vi.fn(),
            findUnique: vitest_1.vi.fn(),
            findFirst: vitest_1.vi.fn(),
        },
        student: {
            findMany: vitest_1.vi.fn(),
        },
        assignment: {
            create: vitest_1.vi.fn(),
            findMany: vitest_1.vi.fn(),
            count: vitest_1.vi.fn(),
        },
        submission: {
            findMany: vitest_1.vi.fn(),
        },
        practiceSession: {
            findMany: vitest_1.vi.fn(),
        },
        moodCheck: {
            findMany: vitest_1.vi.fn(),
        },
    },
}));
// Create a mock auth middleware that actually sets req.user
const mockAuthMiddleware = (req, res, next) => {
    req.user = {
        userId: "user-123",
        role: "TEACHER",
        schoolId: "school-123",
    };
    next();
};
// Mock the auth middleware
vitest_1.vi.mock("../src/middleware/auth", () => ({
    authenticateToken: mockAuthMiddleware,
    AuthRequest: {},
}));
// Reset all mocks before each test
(0, vitest_1.beforeEach)(() => {
    vitest_1.vi.clearAllMocks();
});
//# sourceMappingURL=setup.js.map