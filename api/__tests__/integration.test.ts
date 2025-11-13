import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { authRouter } from "../src/routes/auth";
import { classesRouter } from "../src/routes/classes";
import { assignmentsRouter } from "../src/routes/assignments";
import { prisma } from "../src/lib/prisma";

// Create a test app with all routes and proper auth middleware
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Auth routes don't need the middleware
  app.use("/auth", authRouter);

  // Protected routes need the mock auth middleware
  app.use(
    "/classes",
    (req, res, next) => {
      req.user = {
        userId: "user-123",
        role: "TEACHER",
        schoolId: "school-123",
      };
      next();
    },
    classesRouter
  );

  app.use(
    "/assignments",
    (req, res, next) => {
      req.user = {
        userId: "user-123",
        role: "TEACHER",
        schoolId: "school-123",
      };
      next();
    },
    assignmentsRouter
  );

  return app;
};

describe("Integration Tests", () => {
  let app: express.Express;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  it("should complete full flow: login -> get classes -> create assignment", async () => {
    // Mock login
    const mockUser = {
      id: "user-123",
      email: "teacher1@school.com",
      name: "John Smith",
      role: "teacher",
      schoolId: "school-1",
      school: { id: "school-1", name: "Test School" },
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

    // Login
    const loginResponse = await request(app).post("/auth/login").send({
      email: "teacher1@school.com",
      password: "password",
    });

    expect(loginResponse.status).toBe(200);
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

    vi.mocked(prisma.class.findMany).mockResolvedValue(mockClasses as any);

    // Get classes (would normally use the token, but we're mocking auth)
    const classesResponse = await request(app).get("/classes");
    expect(classesResponse.status).toBe(200);
    expect(classesResponse.body).toHaveLength(1);

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

    vi.mocked(prisma.class.findFirst).mockResolvedValue(mockClass as any);
    vi.mocked(prisma.assignment.create).mockResolvedValue(
      mockAssignment as any
    );

    // Create assignment
    const assignmentResponse = await request(app).post("/assignments").send({
      classId: "class-1",
      title: "Integration Test Assignment",
      topic: "Testing",
      dueAt: "2024-01-20T00:00:00.000Z",
      timeEstimateMin: 45,
    });

    expect(assignmentResponse.status).toBe(201);
    expect(assignmentResponse.body.title).toBe("Integration Test Assignment");
  });
});
