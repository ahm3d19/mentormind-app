import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create schools
  const school1 = await prisma.school.upsert({
    where: { id: "school-1" },
    update: {},
    create: {
      id: "school-1",
      name: "Springfield Elementary",
      timezone: "America/New_York",
    },
  });

  const school2 = await prisma.school.upsert({
    where: { id: "school-2" },
    update: {},
    create: {
      id: "school-2",
      name: "Shelbyville High",
      timezone: "America/Chicago",
    },
  });

  // Create users (teachers)
  const teacher1 = await prisma.user.upsert({
    where: { email: "teacher1@school.com" },
    update: {},
    create: {
      email: "teacher1@school.com",
      name: "John Smith",
      role: "teacher",
      schoolId: school1.id,
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: "teacher2@school.com" },
    update: {},
    create: {
      email: "teacher2@school.com",
      name: "Jane Doe",
      role: "teacher",
      schoolId: school1.id,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@school.com" },
    update: {},
    create: {
      email: "admin@school.com",
      name: "Principal Skinner",
      role: "admin",
      schoolId: school1.id,
    },
  });

  // Create classes
  const mathClass = await prisma.class.upsert({
    where: { id: "class-1" },
    update: {},
    create: {
      id: "class-1",
      name: "Mathematics 101",
      schoolId: school1.id,
      teacherId: teacher1.id,
    },
  });

  const scienceClass = await prisma.class.upsert({
    where: { id: "class-2" },
    update: {},
    create: {
      id: "class-2",
      name: "Science 201",
      schoolId: school1.id,
      teacherId: teacher1.id,
    },
  });

  const englishClass = await prisma.class.upsert({
    where: { id: "class-3" },
    update: {},
    create: {
      id: "class-3",
      name: "English Literature",
      schoolId: school1.id,
      teacherId: teacher2.id,
    },
  });

  // Create students
  const students = await Promise.all([
    prisma.student.upsert({
      where: { id: "student-1" },
      update: {},
      create: {
        id: "student-1",
        name: "Alice Johnson",
        email: "alice@student.com",
        classId: mathClass.id,
      },
    }),
    prisma.student.upsert({
      where: { id: "student-2" },
      update: {},
      create: {
        id: "student-2",
        name: "Bob Williams",
        email: "bob@student.com",
        classId: mathClass.id,
      },
    }),
    prisma.student.upsert({
      where: { id: "student-3" },
      update: {},
      create: {
        id: "student-3",
        name: "Charlie Brown",
        email: "charlie@student.com",
        classId: scienceClass.id,
      },
    }),
    prisma.student.upsert({
      where: { id: "student-4" },
      update: {},
      create: {
        id: "student-4",
        name: "Diana Miller",
        email: "diana@student.com",
        classId: scienceClass.id,
      },
    }),
    prisma.student.upsert({
      where: { id: "student-5" },
      update: {},
      create: {
        id: "student-5",
        name: "Edward Davis",
        email: "edward@student.com",
        classId: englishClass.id,
      },
    }),
  ]);

  // Create assignments
  const assignments = await Promise.all([
    prisma.assignment.upsert({
      where: { id: "assignment-1" },
      update: {},
      create: {
        id: "assignment-1",
        title: "Algebra Basics",
        topic: "Linear Equations",
        dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        timeEstimateMin: 60,
        classId: mathClass.id,
      },
    }),
    prisma.assignment.upsert({
      where: { id: "assignment-2" },
      update: {},
      create: {
        id: "assignment-2",
        title: "Chemistry Lab",
        topic: "Chemical Reactions",
        dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        timeEstimateMin: 90,
        classId: scienceClass.id,
      },
    }),
    prisma.assignment.upsert({
      where: { id: "assignment-3" },
      update: {},
      create: {
        id: "assignment-3",
        title: "Shakespeare Analysis",
        topic: "Hamlet",
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        timeEstimateMin: 120,
        classId: englishClass.id,
      },
    }),
  ]);

  // Create submissions
  await Promise.all([
    prisma.submission.upsert({
      where: { id: "submission-1" },
      update: {},
      create: {
        id: "submission-1",
        scorePct: 85.5,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        assignmentId: "assignment-1",
        studentId: "student-1",
      },
    }),
    prisma.submission.upsert({
      where: { id: "submission-2" },
      update: {},
      create: {
        id: "submission-2",
        scorePct: 92.0,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        assignmentId: "assignment-1",
        studentId: "student-2",
      },
    }),
    prisma.submission.upsert({
      where: { id: "submission-3" },
      update: {},
      create: {
        id: "submission-3",
        scorePct: 78.0,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        assignmentId: "assignment-2",
        studentId: "student-3",
      },
    }),
  ]);

  // Create practice sessions
  await Promise.all([
    prisma.practiceSession.upsert({
      where: { id: "session-1" },
      update: {},
      create: {
        id: "session-1",
        startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        durationMin: 45,
        accuracyPct: 78.2,
        studentId: "student-1",
      },
    }),
    prisma.practiceSession.upsert({
      where: { id: "session-2" },
      update: {},
      create: {
        id: "session-2",
        startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        durationMin: 30,
        accuracyPct: 88.5,
        studentId: "student-1",
      },
    }),
    prisma.practiceSession.upsert({
      where: { id: "session-3" },
      update: {},
      create: {
        id: "session-3",
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        durationMin: 60,
        accuracyPct: 65.0,
        studentId: "student-2",
      },
    }),
    prisma.practiceSession.upsert({
      where: { id: "session-4" },
      update: {},
      create: {
        id: "session-4",
        startedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        durationMin: 25,
        accuracyPct: 92.0,
        studentId: "student-3",
      },
    }),
  ]);

  // Create mood checks
  await Promise.all([
    prisma.moodCheck.upsert({
      where: { id: "mood-1" },
      update: {},
      create: {
        id: "mood-1",
        date: new Date(),
        moodScore: 4,
        studentId: "student-1",
      },
    }),
    prisma.moodCheck.upsert({
      where: { id: "mood-2" },
      update: {},
      create: {
        id: "mood-2",
        date: new Date(),
        moodScore: 2,
        studentId: "student-2",
      },
    }),
    prisma.moodCheck.upsert({
      where: { id: "mood-3" },
      update: {},
      create: {
        id: "mood-3",
        date: new Date(),
        moodScore: 5,
        studentId: "student-3",
      },
    }),
    prisma.moodCheck.upsert({
      where: { id: "mood-4" },
      update: {},
      create: {
        id: "mood-4",
        date: new Date(),
        moodScore: 3,
        studentId: "student-4",
      },
    }),
    prisma.moodCheck.upsert({
      where: { id: "mood-5" },
      update: {},
      create: {
        id: "mood-5",
        date: new Date(),
        moodScore: 1,
        studentId: "student-5",
      },
    }),
  ]);

  console.log("✅ Seed data created successfully");
  console.log("📧 Demo credentials:");
  console.log("   teacher1@school.com / password");
  console.log("   teacher2@school.com / password");
  console.log("   admin@school.com / password");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
