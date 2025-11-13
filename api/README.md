# MentorMind API Backend

A RESTful API for the MentorMind educational platform built with Node.js, Express, TypeScript, and Prisma.

## Features

- 🔐 JWT Authentication & Authorization
- 👥 Role-based access (TEACHER, STUDENT, ADMIN)
- 🏫 School & Class management
- 📚 Assignment creation and tracking
- 📊 Student progress monitoring
- 🗄️ PostgreSQL database with Prisma ORM
- 🧪 Comprehensive test suite with Vitest
- 🔒 Input validation with Zod
- 📝 API documentation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Testing**: Vitest + Supertest
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm or yarn

## Installation

1. Clone repository
   ```bash
   git clone <repository-url>
   cd api
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Environment Setup
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/mentormind"
   JWT_SECRET="your-jwt-secret-key"
   NODE_ENV="development"
   PORT="3001"
   ```
4. Database Setup
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

## Development

```bash
npm run dev
npm run build
npm start
```

## Testing

```bash
npm test
npm run test:watch
npm run test:coverage
npm run test:run __tests__/classes.test.ts
```

## API Endpoints

### Authentication

- POST /auth/login
- POST /auth/register
- POST /auth/refresh

### Classes

- GET /classes
- GET /classes/:id/roster
- GET /classes/:id/assignments
- POST /classes
- PUT /classes/:id
- DELETE /classes/:id

### Assignments

- GET /assignments
- GET /assignments/:id
- POST /assignments
- PUT /assignments/:id
- DELETE /assignments/:id

### Students

- GET /students
- GET /students/:id/progress
- POST /students/:id/enroll

## Folder Structure

```
api/
├── __tests__/                    # Test files
│   ├── assignments.test.ts       # Assignment route tests
│   ├── auth.test.ts              # Authentication route tests
│   ├── classes.test.ts           # Class route tests
│   ├── integration.test.ts       # Integration tests
│   └── setup.ts                  # Test setup configuration
│
├── prisma/                       # Prisma database configuration
│   ├── dev.db                    # SQLite development database
│   ├── schema.prisma             # Prisma schema definition
│   └── seed.ts                   # Database seeding script
│
├── src/                          # Source code
│   ├── lib/                      # Library utilities
│   │   └── prisma.ts             # Prisma client instance
│   │
│   ├── middleware/               # Express middleware
│   │   └── auth.ts               # Authentication middleware
│   │
│   ├── routes/                   # API route handlers
│   │   ├── assignments.ts        # Assignment endpoints
│   │   ├── auth.ts               # Authentication endpoints
│   │   └── classes.ts            # Class endpoints
│   │
│   └── server.ts                 # Express server entry point
│
├── node_modules/                 # Dependencies (generated)
│
├── jest.config.js                # Jest test configuration
├── package.json                  # Project dependencies and scripts
├── package-lock.json             # Locked dependency versions
├── README.md                     # This file
├── tsconfig.json                 # TypeScript configuration
└── vitest.config.ts              # Vitest test configuration
```

### Directory Descriptions

- **`__tests__/`**: Contains all test files using Vitest and Supertest for API testing
- **`prisma/`**: Database schema, migrations, and seeding scripts
- **`src/lib/`**: Shared utilities and library code (e.g., Prisma client singleton)
- **`src/middleware/`**: Express middleware functions (authentication, validation, etc.)
- **`src/routes/`**: Route handlers organized by resource (auth, classes, assignments)
- **`src/server.ts`**: Main application entry point that sets up Express server

## Contributing

- Follow TypeScript and ESLint rules
- Write tests for new features
- Update API documentation
- Use conventional commit messages
