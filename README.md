# MentorMind - Teacher Class Insights (MVP)

A full-stack application that enables teachers to view their classes, monitor student metrics, and create assignments.

## Live Demo: https://mentormind-app-psi.vercel.app

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/ahm3d19/mentormind-app.git
   cd mentormind-app
   ```

2. **Setup API Backend**

   ```bash
   cd api
   npm install
   npx prisma generate
   npx prisma db push
   npm run db:seed
   npm run dev
   ```

   API runs on `http://localhost:3001`

3. **Setup Web Frontend** (in a new terminal)

   ```bash
   cd web
   npm install
   npm run dev
   ```

   Web app runs on `http://localhost:3000`

4. **Login Credentials**
   - Email: `teacher1@school.com`
   - Password: `password`

## 📁 Project Structure

```
mentormind-app/
├── api/                    # Express.js backend
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth middleware
│   │   ├── lib/            # Prisma client
│   │   └── server.ts       # Express server
│   ├── prisma/             # Database schema & seed
│   └── __tests__/          # Backend tests
│
├── web/                    # Next.js frontend
│   ├── app/                # Next.js App Router
│   │   ├── classes/        # Class pages
│   │   └── providers.tsx   # React Query setup
│   └── __tests__/          # Frontend tests
│
└── docs/                   # Documentation
    └── architecture.md     # System architecture diagram
```

## 🛠️ Tech Stack & Decisions

### Frontend

- **Next.js 16** with App Router - Modern React framework with file-based routing
- **TypeScript** - Type safety and better developer experience
- **React Query (TanStack Query)** - Efficient data fetching, caching, and synchronization
- **Tailwind CSS 4** - Utility-first CSS for rapid UI development
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Modern icon library

**Why these choices?**

- Next.js App Router provides excellent developer experience and performance
- React Query handles complex data fetching patterns (caching, refetching, optimistic updates)
- Tailwind enables rapid UI development without context switching

### Backend

- **Express.js** - Minimal, unopinionated web framework
- **TypeScript** - Type safety across the stack
- **Prisma ORM** - Type-safe database access with excellent DX
- **SQLite** - Simple, file-based database perfect for MVP (easily migrates to PostgreSQL)
- **Zod** - Runtime type validation for API inputs
- **JWT** - Stateless authentication tokens

**Why these choices?**

- Express provides flexibility without heavy abstractions
- Prisma generates type-safe clients and handles migrations elegantly
- SQLite eliminates database setup complexity while maintaining relational integrity
- Zod ensures API inputs are validated at runtime, catching errors early

### Testing

- **Vitest** - Fast, Vite-native test runner
- **React Testing Library** - Component testing with focus on user behavior
- **Supertest** - HTTP assertions for API testing

## 🔐 Authentication Flow

### How Auth Works

1. **Login** (`POST /auth/login`)

   - Client sends email and password
   - Server validates credentials (currently mock: password must be "password")
   - Server generates JWT containing `userId`, `role`, and `schoolId`
   - Client stores token in memory (or localStorage for persistence)

2. **Protected Routes**

   - Client includes token in `Authorization: Bearer <token>` header
   - `authenticateToken` middleware validates token and extracts user info
   - User object attached to `req.user` for route handlers

3. **Access Control**
   - Teachers can only access classes where `teacherId` matches their `userId`
   - All queries filter by `schoolId` to ensure school-level isolation
   - Assignment creation verifies teacher owns the class

### Security Considerations

- ✅ JWT tokens expire after 24 hours
- ✅ All protected routes require valid token
- ✅ Resource-level access control (teachers only see their classes)
- ✅ Input validation with Zod on all POST endpoints
- ✅ Request IDs in logs for traceability
- ⚠️ Currently uses mock password check (production would use bcrypt)

## 📊 Metrics Computation

Student metrics are computed in `GET /classes/:id/metrics`:

### Per-Student Metrics

1. **avgScorePct** (Average Assignment Score)

   ```typescript
   avgScorePct = sum(all submission scores) / submission count
   ```

   - Aggregates all `Submission.scorePct` values for the student
   - Returns 0 if no submissions exist

2. **sessionsThisWeek** (Practice Sessions in Last 7 Days)

   ```typescript
   sessionsThisWeek = count(PracticeSession where startedAt >= 7 days ago)
   ```

   - Filters `PracticeSession` records from the last 7 days
   - Used to identify active students (≥2 sessions)

3. **avgAccuracyPct** (Average Practice Accuracy)

   ```typescript
   avgAccuracyPct = sum(all session accuracy) / session count
   ```

   - Calculates mean of `PracticeSession.accuracyPct` values
   - Only includes sessions from the last 7 days

4. **recentMood** (Latest Mood Check Score)
   ```typescript
   recentMood = latest MoodCheck.moodScore (ordered by date desc)
   ```
   - Retrieves the most recent `MoodCheck` entry
   - Returns `null` if no mood checks exist

### Class Summary Metrics

- **avgAccuracy**: Mean of all students' `avgAccuracyPct`
- **activeStudents**: Count of students with `sessionsThisWeek >= 2`
- **lowMoodStudents**: Count of students with `recentMood <= 2`
- **dueAssignments**: Count of assignments due in next 7 days

## 📡 API Endpoints

### Authentication

- `POST /auth/login` - Login and receive JWT token

### Classes

- `GET /classes` - List all classes for authenticated teacher
- `GET /classes/:id/roster` - Get student roster for a class
- `GET /classes/:id/assignments` - Get assignments for a class
- `GET /classes/:id/metrics` - Get student metrics and class summary

### Assignments

- `POST /assignments` - Create a new assignment

### Health

- `GET /health` - Health check endpoint

See `api/ROUTES.md` for detailed API documentation.

## 🧪 Testing

### Backend Tests

```bash
cd api
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

Tests cover:

- Authentication flow
- Class endpoints with access control
- Assignment creation with validation

### Frontend Tests

```bash
cd web
npm test                    # Run all tests
npm run test:ui             # Interactive UI
```

Tests cover:

- Login component rendering and interaction

## 📈 AWS Migration Notes

### Recommended Services

**Compute & API**

- **AWS Fargate (ECS)** or **Lambda + API Gateway** for the Express API
  - Fargate preferred for long-running connections and simpler deployment
  - Lambda suitable if moving to serverless architecture
- **CloudFront** for CDN and edge caching of static assets
- **S3** for static web hosting (or continue with Vercel/Netlify)

**Database**

- **RDS PostgreSQL** (migrate from SQLite)
  - Multi-AZ for high availability
  - Automated backups with 7-day retention
  - Read replicas for scaling read operations

**Authentication**

- **AWS Cognito** to replace mock JWT
  - User pools for authentication
  - JWT tokens managed by Cognito
  - MFA support and password policies

**Security Enhancements**

- **VPC** with private subnets for API and database
- **Secrets Manager** for JWT secrets, DB credentials
- **KMS** for encryption at rest and in transit
- **WAF** on API Gateway/CloudFront for DDoS protection
- **IAM roles** with least-privilege access
- **Security Groups** restricting traffic between services

**Observability**

- **CloudWatch Logs** for centralized logging (replace console.log)
- **X-Ray** for distributed tracing across services
- **CloudWatch Metrics** for API latency, error rates
- **CloudWatch Alarms** for error thresholds

**Backup & Disaster Recovery**

- **RDS automated backups** (daily snapshots)
- **S3 versioning** for application code backups
- **Cross-region replication** for critical data
- **Route 53** for DNS failover

**Cost Optimization**

- Use **Reserved Instances** for predictable workloads
- **S3 Intelligent-Tiering** for infrequently accessed data
- **CloudWatch Cost Anomaly Detection** for budget alerts

### Migration Steps

1. Set up VPC with public/private subnets
2. Deploy RDS PostgreSQL in private subnet
3. Migrate SQLite data to PostgreSQL
4. Deploy API to Fargate in private subnet
5. Configure Application Load Balancer
6. Set up CloudFront distribution
7. Migrate authentication to Cognito
8. Implement Secrets Manager for credentials
9. Set up CloudWatch logging and monitoring
10. Configure automated backups

## 📝 CHANGELOG

### Initial Implementation (Day 1)

- ✅ Set up Express.js backend with TypeScript
- ✅ Configured Prisma with SQLite database
- ✅ Implemented data models (User, School, Class, Student, Assignment, Submission, PracticeSession, MoodCheck)
- ✅ Created seed script with sample data
- ✅ Implemented JWT authentication middleware
- ✅ Built authentication route (`POST /auth/login`)
- ✅ Created classes routes (list, roster, assignments, metrics)
- ✅ Implemented assignment creation endpoint
- ✅ Set up Next.js frontend with App Router
- ✅ Created login page with form validation
- ✅ Built classes list page with React Query
- ✅ Implemented class detail page with roster and metrics
- ✅ Added assignment creation form
- ✅ Implemented filtering for student metrics (score, mood)
- ✅ Added class summary metrics display
- ✅ Created comprehensive test suite (backend + frontend)
- ✅ Added request ID logging for traceability
- ✅ Implemented input validation with Zod
- ✅ Added health check endpoint
- ✅ Created documentation and architecture diagram

### Technical Decisions

- Used SQLite for rapid development (can migrate to PostgreSQL)
- Mock password authentication for MVP (production would use bcrypt)
- In-memory token storage (can persist to localStorage)
- React Query for efficient data fetching and caching
- Tailwind CSS for rapid UI development

## 🤖 AI Assistance Disclosure

This project utilized AI assistance (Claude via Cursor) for:

- Initial project scaffolding and boilerplate code
- TypeScript type definitions and interfaces
- Test setup and configuration
- Documentation generation
- Code review and optimization suggestions

All business logic, architecture decisions, and implementation details were developed with human oversight and review.

## 📚 Additional Documentation

- [API Routes Documentation](./api/ROUTES.md) - Detailed API endpoint documentation
- [API README](./api/README.md) - Backend setup and structure
- [Web README](./web/README.md) - Frontend setup and structure
- [Architecture Diagram](./docs/architecture.md) - System architecture visualization

## 🎯 Assessment Deliverables Checklist

- ✅ GitHub repo with `api/` and `web/` folders
- ✅ README.md with setup, decisions, auth, metrics, AWS notes
- ✅ Architecture diagram in `docs/architecture.md`
- ✅ Backend test (`api/__tests__/`)
- ✅ Frontend test (`web/__tests__/`)
- ✅ Seed data script (`api/prisma/seed.ts`)
- ✅ CHANGELOG documenting development process

## 🚧 Known Limitations & Future Improvements

- Password authentication is mocked (should use bcrypt)
- No refresh token mechanism (tokens expire after 24h)
- No pagination on large datasets
- No rate limiting on API endpoints
- Metrics computed on-demand (could be cached)
- No real-time updates (polling-based)
- Limited error handling UI
- No export functionality (stretch goal)

