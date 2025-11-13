import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { authRouter } from "../src/routes/auth";
import { prisma } from "../src/lib/prisma";

const app = express();
app.use(express.json());
app.use("/auth", authRouter);

describe("Auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should login with valid credentials", async () => {
    const mockUser = {
      id: "user-123",
      email: "teacher1@school.com",
      name: "John Smith",
      role: "teacher",
      schoolId: "school-1",
      school: { id: "school-1", name: "Test School" },
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

    const response = await request(app).post("/auth/login").send({
      email: "teacher1@school.com",
      password: "password",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe("teacher1@school.com");
    expect(response.body.user.name).toBe("John Smith");
  });

  it("should reject invalid credentials - wrong password", async () => {
    const mockUser = {
      id: "user-123",
      email: "teacher1@school.com",
      name: "John Smith",
      role: "teacher",
      schoolId: "school-1",
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

    const response = await request(app).post("/auth/login").send({
      email: "teacher1@school.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "Invalid credentials");
  });

  it("should reject invalid credentials - user not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const response = await request(app).post("/auth/login").send({
      email: "nonexistent@school.com",
      password: "password",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "Invalid credentials");
  });

  it("should validate input - invalid email", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "invalid-email",
      password: "password",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Invalid input");
  });

  it("should validate input - missing password", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "teacher1@school.com",
      password: "",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Invalid input");
  });
});
