# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commonly used project commands

- Setup
  - npm install
  - cp .env.example .env and fill required variables

- Dev
  - npm run dev (concurrently runs backend and frontend)
  - npm run dev:server
  - npm run dev:client

- Type check
  - npm run type-check (alias: npm run check)

- Lint/format
  - npm run lint
  - npm run lint:fix
  - npm run format

- Build/Run
  - npm run build (uses tsconfig.build.json + Vite build)
  - npm start
  - npm run preview

- Tests (Jest)
  - npm test
  - npm run test:watch
  - npm run test:coverage
  - Run single test (file-scoped and by name):
    - npm test -- server/tests/{file}.test.ts -t "pattern"
  - Security-only tests: npm run test:security

- Load/perf tests
  - npm run test:load (Artillery)
  - npm run test:performance (k6). Note: k6 binary may be required locally.

- Database (Drizzle)
  - npm run db:push
  - npm run db:migrate
  - npm run db:generate
  - npm run db:studio
  - drizzle.config.ts defines the schema path and migrations output directory.

- Operational scripts
  - npm run validate:db
  - npm run validate:security
  - npm run audit:platform
  - npm run setup:oauth
  - npm run populate:councils
  - npm run seed:admin
  - npm run security:scan
  - npm run security:monitor

## Architecture and structure overview

- Monorepo layout
  - client (React 18 + TypeScript + Vite), server (Express), shared (Drizzle schema/types)
  - Path aliases: "@" -> client/src, "@shared" -> shared (configured in tsconfig.json and vite.config.ts)

- Frontend
  - client/src/main.tsx bootstraps the app; App.tsx configures React Router routes:
    - Public: Landing, Login, Signup
    - Protected: /app/\* modules
    - Platform admin: /platform-admin/\*
  - Uses TanStack Query, provider composition, and lazy-loaded pages
  - Tailwind for styling; Vite dev server proxies /api to the backend

- Backend
  - server/index.ts composes middleware (CORS, input sanitization, rate limiting, memory/perf tracking, security headers), registers routes via server/routes.ts, and starts HTTP/HTTPS on port 5000 plus a WebSocket manager
  - Replit OIDC auth in server/replitAuth.ts (optional locally; enabled when REPLIT_DOMAINS is set)
  - RBAC middleware: server/security/rbacMiddleware.ts
  - Rate limiter: server/middleware/rateLimiter.ts
  - JWT service: server/services/jwtService.ts

- API surface
  - server/routes.ts aggregates health, auth (MFA, password reset, multi-auth), core domain endpoints (properties, residents, incidents, support plans, activities, financial records, maintenance, tenancy agreements), drafts/forms, crisis connect, and platform admin analytics endpoints with enhanced auth checks

- Data layer
  - Postgres via @neondatabase/serverless; Drizzle ORM configured in server/db.ts with pool health monitoring and strict production SSL checks
  - Schema: shared/schema.ts; referenced by drizzle.config.ts

- Build/runtime
  - Vite config sets root to client, output to dist/public, and path aliases
  - In production, the server serves static files; in dev, HTTPS is off by default to avoid cookie issues

- CI/security
  - GitHub Actions: .github/workflows/security.yml and security-scan.yml run npm audit, CodeQL, Semgrep, dependency/license checks, and secret scans

## Environment and local running notes

- Node.js 20 minimum. Postgres reachable via DATABASE_URL
- Critical env vars: DATABASE_URL, SESSION_SECRET, JWT_SECRET
- Optional: REPLIT_DOMAINS and REPL_ID for OIDC; HTTPS_ENABLED for SSL mode
- See .env.example and .env.production.example for the full list
- Ports: Vite dev typically on 5173; backend on 5000 with dev proxy configured in vite.config.ts
- For performance tests using k6, ensure k6 is installed on your machine

## Cross-AI tooling notes

- GitHub Copilot guidance: see global_copilot_instructions.md and copilot_setup_guide.md (project context: multi-tenant SaaS, RBAC, React + TypeScript + Express + Postgres/Neon, Drizzle, focus on accessibility/security)
- Replit deployment constraints (domains, SSL, auth): see replit.md
