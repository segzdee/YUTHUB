# YUTHUB Production Deployment Guide

## Domain Migration Complete ✅

All application components have been successfully migrated to **www.yuthub.com**

## Updated Components

### Frontend Updates
- ✅ All SEO meta tags updated to use www.yuthub.com
- ✅ Canonical URLs updated across all pages
- ✅ Structured data markup updated
- ✅ Sitemap.xml generation updated
- ✅ Header logo links updated
- ✅ All static pages (Privacy, Terms, Cookies, Accessibility) updated

### Backend Updates
- ✅ CORS configuration updated for production and development
- ✅ OAuth callback URLs configured with dynamic domain support
- ✅ Session cookie domain properly configured
- ✅ Authentication system updated for production

### Configuration Files
- ✅ `.env.production` created with production settings
- ✅ `deploy.sh` script created for production deployment
- ✅ Dynamic environment-based configuration implemented

## Production Environment Variables

```bash
NODE_ENV=production
PRODUCTION_DOMAIN=www.yuthub.com
APP_URL=https://www.yuthub.com
SESSION_DOMAIN=yuthub.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
```

## OAuth Provider Configuration Required

### Google OAuth Console
- Update redirect URI: `https://www.yuthub.com/auth/google/callback`
- Authorized domains: `yuthub.com`

### Microsoft Azure AD
- Update redirect URI: `https://www.yuthub.com/auth/microsoft/callback`
- Authorized domains: `yuthub.com`

### Apple Sign-In
- Update redirect URI: `https://www.yuthub.com/auth/apple/callback`
- Authorized domains: `yuthub.com`

## DNS Configuration Required

```
# A Record
www.yuthub.com → [SERVER_IP]

# CNAME Record (optional for naked domain)
yuthub.com → www.yuthub.com
```

## SSL/TLS Configuration

- SSL certificate required for www.yuthub.com
- Ensure HTTPS enforcement is enabled
- Configure security headers

## Deployment Commands

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run production deployment
./deploy.sh
```

## Production Checklist

- [ ] DNS records configured
- [ ] SSL certificates installed
- [ ] OAuth providers updated
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Application deployed and running

## Post-Deployment Verification

1. Visit https://www.yuthub.com
2. Test authentication flows
3. Verify SEO meta tags in page source
4. Check sitemap.xml at https://www.yuthub.com/sitemap.xml
5. Validate SSL certificate
6. Test OAuth login flows

## Support

For deployment issues or domain configuration help, contact the development team.