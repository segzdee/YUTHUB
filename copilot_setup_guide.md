# GitHub Copilot Custom Instructions Setup Guide

## Method 1: VS Code Workspace Settings (Recommended)

### 1. Create/Edit Workspace Settings

Create or edit `.vscode/settings.json` in your project root:

```json
{
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "text": "You are working on a comprehensive housing management platform called YutHub for UK councils and housing associations. Use React with TypeScript, Express.js backend, PostgreSQL with Neon, Tailwind CSS, and Socket.io for real-time features.",
      "file": "**/*"
    },
    {
      "text": "Always implement mobile-first responsive design, role-based access control (staff, admin, platform-admin), and multi-tenant architecture with organization isolation. Include comprehensive error handling with user-friendly messages.",
      "file": "**/*"
    },
    {
      "text": "For frontend components: Use consistent branding, implement loading states and error boundaries, ensure WCAG 2.1 AA accessibility compliance, validate forms with real-time feedback, and maintain clean component structure.",
      "file": "**/*.tsx,**/*.jsx,**/*.ts,**/*.js"
    },
    {
      "text": "For backend API: Follow RESTful design with consistent JSON responses, implement proper authentication with JWT tokens, use Row Level Security policies for data isolation, include audit logging for all actions, and ensure GDPR compliance.",
      "file": "**/server/**/*,**/api/**/*"
    },
    {
      "text": "Database schema must include proper indexes, foreign key constraints, timestamps (created_at, updated_at), and RLS policies. Tables should support multi-tenancy with organization_id fields.",
      "file": "**/*.sql,**/migrations/**/*"
    },
    {
      "text": "Security requirements: Input sanitization, SQL injection prevention, secure file uploads with validation, proper CORS configuration, encrypted data storage, and comprehensive audit trails.",
      "file": "**/*"
    },
    {
      "text": "Platform includes these core modules: Dashboard (KPIs), Housing Management (properties/residents), Support Services (case management), Independence Pathway (goal tracking), Analytics & Outcomes (reporting), Safeguarding (risk assessment), Crisis Connect (24/7 emergency), Financials (budget tracking), Government Billing (automated invoicing), Forms (dynamic builder), Reports (scheduled), Settings (permissions), Help & Support.",
      "file": "**/*"
    },
    {
      "text": "Platform admin features (separate from organization): subscription management (Starter/Professional/Enterprise tiers), system monitoring, organization management, billing oversight, feature flags, emergency tools. Use /platform-admin/* routes with enhanced security.",
      "file": "**/platform-admin/**/*,**/admin/**/*"
    }
  ]
}
```

### 2. User-Level Settings (Optional)

Edit VS Code user settings (`Ctrl+,` → Open Settings JSON):

```json
{
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "text": "Always prioritize accessibility, security, and performance. Use TypeScript for type safety, implement proper error handling, and follow mobile-first design principles.",
      "file": "**/*"
    }
  ]
}
```

## Method 2: Project-Level Instructions File

### Create `.copilot-instructions.md` in project root:

````markdown
# YutHub Housing Management Platform - Copilot Instructions

## Project Context

- **Platform**: Comprehensive housing management system for UK councils and housing associations
- **Domain**: yuthub.com
- **Tech Stack**: React + TypeScript, Express.js, PostgreSQL (Neon), Tailwind CSS, Socket.io
- **Architecture**: Multi-tenant SaaS with organization isolation

## Coding Standards

### Frontend (React/TypeScript)

- Use functional components with hooks
- Implement mobile-first responsive design with Tailwind CSS
- Include loading states, error boundaries, and accessibility features
- Form validation with real-time feedback using react-hook-form + zod
- Consistent component structure with proper TypeScript interfaces

### Backend (Express.js/Node.js)

- RESTful API design with consistent JSON responses
- JWT authentication with session management
- Comprehensive error handling and logging
- Input validation and sanitization
- Rate limiting and security headers

### Database (PostgreSQL)

- Row Level Security (RLS) policies for multi-tenancy
- Proper indexing and foreign key constraints
- Audit logging for all data changes
- Timestamps on all tables (created_at, updated_at)

## Key Features to Remember

### Core Modules

1. **Dashboard** - Real-time KPI widgets and cross-module navigation
2. **Housing Management** - Property and tenant lifecycle management
3. **Support Services** - Case management and service coordination
4. **Independence Pathway** - Goal tracking and skill development
5. **Analytics & Outcomes** - Reporting and data visualization
6. **Safeguarding** - Risk assessments and incident reporting
7. **Crisis Connect** - 24/7 emergency response system
8. **Financials** - Budget tracking and expense management
9. **Government Billing** - Automated invoicing and compliance
10. **Forms** - Dynamic form builder with validation
11. **Reports** - Scheduled generation and exports
12. **Settings** - User permissions and system configuration

### Platform Admin (Separate Interface)

- Subscription management (Starter £169/mo, Professional £429/mo, Enterprise £1099/mo)
- System monitoring and analytics aggregation
- Organization management and billing oversight
- Feature flags and emergency tools
- Routes: /platform-admin/\* with enhanced security

### Security & Compliance

- GDPR compliance with data protection
- Multi-factor authentication (MFA) support
- Role-based access control (staff, admin, platform-admin)
- Comprehensive audit trails
- Secure file upload and storage

### User Experience

- Professional design with consistent branding
- Emergency contact information prominently displayed
- Mobile-optimized for field workers
- Offline capabilities for critical functions
- Accessibility compliance (WCAG 2.1 AA)

## Common Patterns

### API Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    pagination?: PaginationInfo;
    timestamp: string;
  };
}
```
````

### Component Structure

```typescript
interface ComponentProps {
  // Props definition
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks
  // Event handlers
  // Render logic with proper loading/error states
};

export default Component;
```

### Database Table Pattern

```sql
CREATE TABLE table_name (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  -- other fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policy for organization isolation
CREATE POLICY org_isolation ON table_name
  FOR ALL USING (organization_id = current_setting('app.current_organization_id')::INTEGER);
```

## File Naming Conventions

- Components: PascalCase (e.g., `DashboardWidget.tsx`)
- Hooks: camelCase with "use" prefix (e.g., `useResidents.ts`)
- Utils: camelCase (e.g., `formatCurrency.ts`)
- API routes: kebab-case (e.g., `/api/support-plans`)
- Database tables: snake_case (e.g., `support_plans`)

## Emergency Contacts & Branding

- Crisis Line: 0800 123 4567 (24/7)
- Technical Support: +44 161 123 4568
- Company: YutHub Solutions Ltd.
- Colors: Professional blue/navy theme with accessibility compliant contrast

```

## Method 3: IDE-Specific Setup

### JetBrains IDEs (WebStorm, IntelliJ IDEA)
1. Go to `Settings` → `Tools` → `GitHub Copilot`
2. Add custom instructions in the configuration panel
3. Apply project-specific context

### Cursor IDE
1. Create `.cursorrules` file in project root:

```

# YutHub Housing Management Platform Rules

## Project Context

You are working on YutHub, a comprehensive housing management platform for UK councils and housing associations using React + TypeScript, Express.js, PostgreSQL (Neon), Tailwind CSS, and Socket.io.

## Key Principles

- Multi-tenant SaaS with organization isolation using RLS policies
- Mobile-first responsive design with accessibility (WCAG 2.1 AA)
- Role-based access control (staff, admin, platform-admin)
- Comprehensive audit logging and GDPR compliance
- Professional branding with emergency contact prominence

## Core Modules

Dashboard, Housing Management, Support Services, Independence Pathway, Analytics & Outcomes, Safeguarding, Crisis Connect, Financials, Government Billing, Forms, Reports, Settings, Help & Support

## Platform Admin (Separate)

Subscription management, system monitoring, organization management, billing oversight, feature flags, emergency tools at /platform-admin/\* routes

## Pricing Tiers

- Starter: £169/month (25 residents max)
- Professional: £429/month (100 residents max)
- Enterprise: £1099/month (unlimited residents)

## Always Include

- Loading states and error boundaries
- Real-time validation with user-friendly messages
- Proper TypeScript interfaces
- Security measures and input sanitization
- Mobile optimization for field workers

````

## Method 4: Global Git Configuration

### Create global .copilot directory
```bash
# Create global copilot config directory
mkdir -p ~/.copilot

# Create global instructions file
touch ~/.copilot/instructions.md
````

### Add to global instructions:

```markdown
# Global Development Standards

## General Principles

- Security first: Always validate inputs and sanitize outputs
- Accessibility: Ensure WCAG 2.1 AA compliance
- Performance: Optimize for mobile and slow networks
- Type Safety: Use TypeScript for all new JavaScript code
- Testing: Include unit tests for critical functions

## Code Quality

- Use meaningful variable and function names
- Include comprehensive error handling
- Add proper documentation and comments
- Follow consistent code formatting
```

## Verification & Testing

### Test Copilot Instructions

1. Open a new file in your project
2. Start typing a comment describing what you want to build
3. Check if Copilot suggestions align with your platform requirements
4. Test with different file types (.tsx, .ts, .sql, .md)

### Example Test Prompts

```typescript
// Create a new resident registration form with validation
// Build a maintenance request component with photo upload
// Generate an API endpoint for creating support plans
// Write a database migration for the incidents table
```

## Troubleshooting

### Instructions Not Working

1. Restart VS Code/IDE
2. Check GitHub Copilot extension is enabled
3. Verify JSON syntax in settings files
4. Check file path patterns in instructions
5. Ensure GitHub Copilot subscription is active

### Performance Issues

1. Limit instruction length (keep under 500 characters per instruction)
2. Use specific file patterns instead of "\*_/_"
3. Organize instructions by file type/context
4. Remove duplicate or conflicting instructions

## Maintenance

### Regular Updates

- Review and update instructions monthly
- Add new patterns as the project evolves
- Remove outdated technology references
- Keep examples current with latest features

### Team Synchronization

- Share .vscode/settings.json in version control
- Document any team-specific conventions
- Regular team reviews of code generation quality
- Update instructions based on code review feedback
