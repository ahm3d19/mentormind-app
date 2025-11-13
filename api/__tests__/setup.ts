import { vi, beforeEach } from "vitest";

// Mock Prisma client globally
vi.mock("../src/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    class: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    student: {
      findMany: vi.fn(),
    },
    assignment: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    submission: {
      findMany: vi.fn(),
    },
    practiceSession: {
      findMany: vi.fn(),
    },
    moodCheck: {
      findMany: vi.fn(),
    },
  },
}));

// Create a mock auth middleware that actually sets req.user
const mockAuthMiddleware = (req: any, res: any, next: any) => {
  req.user = {
    userId: "user-123",
    role: "TEACHER",
    schoolId: "school-123",
  };
  next();
};

// Mock the auth middleware
vi.mock("../src/middleware/auth", () => ({
  authenticateToken: mockAuthMiddleware,
  AuthRequest: {},
}));

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
