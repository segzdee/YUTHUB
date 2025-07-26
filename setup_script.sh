#!/bin/bash

# YutHub Housing Management Platform - GitHub Copilot Setup Script
# This script sets up GitHub Copilot configuration files for the project

echo "🏠 Setting up GitHub Copilot for YutHub Housing Management Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Create .vscode directory if it doesn't exist
if [ ! -d ".vscode" ]; then
    mkdir -p .vscode
    print_status "Created .vscode directory"
else
    print_info ".vscode directory already exists"
fi

# Create VS Code settings.json
cat > .vscode/settings.json << 'EOF'
{
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "text": "You are working on YutHub (yuthub.com), a comprehensive housing management platform for UK councils and housing associations. Tech stack: React + TypeScript, Express.js backend, PostgreSQL with Neon, Tailwind CSS, Socket.io for real-time features. Always implement mobile-first responsive design.",
      "file": "**/*"
    },
    {
      "text": "Architecture: Multi-tenant SaaS with organization isolation using Row Level Security policies. Role-based access control (staff, admin, platform-admin). Platform admin has separate interface at /platform-admin/* with enhanced security. Include comprehensive error handling with user-friendly messages.",
      "file": "**/*"
    },
    {
      "text": "Frontend components: Use consistent YutHub branding, implement loading states and error boundaries, ensure WCAG 2.1 AA accessibility compliance, validate forms with real-time feedback using react-hook-form + zod. Components should be reusable and follow mobile-first design.",
      "file": "client/**/*.tsx,client/**/*.jsx,client/**/*.ts,client/**/*.js"
    },
    {
      "text": "Backend API: Follow RESTful design with consistent JSON responses. Implement JWT authentication with session management, input validation and sanitization, rate limiting, comprehensive audit logging for all actions. Ensure GDPR compliance and proper CORS configuration.",
      "file": "server/**/*"
    },
    {
      "text": "Shared code: Ensure type definitions and utilities work across both client and server. Include proper TypeScript interfaces for API responses, database models, and shared business logic.",
      "file": "shared/**/*"
    },
    {
      "text": "Database: Use PostgreSQL with proper indexes, foreign key constraints, timestamps (created_at, updated_at), and RLS policies for multi-tenancy. All tables should include organization_id for isolation. Include audit trails for data changes.",
      "file": "server/**/*.sql,server/**/migrations/**/*,server/**/database/**/*"
    },
    {
      "text": "Core modules: Dashboard (KPI widgets), Housing Management (properties/residents), Support Services (case management), Independence Pathway (goal tracking), Analytics & Outcomes (reporting), Safeguarding (risk assessment), Crisis Connect (24/7 emergency), Financials (budget tracking), Government Billing (automated invoicing), Forms (dynamic builder), Reports (scheduled), Settings (permissions), Help & Support.",
      "file": "**/*"
    },
    {
      "text": "Platform admin features (separate from organization admin): Subscription management (Starter £169/mo for 25 residents, Professional £429/mo for 100 residents, Enterprise £1099/mo unlimited), system monitoring, organization management, billing oversight, feature flags, emergency tools. Routes use /platform-admin/* with enhanced security.",
      "file": "client/**/platform-admin/**/*,server/**/platform-admin/**/*,client/**/admin/**/*,server/**/admin/**/*"
    },
    {
      "text": "Security & Compliance: GDPR compliance, multi-factor authentication support, comprehensive audit trails, secure file upload with validation, encrypted data storage. Emergency contacts: Crisis Line 0800 123 4567 (24/7), Technical Support +44 161 123 4568.",
      "file": "**/*"
    },
    {
      "text": "UI/UX: Professional design with emergency contact prominence, mobile-optimized for field workers, offline capabilities for critical functions, consistent color scheme (professional blue/navy theme), accessibility compliance. Company: YutHub Solutions Ltd.",
      "file": "client/**/*.tsx,client/**/*.jsx,client/**/*.css,client/**/*.scss"
    },
    {
      "text": "WebSocket integration for real-time updates, proper connection management, crisis alerts, maintenance notifications. File structure: components in PascalCase, hooks with 'use' prefix, utils in camelCase, API routes in kebab-case, database tables in snake_case.",
      "file": "**/*"
    }
  ],
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
EOF

print_status "Created .vscode/settings.json with GitHub Copilot instructions"

# Create .cursorrules for Cursor IDE users
cat > .cursorrules << 'EOF'
# YutHub Housing Management Platform - Cursor IDE Rules

## Project Context
You are working on YutHub (yuthub.com), a comprehensive housing management platform for UK councils and housing associations. This is a multi-tenant SaaS platform with organization isolation and subscription-based access control.

## Technology Stack
- Frontend: React 18+ with TypeScript, Tailwind CSS
- Backend: Express.js with Node.js, TypeScript  
- Database: PostgreSQL with Neon hosting, Row Level Security
- Real-time: Socket.io for live updates
- Authentication: JWT tokens with session management
- Storage: Secure cloud storage with validation

## Architecture Principles
- Multi-tenant with organization isolation using RLS policies
- Role-based access control (staff, admin, platform-admin)
- Mobile-first responsive design starting from 320px
- GDPR compliance with comprehensive audit logging
- Security-first approach with input validation and sanitization

## Core Modules
1. **Dashboard** - Real-time KPI widgets and cross-module navigation
2. **Housing Management** - Property and tenant lifecycle management  
3. **Support Services** - Case management and service coordination
4. **Independence Pathway** - Goal tracking and skill development
5. **Analytics & Outcomes** - Reporting and data visualization
6. **Safeguarding** - Risk assessment and incident reporting
7. **Crisis Connect** - 24/7 emergency response system
8. **Financials** - Budget tracking and expense management
9. **Government Billing** - Automated invoicing and compliance
10. **Forms** - Dynamic form builder with validation
11. **Reports** - Scheduled generation and exports
12. **Settings** - User permissions and system configuration

## Platform Admin (Separate Interface)
- Routes: /platform-admin/* with enhanced security (MFA, IP whitelisting)
- Subscription management for three tiers:
  - Starter: £169/month (25 residents max)
  - Professional: £429/month (100 residents max)
  - Enterprise: £1099/month (unlimited residents)
- System monitoring, organization management, billing oversight
- Feature flags and emergency tools
- Data aggregation from all organization dashboards

## Emergency Features
- Crisis Line: 0800 123 4567 (24/7 available)
- Technical Support: +44 161 123 4568
- Real-time WebSocket alerts for emergencies
- Emergency contact prominence in UI
- Crisis response workflow automation

## Code Standards
- Always include loading and error states in components
- Use TypeScript interfaces for all props and API responses
- Implement Row Level Security for all database tables
- Follow mobile-first responsive design principles
- Include comprehensive audit logging for data changes
- Use consistent file naming: PascalCase for components, camelCase for utils
- Implement proper error boundaries and fallback UI
- Ensure WCAG 2.1 AA accessibility compliance

## Security Requirements
- All database tables include organization_id for isolation
- Input validation and sanitization on all endpoints
- Multi-factor authentication support
- Secure file uploads with validation
- GDPR compliance with data protection measures
- Rate limiting and CORS protection
EOF

print_status "Created .cursorrules for Cursor IDE users"

# Create detailed project instructions
cat > .copilot-instructions.md << 'EOF'
# YutHub Housing Management Platform - GitHub Copilot Instructions

## Project Overview
**Platform**: YutHub - Comprehensive housing management system for UK councils and housing associations  
**Domain**: yuthub.com  
**Company**: YutHub Solutions Ltd.  
**Architecture**: Multi-tenant SaaS with organization isolation  

## Technology Stack
- **Frontend**: React 18+ with TypeScript, Tailwind CSS
- **Backend**: Express.js with Node.js, TypeScript
- **Database**: PostgreSQL with Neon hosting
- **Real-time**: Socket.io for live updates
- **Authentication**: JWT tokens with session management
- **File Storage**: Secure cloud storage with local fallback
- **Testing**: Jest, React Testing Library

## Emergency Information & Branding

### Emergency Contacts (Display Prominently)
- **Crisis Line**: 0800 123 4567 (24/7 available)
- **Technical Support**: +44 161 123 4568
- **Emergency Escalation**: escalation@yuthub.com

### Company Information
- **Company**: YutHub Solutions Ltd.
- **Domain**: yuthub.com
- **Colors**: Professional blue/navy theme with accessibility-compliant contrast
- **Location**: London, United Kingdom

For complete instructions, see the full documentation in the project repository.
EOF

print_status "Created .copilot-instructions.md with project context"

# Create TypeScript configuration if it doesn't exist
if [ ! -f "tsconfig.json" ]; then
    cat > tsconfig.json << 'EOF'
{
  "include": [
    "client/src/**/*",
    "shared/**/*", 
    "server/**/*"
  ],
  "exclude": [
    "node_modules",
    "build",
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx"
  ],
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./node_modules/typescript/tsbuildinfo",
    "target": "ES2020",
    "lib": ["esnext", "dom", "dom.iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "noEmit": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "allowImportingTsExtensions": true,
    "declaration": true,
    "declarationMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "baseUrl": ".",
    "types": ["node", "vite/client"],
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"],
      "@/components/*": ["./client/src/components/*"],
      "@/pages/*": ["./client/src/pages/*"],
      "@/hooks/*": ["./client/src/hooks/*"],
      "@/utils/*": ["./client/src/utils/*"],
      "@/types/*": ["./client/src/types/*"],
      "@/services/*": ["./client/src/services/*"],
      "@/store/*": ["./client/src/store/*"],
      "@/assets/*": ["./client/src/assets/*"],
      "@/server/*": ["./server/*"]
    }
  },
  "ts-node": {
    "esm": true
  }
}
EOF
    print_status "Created tsconfig.json with monorepo structure and strict settings"
else
    print_info "tsconfig.json already exists, skipping creation"
fi

# Check if global copilot directory should be created
echo ""
print_info "Setting up global GitHub Copilot configuration..."

# Create global copilot directory
COPILOT_DIR="$HOME/.copilot"
if [ ! -d "$COPILOT_DIR" ]; then
    mkdir -p "$COPILOT_DIR"
    print_status "Created global copilot directory: $COPILOT_DIR"
else
    print_info "Global copilot directory already exists: $COPILOT_DIR"
fi

# Create global instructions file
cat > "$COPILOT_DIR/instructions.md" << 'EOF'
# Global GitHub Copilot Instructions

## General Development Principles

### Security First
- Always validate and sanitize user inputs
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization
- Never expose sensitive data in error messages
- Use HTTPS and secure headers for all communications

### Accessibility Standards
- Follow WCAG 2.1 AA guidelines
- Use semantic HTML elements
- Include proper ARIA labels and descriptions
- Ensure keyboard navigation support
- Maintain sufficient color contrast ratios

### Performance Optimization
- Implement code splitting and lazy loading
- Optimize images and compress assets
- Use efficient database queries with proper indexing
- Minimize bundle sizes and eliminate dead code

### Type Safety
- Use TypeScript for all JavaScript projects
- Define explicit interfaces and types
- Avoid using 'any' type unless absolutely necessary
- Use strict TypeScript configuration

### Code Quality
- Write self-documenting code with meaningful names
- Keep functions small and focused on single responsibility
- Use consistent code formatting and linting
- Write comprehensive tests for critical functionality
EOF

print_status "Created global GitHub Copilot instructions"

# Create .gitignore additions for the project
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# IDE files
.vscode/launch.json
.vscode/tasks.json
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Database
*.sqlite
*.db

# Uploads
uploads/
temp/

# Backup files
*.bak
*.backup
EOF
    print_status "Created .gitignore file"
else
    print_info ".gitignore already exists, skipping creation"
fi

echo ""
print_status "🎉 GitHub Copilot setup complete!"
echo ""
print_info "Files created:"
echo "  ✓ .vscode/settings.json - VS Code GitHub Copilot configuration"
echo "  ✓ .cursorrules - Cursor IDE configuration"
echo "  ✓ .copilot-instructions.md - Detailed project instructions"
echo "  ✓ tsconfig.json - TypeScript configuration (if not existing)"
echo "  ✓ .gitignore - Git ignore rules (if not existing)"
echo "  ✓ ~/.copilot/instructions.md - Global Copilot instructions"
echo ""
print_info "Next steps:"
echo "  1. Restart your IDE (VS Code/Cursor) to load the new settings"
echo "  2. Ensure GitHub Copilot extension is installed and active"
echo "  3. Test Copilot by typing comments describing what you want to build"
echo "  4. Example: // Create a new resident registration form with validation"
echo ""
print_warning "Note: Make sure your GitHub Copilot subscription is active"
print_info "For more information, see: https://docs.github.com/en/copilot"