"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
exports.authRouter = router;
const JWT_SECRET = process.env.JWT_SECRET || "mentormind-secret-key";
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        // Mock authentication - in real app, verify password hash
        const user = await prisma_1.prisma.user.findUnique({
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
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            role: user.role,
            schoolId: user.schoolId,
        }, JWT_SECRET, { expiresIn: "24h" });
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res
                .status(400)
                .json({ error: "Invalid input", details: error.issues });
        }
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
//# sourceMappingURL=auth.js.map