import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "mentormind-secret-key";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Mock authentication - in real app, verify password hash
    const user = await prisma.user.findUnique({
      where: { email },
      include: { school: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Mock password check - in real app, use bcrypt
    if (password !== "password") {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        schoolId: user.schoolId,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        schoolId: user.schoolId,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: error.issues });
    }

    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as authRouter };
