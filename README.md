# YUTHUB - Youth Housing Management System

A comprehensive SaaS platform for youth housing organizations, providing advanced administrative technologies to streamline service management and support independent living pathways.

## 🚀 Features

### Core Functionality

- **Housing Management**: Property tracking, resident management, occupancy monitoring
- **Support Services**: Individual support plans, progress tracking, outcome monitoring
- **Safeguarding**: Incident reporting, risk assessment, crisis response
- **Financial Management**: Billing, payments, budget tracking, cost analysis
- **Independence Pathways**: Skills tracking, goal setting, transition planning
- **Crisis Connect**: Emergency response system with 24/7 support access

### Technical Features

- **Multi-tenant Architecture**: Organization-level data isolation
- **Role-based Access Control**: Staff, coordinators, managers, admin roles
- **Real-time Updates**: WebSocket integration for live data synchronization
- **Comprehensive Analytics**: Dashboard metrics, reporting, trend analysis
- **Cross-module Integration**: Unified data sharing across all modules
- **Mobile-first Design**: Responsive interface optimized for all devices

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18 with TypeScript, Vite
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL via Neon Database with Drizzle ORM
- **Authentication**: Replit OIDC + OAuth integration
- **UI Framework**: Radix UI components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing

### Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express.js backend
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   └── replitAuth.ts      # Authentication configuration
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema definitions
└── docs/                  # Documentation files
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Environment variables configured

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd yuthub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
REPL_ID=your_replit_app_id
REPLIT_DOMAINS=your_domains_comma_separated
NODE_ENV=development
```

## 📊 Database Schema

### Core Entities

- **Users**: Staff authentication and profiles
- **Organizations**: Multi-tenant organization management
- **Properties**: Housing units with capacity tracking
- **Residents**: Young people in the system
- **Support Plans**: Individual care plans
- **Incidents**: Safety and behavioral incidents
- **Activities**: Daily activities and progress
- **Financial Records**: Billing and cost tracking

### Features

- **Comprehensive Indexing**: Optimized for performance
- **Foreign Key Relationships**: Data integrity enforcement
- **Audit Trails**: Complete change tracking
- **Multi-tenancy**: Organization-level data isolation

## 🔐 Security Features

### Authentication

- **Multi-method Authentication**: OIDC, OAuth, email/password
- **Session Management**: Secure PostgreSQL-backed sessions
- **MFA Support**: Time-based OTP authentication
- **Account Security**: Lockout protection, password policies

### Authorization

- **Role-based Access Control**: Granular permissions system
- **Data Isolation**: Organization-level security boundaries
- **API Protection**: Rate limiting, input validation
- **Audit Logging**: Comprehensive security event tracking

## 🚀 Deployment

### Production Checklist

- [ ] SSL certificates configured
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] OAuth providers configured
- [ ] Monitoring setup
- [ ] Backup procedures established

### Deployment Options

- **Replit Deployments**: One-click deployment with automatic scaling
- **Self-hosted**: Deploy to your own infrastructure
- **Cloud Providers**: AWS, Google Cloud, Azure compatible

## 📈 Performance

### Optimizations

- **Connection Pooling**: Optimized database connections
- **Memory Management**: Real-time monitoring and cleanup
- **Caching**: LRU caching for frequently accessed data
- **Background Jobs**: Automated maintenance and notifications
- **Query Optimization**: Indexed queries and performance monitoring

### Monitoring

- Health check endpoints
- Memory usage tracking
- Request performance metrics
- Database connection monitoring
- Error tracking and alerting

## 🤝 Contributing

### Development Guidelines

- Follow TypeScript best practices
- Use Prettier for code formatting
- Write tests for critical functionality
- Document API changes
- Follow semantic versioning

### Code Style

- Use consistent naming conventions
- Keep functions focused and testable
- Implement proper error handling
- Add JSDoc comments for public APIs

## 📝 API Documentation

### Authentication Endpoints

- `GET /api/auth/user` - Get current user
- `POST /api/auth/login` - Email/password login
- `GET /api/auth/callback` - OAuth callback

### Core API Routes

- `GET /api/dashboard/metrics` - Dashboard statistics
- `GET /api/properties` - Property management
- `GET /api/residents` - Resident management
- `GET /api/incidents` - Incident reporting
- `GET /api/financials` - Financial records

## 🆘 Support

### Documentation

- [Setup Guide](docs/SETUP.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Guide](docs/SECURITY.md)

### Help Resources

- Issue tracking via GitHub Issues
- Community discussions
- Documentation wiki
- Video tutorials

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for UK youth housing organizations
- Designed with input from housing professionals
- Compliant with UK data protection regulations
- Accessibility-first approach (WCAG 2.1 AA)

---

**YUTHUB** - Empowering young people through better housing management technology.
