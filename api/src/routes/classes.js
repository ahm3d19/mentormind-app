"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.classesRouter = void 0;
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
exports.classesRouter = router;
// Get all classes for authenticated teacher
router.get("/", async (req, res) => {
    try {
        const classes = await prisma_1.prisma.class.findMany({
            where: {
                teacherId: req.user.userId,
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
        const classesWithCounts = classes.map((cls) => ({
            id: cls.id,
            name: cls.name,
            schoolId: cls.schoolId,
            teacherId: cls.teacherId,
            studentCount: cls.students.length,
            assignmentCount: cls.assignments.length,
        }));
        res.json(classesWithCounts);
    }
    catch (error) {
        console.error("Get classes error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get class roster
router.get("/:id/roster", async (req, res) => {
    try {
        const classId = req.params.id;
        const cls = await prisma_1.prisma.class.findFirst({
            where: {
                id: classId,
                teacherId: req.user.userId,
            },
        });
        if (!cls) {
            return res.status(404).json({ error: "Class not found" });
        }
        const students = await prisma_1.prisma.student.findMany({
            where: { classId },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
        res.json(students);
    }
    catch (error) {
        console.error("Get roster error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get class assignments
router.get("/:id/assignments", async (req, res) => {
    try {
        const classId = req.params.id;
        const cls = await prisma_1.prisma.class.findFirst({
            where: {
                id: classId,
                teacherId: req.user.userId,
            },
        });
        if (!cls) {
            return res.status(404).json({ error: "Class not found" });
        }
        const assignments = await prisma_1.prisma.assignment.findMany({
            where: { classId },
            orderBy: { dueAt: "asc" },
            select: {
                id: true,
                title: true,
                topic: true,
                dueAt: true,
                timeEstimateMin: true,
            },
        });
        res.json(assignments);
    }
    catch (error) {
        console.error("Get assignments error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get class metrics
router.get("/:id/metrics", async (req, res) => {
    try {
        const classId = req.params.id;
        const cls = await prisma_1.prisma.class.findFirst({
            where: {
                id: classId,
                teacherId: req.user.userId,
            },
        });
        if (!cls) {
            return res.status(404).json({ error: "Class not found" });
        }
        const students = await prisma_1.prisma.student.findMany({
            where: { classId },
            include: {
                submissions: {
                    select: { scorePct: true },
                },
                practiceSessions: {
                    where: {
                        startedAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                        },
                    },
                    select: { accuracyPct: true, startedAt: true },
                },
                moodChecks: {
                    orderBy: { date: "desc" },
                    take: 1,
                    select: { moodScore: true },
                },
            },
        });
        const metrics = students.map((student) => {
            const avgScorePct = student.submissions.length > 0
                ? student.submissions.reduce((sum, sub) => sum + sub.scorePct, 0) /
                    student.submissions.length
                : 0;
            const sessionsThisWeek = student.practiceSessions.length;
            const avgAccuracyPct = student.practiceSessions.length > 0
                ? student.practiceSessions.reduce((sum, session) => sum + session.accuracyPct, 0) / student.practiceSessions.length
                : 0;
            const recentMood = student.moodChecks[0]?.moodScore || null;
            return {
                studentId: student.id,
                studentName: student.name,
                avgScorePct: Math.round(avgScorePct * 100) / 100,
                sessionsThisWeek,
                avgAccuracyPct: Math.round(avgAccuracyPct * 100) / 100,
                recentMood,
            };
        });
        // Calculate class summary
        const activeStudents = metrics.filter((m) => m.sessionsThisWeek >= 2).length;
        const lowMoodStudents = metrics.filter((m) => m.recentMood !== null && m.recentMood <= 2).length;
        const avgAccuracy = metrics.length > 0
            ? Math.round((metrics.reduce((sum, m) => sum + m.avgAccuracyPct, 0) /
                metrics.length) *
                100) / 100
            : 0;
        // Get assignments due in next 7 days
        const dueAssignments = await prisma_1.prisma.assignment.count({
            where: {
                classId,
                dueAt: {
                    gte: new Date(),
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            },
        });
        res.json({
            metrics,
            summary: {
                avgAccuracy,
                activeStudents,
                lowMoodStudents,
                dueAssignments,
            },
        });
    }
    catch (error) {
        console.error("Get metrics error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
//# sourceMappingURL=classes.js.map