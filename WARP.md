# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commonly used project commands

- Setup
  - npm install
  - cp .env.example .env and fill required variables
  - npm run db:push (initialize database schema)

- Dev
  - npm run dev (concurrently runs backend and frontend)
  - npm run dev:server (Express backend on port 5000)
  - npm run dev:client (Vite frontend on port 5173)

- Type check
  - npm run type-check (alias: npm run check)
  - tsc --noEmit (alternative direct check)

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
  - Run single test file: npm test -- server/tests/{file}.test.ts
  - Run specific test by name: npm test -- -t "test pattern"
  - Security-only tests: npm run test:security

- Load/perf tests
  - npm run test:load (Artillery)
  - npm run test:performance (k6 - requires local k6 binary installation)
  - npm run test:all (runs all test suites)

- Database (Drizzle)
  - npm run db:push (push schema changes without migrations)
  - npm run db:migrate (apply migrations)
  - npm run db:generate (generate migration files from schema)
  - npm run db:studio (launch Drizzle Studio GUI)
  - Schema defined in shared/schema.ts
  - Migrations output to ./migrations (configured in drizzle.config.ts)

- Operational scripts
  - npm run validate:db (check database structure integrity)
  - npm run validate:security (security configuration validation)
  - npm run audit:platform (platform admin database audit)
  - npm run setup:oauth (configure OAuth providers)
  - npm run populate:councils (seed UK council data)
  - npm run seed:admin (create platform admin user)
  - npm run security:scan (Snyk vulnerability scan)
  - npm run security:monitor (Snyk continuous monitoring)

## Architecture and structure overview

### Monorepo layout

- **client/**: React 18 + TypeScript + Vite frontend
- **server/**: Express.js backend with TypeScript
- **shared/**: Shared types and Drizzle ORM schema
- **scripts/**: Operational and maintenance scripts
- **tests/**: Load and performance test configurations

### Path aliases (tsconfig.json & vite.config.ts)

- "@/*" -> client/src/*
- "@shared/*" -> shared/*
- "@/components/*" -> client/src/components/*
- "@/pages/*" -> client/src/pages/*
- "@/hooks/*" -> client/src/hooks/*
- "@/utils/*" -> client/src/utils/*
- "@/services/*" -> client/src/services/*
- "@/store/*" -> client/src/store/*
- "@/server/*" -> server/*

### Frontend architecture

#### Entry point
- client/src/main.tsx: Bootstraps React app and initializes performance optimizations
- client/src/App.tsx: Configures routing, providers, and error boundaries

#### Provider composition (outer to inner)
1. ErrorBoundary (catch React errors)
2. LanguageProvider (i18n support)
3. ThemeProvider (dark/light themes)
4. AccessibilityProvider (a11y features)
5. QueryClientProvider (TanStack Query for server state)
6. TooltipProvider (Radix UI tooltips)
7. Router (React Router v6)

#### Routing structure
- Public routes: /, /login, /signup, /features, /how-it-works, /testimonials
- Protected routes: /app/* (requires authentication)
  - Dashboard, Housing, Support, Independence, Analytics
  - Safeguarding, Crisis, Financials, Billing
  - Forms, Reports, Settings, Help
- Platform admin routes: /platform-admin/* (requires platform-admin role)
- All pages are lazy-loaded with Suspense

#### State management
- Server state: TanStack Query (5 min stale time, 3 retries, no refetch on window focus)
- Auth state: Zustand store (no AuthProvider context)
- UI state: Component-level useState/useReducer

#### Styling
- Tailwind CSS with custom configuration
- Radix UI components for primitives
- Custom components in client/src/components/

### Backend architecture

#### Server initialization (server/index.ts)
1. Load environment variables
2. Configure CORS (production domains + dev localhost)
3. Apply security middleware:
   - Rate limiting (strict in production, lenient in dev)
   - Input sanitization (server/middleware/inputSanitization.ts)
   - Security headers (helmet)
   - Memory tracking and limits
   - Performance monitoring
4. Setup SSL redirect (when HTTPS_ENABLED=true)
5. Mount billing routes (before auth for Stripe webhooks)
6. Register application routes (server/routes.ts)
7. Start HTTP/HTTPS server on port 5000
8. Initialize WebSocket manager
9. Start background job scheduler

#### Middleware stack (order matters)
1. CORS
2. Rate limiting (per-endpoint configuration)
3. Input sanitization (DOMPurify for XSS prevention)
4. JSON/URL-encoded body parsing (10mb limit)
5. Request tracking (compute lifecycle)
6. Subscription info loading
7. Memory tracking
8. Performance tracking
9. Memory limits (per-endpoint)
10. Response caching (LRU cache for static endpoints)
11. Query optimization hints

#### Authentication system
- Multi-method auth: OIDC (Replit), OAuth (Google), LDAP, SAML, email/password
- Session management: PostgreSQL-backed sessions (connect-pg-simple)
- MFA support: Time-based OTP (speakeasy + qrcode)
- JWT service: server/services/jwtService.ts
- Replit OIDC: server/replitAuth.ts (enabled when REPLIT_DOMAINS is set)
- Multi-auth orchestration: server/multiAuth.ts

#### Authorization (RBAC)
- Middleware: server/security/rbacMiddleware.ts
- Roles: staff, coordinator, manager, admin, platform-admin
- Organization-level data isolation (multi-tenancy)

#### API routes (server/routes.ts)
- Health checks: /api/health, /api/health/detailed
- Auth: /api/auth/* (login, logout, user, MFA, password reset)
- Core domain: /api/properties, /api/residents, /api/incidents, /api/support-plans, /api/activities, /api/financials, /api/maintenance, /api/tenancy-agreements
- Features: /api/drafts, /api/forms, /api/crisis-connect
- Platform admin: /api/platform-admin/* (analytics, monitoring)
- Billing: /api/billing/* (Stripe integration, subscription management)

#### Database layer
- PostgreSQL via Neon Database (@neondatabase/serverless)
- Drizzle ORM: server/db.ts (pool health monitoring, SSL in production)
- Schema: shared/schema.ts (single source of truth)
- Connection pooling with health checks
- Background jobs: server/jobs/backgroundJobs.ts (notifications, cleanup)

#### WebSocket support
- Real-time updates for dashboard metrics and notifications
- WebSocket manager initialized in server/index.ts

### Build and runtime

#### Development
- Vite dev server: port 5173
- Express backend: port 5000
- Vite proxies /api and /auth to backend
- HTTPS disabled by default to avoid cookie issues
- Hot module replacement (HMR) for frontend
- tsx watch for backend auto-reload

#### Production
- Vite builds to dist/public
- Express serves static files from dist/public
- SSL enabled via HTTPS_ENABLED=true
- SSL certificates: SSL_KEY_PATH, SSL_CERT_PATH
- Strict CORS, rate limiting, and security headers

### Testing strategy

#### Unit/integration tests (Jest)
- Test environment: Node.js
- Setup: server/tests/setup.ts
- Test location: server/tests/**/*.test.ts, tests/**/*.test.ts
- Coverage: server/** (excluding tests and .d.ts)
- ts-jest for TypeScript support

#### Load testing (Artillery)
- Config: tests/load/artillery-config.yml
- Command: npm run test:load

#### Performance testing (k6)
- Script: tests/performance/k6-test.js
- Command: npm run test:performance
- Note: Requires k6 binary installed locally

#### Security testing
- Snyk: npm run security:scan, npm run security:monitor
- Jest security suite: npm run test:security
- CI/CD: GitHub Actions security.yml and security-scan.yml
  - npm audit
  - CodeQL analysis
  - Semgrep
  - Dependency/license checks
  - Secret scanning

### Platform-specific features

#### Multi-tenancy
- Organization-level data isolation
- All queries scoped by organization_id
- Platform admin can access cross-organization data

#### UK Housing context
- UK council data seeding: npm run populate:councils
- Youth housing domain models (properties, residents, support plans)
- Safeguarding and crisis management features
- Independence pathways tracking

#### Accessibility (WCAG 2.1 AA)
- Skip to main content link
- ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader tested
- Color contrast compliance
- Provider: client/src/components/providers/AccessibilityProvider

#### Performance optimizations
- Code splitting and lazy loading
- LRU caching for frequently accessed data
- Memory tracking and cleanup (server/middleware/memoryOptimization.ts)
- Query optimization hints
- Background job scheduling
- Connection pooling

## Environment and local running notes

### Requirements
- Node.js 20+ (minimum version)
- PostgreSQL database (Neon or local)
- npm or yarn package manager

### Critical environment variables
- DATABASE_URL: PostgreSQL connection string
- SESSION_SECRET: Express session encryption key
- JWT_SECRET: JWT token signing key

### Optional environment variables
- REPLIT_DOMAINS, REPL_ID: Replit OIDC authentication
- HTTPS_ENABLED, SSL_KEY_PATH, SSL_CERT_PATH: SSL configuration
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET: Google OAuth
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET: Stripe payments
- RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS: Rate limiting
- See .env.example for complete list

### Port configuration
- Frontend dev server: 5173 (Vite default)
- Backend server: 5000 (configurable via PORT)
- Vite proxy: /api -> http://localhost:5000

### Common issues
- HTTPS in dev: Set HTTPS_ENABLED=false to avoid cookie issues
- Database connection: Ensure DATABASE_URL is correct and database is accessible
- Port conflicts: Change PORT in .env if 5000 is in use
- k6 tests: Install k6 binary separately (not included in npm dependencies)

## Naming conventions and code standards

### TypeScript conventions
- camelCase: variables and functions (e.g., userName, getUserData())
- PascalCase: Classes, React components, TypeScript types/interfaces (e.g., UserProfile, OrderHistoryComponent)
- Strict TypeScript: No 'any' types, comprehensive interface definitions
- Explicit return types for functions

### File organization
- Scripts: lowercase names in scripts/ folder
- Components: PascalCase in client/src/components/
- Pages: PascalCase in client/src/pages/
- Utilities: camelCase in client/src/utils/

### Code quality standards
- Security: Input validation, parameterized queries, no exposed secrets
- Accessibility: ARIA labels, semantic HTML, keyboard navigation
- Performance: Lazy loading, code splitting, optimized queries
- Testing: Unit tests for business logic, integration tests for APIs
- Documentation: JSDoc for public APIs, inline comments for complex logic

## Cross-AI tooling notes

### Project context
- Multi-tenant SaaS for UK youth housing organizations
- RBAC with organization-level data isolation
- Stack: React 18 + TypeScript + Express + PostgreSQL/Neon + Drizzle ORM
- Focus areas: Security, accessibility (WCAG 2.1 AA), performance
- Domain: Housing management, safeguarding, support services, crisis response

### Related documentation
- GitHub Copilot guidance: global_copilot_instructions.md, copilot_setup_guide.md
- Replit deployment: replit.md (domains, SSL, auth constraints)
- Database: docs/COMPREHENSIVE_DATABASE_AUDIT_REPORT.md, docs/database-schema-completeness-review.md
- Security: docs/DATABASE_SECURITY_AUDIT_REPORT.md
- API documentation: docs/api-documentation.md
- Deployment: PRODUCTION_DEPLOYMENT.md, SSL_DEPLOYMENT_CHECKLIST.md
