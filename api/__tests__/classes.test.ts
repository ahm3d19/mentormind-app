import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { classesRouter } from "../src/routes/classes";
import { prisma } from "../src/lib/prisma";

// Create app with proper middleware
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Add mock auth middleware
  app.use((req, res, next) => {
    req.user = {
      userId: "user-123",
      role: "TEACHER",
      schoolId: "school-123",
    };
    next();
  });

  app.use("/classes", classesRouter);
  return app;
};

describe("Classes API", () => {
  let app: express.Express;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  describe("GET /classes", () => {
    it("should return classes for authenticated teacher", async () => {
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

      vi.mocked(prisma.class.findMany).mockResolvedValue(mockClasses as any);

      const response = await request(app).get("/classes");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
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
      expect(prisma.class.findMany).toHaveBeenCalledWith({
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

    it("should handle database errors", async () => {
      vi.mocked(prisma.class.findMany).mockRejectedValue(new Error("DB error"));

      const response = await request(app).get("/classes");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Internal server error");
    });
  });

  describe("GET /classes/:id/roster", () => {
    it("should return class roster", async () => {
      const mockClass = {
        id: "class-1",
        name: "Math 101",
        teacherId: "user-123",
      };

      const mockStudents = [
        { id: "student-1", name: "Alice Johnson", email: "alice@student.com" },
        { id: "student-2", name: "Bob Williams", email: "bob@student.com" },
      ];

      vi.mocked(prisma.class.findFirst).mockResolvedValue(mockClass as any);
      vi.mocked(prisma.student.findMany).mockResolvedValue(mockStudents as any);

      const response = await request(app).get("/classes/class-1/roster");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStudents);

      expect(prisma.class.findFirst).toHaveBeenCalledWith({
        where: {
          id: "class-1",
          teacherId: "user-123",
        },
      });
    });

    it("should return 404 for non-existent class", async () => {
      vi.mocked(prisma.class.findFirst).mockResolvedValue(null);

      const response = await request(app).get("/classes/non-existent/roster");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Class not found");
    });
  });

  describe("GET /classes/:id/assignments", () => {
    it("should return class assignments", async () => {
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

      vi.mocked(prisma.class.findFirst).mockResolvedValue(mockClass as any);
      vi.mocked(prisma.assignment.findMany).mockResolvedValue(
        mockAssignments as any
      );

      const response = await request(app).get("/classes/class-1/assignments");

      expect(response.status).toBe(200);

      // Convert the mock assignments to include serialized dates for comparison
      const expectedAssignments = mockAssignments.map((assignment) => ({
        ...assignment,
        dueAt: assignment.dueAt.toISOString(), // Convert Date to ISO string
      }));

      expect(response.body).toEqual(expectedAssignments);
    });

    it("should return 404 for non-existent class", async () => {
      vi.mocked(prisma.class.findFirst).mockResolvedValue(null);

      const response = await request(app).get(
        "/classes/non-existent/assignments"
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Class not found");
    });

    it("should handle database errors", async () => {
      vi.mocked(prisma.class.findFirst).mockResolvedValue({
        id: "class-1",
        name: "Math 101",
        teacherId: "user-123",
      } as any);
      vi.mocked(prisma.assignment.findMany).mockRejectedValue(
        new Error("DB error")
      );

      const response = await request(app).get("/classes/class-1/assignments");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Internal server error");
    });
  });
});
