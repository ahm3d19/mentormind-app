# MentorMind Frontend

A modern React application for the MentorMind educational platform, providing teachers and students with tools for classroom management and learning.

## Features
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design for all devices
- 🔐 Secure authentication with JWT
- 🏫 Class and student management
- 📚 Assignment creation and tracking
- 📊 Progress monitoring and analytics
- ⚡ Fast performance with React Query
- 🎯 Type-safe with TypeScript

## Tech Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Query (TanStack Query)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library

## Installation
1. Clone repository
   ```bash
   git clone <repository-url>
   cd web
   ```
2. Install dependencies
   ```bash
   npm install
   ```

## Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI
```

## Folder Structure

```
web/
├── __tests__/                    # Test files
│   ├── Login.test.tsx            # Login component tests
│   └── setup.ts                  # Test setup configuration
│
├── app/                          # Next.js App Router directory
│   ├── classes/                  # Classes feature pages
│   │   ├── [id]/                 # Dynamic class ID route
│   │   │   ├── assignments/      # Class assignments
│   │   │   │   └── new/          # Create new assignment
│   │   │   │       ├── new/      # Nested route (if needed)
│   │   │   │       │   └── page.tsx
│   │   │   │       └── page.tsx
│   │   │   └── page.tsx          # Class detail page
│   │   └── page.tsx              # Classes list page
│   │
│   ├── favicon.ico               # Site favicon
│   ├── globals.css               # Global CSS styles
│   ├── layout.tsx                # Root layout component
│   ├── page.tsx                  # Home page
│   └── providers.tsx             # React Query and other providers
│
├── public/                       # Static assets
│   ├── file.svg                  # SVG icon
│   ├── globe.svg                 # SVG icon
│   ├── login.png                 # Login page image
│   ├── next.svg                  # Next.js logo
│   ├── vercel.svg                # Vercel logo
│   └── window.svg                # SVG icon
│
├── node_modules/                 # Dependencies (generated)
│
├── eslint.config.mjs             # ESLint configuration
├── next-env.d.ts                 # Next.js TypeScript declarations
├── next.config.ts                # Next.js configuration
├── package.json                  # Project dependencies and scripts
├── package-lock.json             # Locked dependency versions
├── postcss.config.mjs            # PostCSS configuration
├── README.md                     # This file
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── vitest.config.ts              # Vitest test configuration
```

### Directory Descriptions

- **`__tests__/`**: Contains all test files using Vitest and React Testing Library
- **`app/`**: Next.js App Router directory containing all pages and layouts
  - **`app/classes/`**: Classes feature with list and detail pages
  - **`app/classes/[id]/`**: Dynamic route for individual class pages
  - **`app/classes/[id]/assignments/`**: Assignment management for a class
  - **`app/classes/[id]/assignments/new/`**: Create new assignment page
- **`public/`**: Static assets served directly (images, icons, etc.)
- **`app/layout.tsx`**: Root layout wrapping all pages
- **`app/providers.tsx`**: React Query and other context providers
- **`app/globals.css`**: Global styles and Tailwind CSS imports

### Next.js App Router Structure

The app uses Next.js 16 App Router with:
- **File-based routing**: Each folder in `app/` represents a route
- **Dynamic routes**: `[id]` creates dynamic route segments
- **Layouts**: `layout.tsx` files wrap pages with shared UI
- **Pages**: `page.tsx` files define the UI for each route

## Contributing
- Follow code style and ESLint rules
- Use TypeScript for all components
- Write tests for components/features
- Update documentation
- Follow Git commit convention
