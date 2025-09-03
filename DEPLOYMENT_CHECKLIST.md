# YUTHUB Deployment Checklist

## Pre-Deployment Checks

### 1. Code Quality
- [x] TypeScript compilation passes (`npm run type-check`)
- [x] ESLint checks pass (`npm run lint`)
- [ ] All tests pass (`npm test`)
- [x] Build completes successfully (`npm run build`)

### 2. Environment Configuration
- [x] `.env.example` file created with all required variables
- [ ] Production `.env` file configured with:
  - [ ] Production database URL
  - [ ] Strong JWT_SECRET and SESSION_SECRET
  - [ ] OAuth credentials for production URLs
  - [ ] Stripe production keys
  - [ ] SMTP configuration for emails
  - [ ] SSL certificates (if self-hosting)

### 3. Database
- [ ] Database migrations run (`npm run db:migrate`)
- [ ] Database schema validated (`npm run validate:db`)
- [ ] Platform admin seeded (`npm run seed:admin`)
- [ ] UK councils populated (`npm run populate:councils`)
- [ ] Database backups configured

### 4. Security
- [ ] All secrets rotated for production
- [ ] SSL/HTTPS configured
- [ ] CORS origins set correctly for production
- [ ] Rate limiting configured
- [ ] Input sanitization enabled
- [ ] Security headers configured (Helmet)
- [ ] 2FA enabled for admin accounts

### 5. Dependencies
- [ ] Production dependencies installed (`npm ci --production`)
- [ ] Security vulnerabilities checked (`npm audit`)
- [ ] Unused dependencies removed
- [ ] Package versions locked

## Deployment Steps

### Option 1: Deploy to Vercel (Recommended for Frontend)
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy

### Option 2: Deploy to Railway/Render (Full Stack)
1. Create new project
2. Connect GitHub repository
3. Configure environment variables
4. Set build command: `npm run build`
5. Set start command: `npm start`
6. Configure PostgreSQL database add-on
7. Deploy

### Option 3: Deploy to VPS (Self-Hosted)
1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 20+
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib
   
   # Install PM2
   npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx
   ```

2. **Application Setup**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/yuthub.git
   cd yuthub
   
   # Install dependencies
   npm ci --production
   
   # Build application
   npm run build
   
   # Setup database
   npm run db:migrate
   npm run seed:admin
   npm run populate:councils
   ```

3. **Configure PM2**
   Create `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'yuthub',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```
   
   Start with PM2:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx**
   ```nginx
   server {
     listen 80;
     server_name yuthub.com www.yuthub.com;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

5. **Setup SSL with Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yuthub.com -d www.yuthub.com
   ```

## Post-Deployment Checks

### 1. Functionality Tests
- [ ] User registration works
- [ ] User login works (all auth methods)
- [ ] Dashboard loads correctly
- [ ] Forms submit successfully
- [ ] File uploads work
- [ ] WebSocket connections establish
- [ ] Email notifications sent
- [ ] Payment processing works

### 2. Performance
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database queries optimized
- [ ] CDN configured for static assets
- [ ] Gzip compression enabled

### 3. Monitoring
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured
- [ ] Log aggregation setup
- [ ] Database monitoring enabled
- [ ] SSL certificate monitoring

### 4. Backup & Recovery
- [ ] Database backups scheduled
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented
- [ ] Data retention policies configured

## Rollback Plan
1. Keep previous deployment version available
2. Database migration rollback scripts ready
3. DNS failover configured (if applicable)
4. Communication plan for users

## Known Issues to Fix
- [ ] TypeScript errors in `server/utils/dataIntegrity.ts`
- [ ] TypeScript errors in `server/websocket.ts` (unused interfaces)
- [ ] TypeScript errors in `shared/schema.ts`
- [x] Import casing issues resolved
- [x] PageLoader export issues fixed
- [x] ErrorBoundary TypeScript issues fixed

## Contact Information
- Technical Lead: [Your Name]
- DevOps Contact: [Contact Info]
- Emergency Hotline: +44 161 123 4568

## Deployment Log
| Date | Version | Deployed By | Notes |
|------|---------|-------------|-------|
| TBD  | 1.0.0   | TBD         | Initial deployment |

## Additional Resources
- [Production Configuration Guide](./docs/PRODUCTION_DEPLOYMENT.md)
- [SSL Certificate Installation Guide](./SSL_CERTIFICATE_INSTALLATION_GUIDE.md)
- [Database Security Audit](./docs/DATABASE_SECURITY_AUDIT_REPORT.md)
- [API Documentation](./docs/api-documentation.md)