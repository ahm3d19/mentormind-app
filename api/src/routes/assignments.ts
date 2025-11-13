import express from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

const router = express.Router();

const createAssignmentSchema = z.object({
  classId: z.string().min(1),
  title: z.string().min(1),
  topic: z.string().min(1),
  dueAt: z.string().datetime(),
  timeEstimateMin: z.number().int().positive(),
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const data = createAssignmentSchema.parse(req.body);

    // Verify the teacher owns this class
    const cls = await prisma.class.findFirst({
      where: {
        id: data.classId,
        teacherId: req.user!.userId,
      },
    });

    if (!cls) {
      return res.status(404).json({ error: "Class not found" });
    }

    const assignment = await prisma.assignment.create({
      data: {
        ...data,
        dueAt: new Date(data.dueAt),
      },
    });

    res.status(201).json(assignment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: error.errors });
    }

    console.error("Create assignment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as assignmentsRouter };
