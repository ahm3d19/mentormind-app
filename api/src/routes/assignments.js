"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentsRouter = void 0;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
exports.assignmentsRouter = router;
const createAssignmentSchema = zod_1.z.object({
    classId: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    topic: zod_1.z.string().min(1),
    dueAt: zod_1.z.string().datetime(),
    timeEstimateMin: zod_1.z.number().int().positive(),
});
router.post("/", async (req, res) => {
    try {
        const data = createAssignmentSchema.parse(req.body);
        // Verify the teacher owns this class
        const cls = await prisma_1.prisma.class.findFirst({
            where: {
                id: data.classId,
                teacherId: req.user.userId,
            },
        });
        if (!cls) {
            return res.status(404).json({ error: "Class not found" });
        }
        const assignment = await prisma_1.prisma.assignment.create({
            data: {
                ...data,
                dueAt: new Date(data.dueAt),
            },
        });
        res.status(201).json(assignment);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res
                .status(400)
                .json({ error: "Invalid input", details: error.issues });
        }
        console.error("Create assignment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
//# sourceMappingURL=assignments.js.map