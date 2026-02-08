# Daily Motion - Habit Tracking App

## Overview

Daily Motion is a modern habit tracking and productivity analytics application that helps users monitor their daily activities, build better habits, and visualize their productivity patterns. The app features a beautiful, glass-morphic UI with comprehensive analytics including daily, weekly, and monthly insights, streak tracking, and personalized activity management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18+ with Vite**: Modern frontend framework with fast development server and optimized production builds
- **TypeScript**: Full type safety across the application
- **React Router (Wouter)**: Lightweight routing solution for single-page application navigation

**UI & Styling**
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **shadcn/ui Components**: Radix UI-based component library for accessible, customizable UI components
- **Framer Motion**: Animation library for smooth transitions and interactive elements
- **Recharts**: Data visualization library for charts and graphs

**Design System**
- Custom color palette supporting both light and dark themes
- Glass-morphism effects with backdrop blur
- Typography system using Inter font family
- Responsive grid layouts (mobile-first approach)
- Component spacing based on Tailwind's spacing scale

**State Management**
- **React Context API**: Two primary contexts:
  - `AuthContext`: User authentication state and session management
  - `ActivityContext`: Activity logs, types, streaks, and statistics
- **TanStack Query (React Query)**: Server state management and API data fetching
- **Local Storage**: Fallback persistence for offline functionality

### Backend Architecture

**Server Framework**
- **Node.js + Express**: RESTful API server with middleware for JSON parsing and CORS
- **HTTP Server**: Standard Node.js HTTP server for handling requests

**API Design**
- RESTful endpoints under `/api` namespace
- Authentication endpoints (`/api/auth/login`, `/api/auth/register`)
- Activity management endpoints (CRUD operations for activities and logs)
- Custom middleware for request logging and error handling

**Authentication & Security**
- Custom JWT-like token implementation using HMAC-SHA256 signatures
- Password hashing with SHA-256
- Token-based session management with expiration (7-day default)
- Session tokens stored in localStorage on client-side

**Data Storage Strategy**
- **In-Memory Storage (Development)**: `MemStorage` class implementing full CRUD operations
- **Database-Ready Architecture**: Interface-based storage layer (`IStorage`) allowing easy swap to PostgreSQL
- **Drizzle ORM Integration**: Schema definitions and configuration ready for PostgreSQL deployment
- Default activity types pre-populated for new users

### Database Schema (PostgreSQL via Drizzle)

**Users Table**
- User credentials (username, hashed password, email)
- Preferences (notifications, theme, daily reminder time)
- Onboarding status tracking
- Display name and avatar URL for personalization

**Activity Types Table**
- User-specific and system-default activity types
- Icon and color customization
- Category classification (productive, leisure, health, other)
- Foreign key relationship to users (nullable for default types)

**Activity Logs Table**
- Time tracking entries (date, minutes, notes)
- Foreign keys to users and activity types
- Timestamp tracking for audit trail

**Streaks Table**
- Current and longest streak tracking per user
- Last active date for streak calculation
- Automatic streak management based on daily activity

**Data Relationships**
- One-to-many: Users → Activity Types (custom activities)
- One-to-many: Users → Activity Logs
- One-to-one: Users → Streaks
- Many-to-one: Activity Logs → Activity Types

### External Dependencies

**UI Component Libraries**
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives including dialogs, dropdowns, popovers, tooltips, and form controls
- **Lucide React**: Icon library for consistent iconography throughout the app

**Data Visualization**
- **Recharts**: Chart library for bar charts, pie charts, and data visualization components
- **date-fns**: Date manipulation and formatting library for calendar views and date range calculations

**Form Management**
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation for forms and API payloads
- **@hookform/resolvers**: Integration between React Hook Form and Zod validators

**Development Tools**
- **Drizzle Kit**: Database migration tool and schema management
- **ESBuild**: Fast bundler for production server builds
- **Replit Plugins**: Development banner, cartographer, and runtime error overlay for Replit environment

**Database Connectivity**
- **@neondatabase/serverless**: PostgreSQL client optimized for serverless environments (Neon Database)
- **Drizzle ORM**: Type-safe ORM with PostgreSQL dialect support

**Session Management**
- **connect-pg-simple**: PostgreSQL session store (configured but not actively used with in-memory storage)
- Custom token-based authentication as current implementation

**Animation & Interactions**
- **Framer Motion**: Animation library for page transitions, hover effects, and micro-interactions
- **Embla Carousel**: Carousel component for onboarding flow

**Build & Deployment**
- Environment-based configuration (development vs production)
- Static file serving for production builds
- Vite HMR integration for development mode
- Single build command producing optimized client and server bundles