# SSL Deployment Checklist for yuthub.com

## Pre-Deployment Verification

### 1. SSL Certificate Status

- [ ] SSL certificate files exist in `/ssl/` directory
- [ ] Certificate is valid and not expired
- [ ] Certificate includes all required domains (yuthub.com, www.yuthub.com)
- [ ] Private key file has correct permissions (600)
- [ ] Certificate file has correct permissions (644)

### 2. Application Configuration

- [ ] HTTPS server configuration implemented
- [ ] SSL redirect middleware configured
- [ ] Security headers implemented
- [ ] Cookie security updated for HTTPS
- [ ] CORS origins updated for HTTPS domains
- [ ] Environment variables configured

### 3. Database SSL Configuration

- [ ] Database SSL enabled
- [ ] Connection string updated for SSL
- [ ] SSL certificate validation configured
- [ ] Database connection pooling updated for SSL

## Deployment Steps

### Step 1: Generate SSL Certificate

**Option A: Let's Encrypt (Recommended for Production)**

```bash
# Install certbot
sudo apt update && sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d yuthub.com -d www.yuthub.com

# Copy to project
sudo cp /etc/letsencrypt/live/yuthub.com/fullchain.pem ssl/server.crt
sudo cp /etc/letsencrypt/live/yuthub.com/privkey.pem ssl/server.key
```

**Option B: Self-Signed Certificate (Development)**

```bash
# Generate self-signed certificate
./scripts/generate-ssl-cert.sh self-signed
```

### Step 2: Update Environment Configuration

```bash
# Update .env.production
echo "HTTPS_ENABLED=true" >> .env.production
echo "DATABASE_SSL=true" >> .env.production
```

### Step 3: Configure DNS Records

- [ ] A record: yuthub.com → Server IP
- [ ] CNAME record: www.yuthub.com → yuthub.com
- [ ] Verify DNS propagation

### Step 4: Update OAuth Providers

- [ ] Google OAuth: Update redirect URIs to https://
- [ ] Microsoft OAuth: Update redirect URIs to https://
- [ ] Apple OAuth: Update redirect URIs to https://

### Step 5: Test SSL Configuration

```bash
# Test certificate
openssl x509 -in ssl/server.crt -text -noout

# Test SSL connection
openssl s_client -connect yuthub.com:443 -servername yuthub.com

# Test application
curl -v https://yuthub.com/api/monitoring/health
```

## Post-Deployment Verification

### 1. SSL Certificate Validation

- [ ] SSL Labs test score A+ (https://www.ssllabs.com/ssltest/)
- [ ] Certificate chain is complete
- [ ] No mixed content warnings
- [ ] HSTS header present

### 2. Application Functionality

- [ ] Login/logout works correctly
- [ ] API endpoints respond over HTTPS
- [ ] WebSocket connections work
- [ ] File uploads work
- [ ] All pages load without errors

### 3. Security Headers

- [ ] Strict-Transport-Security header
- [ ] X-Frame-Options header
- [ ] X-Content-Type-Options header
- [ ] X-XSS-Protection header
- [ ] Referrer-Policy header

### 4. Database Security

- [ ] Database connections use SSL
- [ ] Connection pooling works with SSL
- [ ] No SSL-related connection errors
- [ ] Performance impact acceptable

## Monitoring and Maintenance

### 1. Certificate Monitoring

- [ ] Certificate expiration monitoring
- [ ] Automatic renewal configured
- [ ] Renewal process tested
- [ ] Notification alerts configured

### 2. Performance Monitoring

- [ ] SSL handshake performance
- [ ] Connection pool performance
- [ ] Memory usage monitoring
- [ ] Response time monitoring

### 3. Security Monitoring

- [ ] SSL certificate validity
- [ ] Security header compliance
- [ ] Mixed content detection
- [ ] HTTPS redirect functioning

## Troubleshooting Common Issues

### Certificate Issues

- **Error**: "Certificate not trusted"
  - **Solution**: Ensure certificate chain is complete
  - **Check**: Verify intermediate certificates included

- **Error**: "Certificate expired"
  - **Solution**: Renew certificate immediately
  - **Check**: Set up automatic renewal

### Connection Issues

- **Error**: "SSL connection failed"
  - **Solution**: Check certificate and key file permissions
  - **Check**: Verify SSL configuration

- **Error**: "Mixed content warnings"
  - **Solution**: Update all HTTP links to HTTPS
  - **Check**: Audit all external resources

### Performance Issues

- **Error**: "Slow SSL handshake"
  - **Solution**: Optimize SSL configuration
  - **Check**: Review cipher suites and TLS versions

## Current Status

### SSL Certificate

- **Status**: ✅ Self-signed certificate generated for development
- **Domains**: yuthub.com, www.yuthub.com, yuthub.replit.app, localhost
- **Expiry**: 365 days from generation
- **Type**: RSA 4096-bit

### Application Configuration

- **Status**: ✅ HTTPS server support implemented
- **SSL Redirect**: ✅ Configured
- **Security Headers**: ✅ Implemented
- **Environment**: ✅ Development ready

### Database Configuration

- **Status**: ⚠️ SSL disabled (development mode)
- **Connection**: HTTP mode
- **Recommendation**: Enable for production

## Next Steps

1. **Development Testing**
   - Test SSL certificate with development domain
   - Verify all functionality works with self-signed certificate
   - Test SSL redirect and security headers

2. **Production Preparation**
   - Obtain Let's Encrypt certificate for production
   - Configure DNS records
   - Update OAuth provider settings

3. **Deployment**
   - Enable HTTPS in production environment
   - Enable database SSL
   - Verify all functionality

4. **Monitoring**
   - Set up certificate expiration monitoring
   - Configure automatic renewal
   - Monitor SSL performance

## Support Information

- **SSL Certificate Generator**: `./scripts/generate-ssl-cert.sh`
- **SSL Configuration**: `server/https.ts`
- **Environment Config**: `.env.ssl`
- **Documentation**: `SSL_CERTIFICATE_INSTALLATION_GUIDE.md`

For additional support, refer to the SSL Certificate Installation Guide.
