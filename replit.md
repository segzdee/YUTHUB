# YUTHUB - Youth Housing Management System

## Overview

YUTHUB is a comprehensive youth housing management system designed to support organizations managing supported housing for young people. The platform provides integrated tools for housing management, support services, independence pathway tracking, and crisis response.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript, Vite for development server and build
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL via Neon Database with Drizzle ORM
- **Authentication**: Replit OIDC authentication system
- **UI Framework**: Radix UI components with Tailwind CSS and shadcn/ui
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

### Architecture Pattern
The application follows a full-stack monorepo architecture with:
- **Client**: React SPA in `/client` directory
- **Server**: Express API server in `/server` directory  
- **Shared**: Common schemas and types in `/shared` directory

## Key Components

### Authentication & Session Management
- **Replit OIDC Integration**: Uses Replit's authentication system for secure login
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **User Management**: Mandatory user storage for Replit Auth compliance

### Database Schema
The system uses a comprehensive PostgreSQL schema with the following core entities:
- **Users**: Staff authentication and profile management
- **Properties**: Housing units with capacity tracking
- **Residents**: Young people in the system with support needs
- **Support Plans**: Individual care and development plans
- **Incidents**: Safety and behavioral incident tracking
- **Activities**: Daily activities and progress tracking
- **Financial Records**: Cost tracking and budget management

### API Architecture
- **RESTful API**: Express.js with structured route handlers
- **Storage Layer**: Abstracted database operations via storage interface
- **Error Handling**: Centralized error handling middleware
- **Request Logging**: Structured logging for API requests

### Frontend Architecture
- **Component Structure**: Modular React components with TypeScript
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Data Fetching**: TanStack Query for efficient server state management
- **Routing**: Protected routes with authentication checks

## Data Flow

### Authentication Flow
1. User accesses the application
2. Replit OIDC redirects to authentication provider
3. Successful authentication creates/updates user session
4. Session stored in PostgreSQL with TTL
5. Protected routes verify authentication status

### Dashboard Data Flow
1. Dashboard loads with authentication check
2. Parallel API calls fetch metrics, properties, residents, activities
3. TanStack Query manages caching and error states
4. Components render with loading states and error handling

### Crisis Connect System
- **Emergency Response**: Immediate escalation to emergency services
- **Support Worker Contact**: Direct connection to on-call support
- **Incident Reporting**: Structured incident documentation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environment
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI component primitives
- **express**: Web application framework
- **passport**: Authentication middleware

### Development Dependencies
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the application
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for rapid development
- **Express Middleware**: Vite integration for full-stack development
- **Environment Variables**: Database URL and session secrets

### Production Build
- **Vite Build**: Optimized client bundle generation
- **ESBuild**: Server-side bundling for Node.js deployment
- **Static Asset Serving**: Express serves built client files

### Database Management
- **Drizzle Kit**: Database schema migrations and management
- **Environment-based Configuration**: Different database URLs for dev/prod
- **Session Table**: Automatic session cleanup with TTL

### Error Handling & Monitoring
- **Structured Logging**: Request/response logging with timing
- **Error Boundaries**: React error boundaries for graceful failure
- **Toast Notifications**: User-friendly error messaging

The application is designed for deployment on Replit with integrated authentication, database provisioning, and environment management. The architecture supports both development and production environments with appropriate optimizations for each.

## Current Status

The application is fully functional with:
- Complete database schema with sample data
- Working authentication system via Replit OIDC
- Comprehensive dashboard with real-time metrics
- Crisis Connect emergency response system
- Full API endpoints for all features

**Application URL**: https://27891fa9-b276-4e4e-a11a-60ce998c53b2-00-2uromwtwyow5n.janeway.replit.dev

## Recent Changes

- **July 12, 2025**: Fixed all TypeScript errors in backend routes
- **July 12, 2025**: Added sample data for residents, properties, incidents, and activities
- **July 12, 2025**: Configured authentication system for both development and production
- **July 12, 2025**: Application successfully deployed and tested