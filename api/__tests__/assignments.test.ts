import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { assignmentsRouter } from "../src/routes/assignments";
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

  app.use("/assignments", assignmentsRouter);
  return app;
};

describe("Assignments API", () => {
  let app: express.Express;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  describe("POST /assignments", () => {
    it("should create a new assignment", async () => {
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

      vi.mocked(prisma.class.findFirst).mockResolvedValue(mockClass as any);
      vi.mocked(prisma.assignment.create).mockResolvedValue(
        mockAssignment as any
      );

      const response = await request(app).post("/assignments").send({
        classId: "class-1",
        title: "Math Homework",
        topic: "Algebra",
        dueAt: dueAt.toISOString(), // Send as ISO string
        timeEstimateMin: 60,
      });

      expect(response.status).toBe(201);

      // Compare individual properties instead of the whole object
      expect(response.body.id).toBe("assignment-1");
      expect(response.body.title).toBe("Math Homework");
      expect(response.body.topic).toBe("Algebra");
      expect(response.body.timeEstimateMin).toBe(60);
      expect(response.body.classId).toBe("class-1");
      // For date, compare the ISO string representation
      expect(new Date(response.body.dueAt).toISOString()).toBe(
        dueAt.toISOString()
      );

      expect(prisma.class.findFirst).toHaveBeenCalledWith({
        where: {
          id: "class-1",
          teacherId: "user-123",
        },
      });
    });

    it("should return 404 when class not found", async () => {
      vi.mocked(prisma.class.findFirst).mockResolvedValue(null);

      const response = await request(app)
        .post("/assignments")
        .send({
          classId: "non-existent-class",
          title: "Math Homework",
          topic: "Algebra",
          dueAt: new Date("2024-01-15T00:00:00.000Z").toISOString(),
          timeEstimateMin: 60,
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Class not found");
    });

    it("should validate required fields", async () => {
      const response = await request(app).post("/assignments").send({
        // Missing required fields
        topic: "Algebra",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid input");
    });

    it("should validate data types", async () => {
      const response = await request(app).post("/assignments").send({
        classId: "class-1",
        title: "Math Homework",
        topic: "Algebra",
        dueAt: "invalid-date",
        timeEstimateMin: "not-a-number",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid input");
    });
  });
});
