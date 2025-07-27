# Hostinger Domain Setup for YUTHUB

## Domain: yuthub.com (Purchased on Hostinger)

### Current Application Status

- ✅ Application fully configured for www.yuthub.com
- ✅ OAuth callbacks configured
- ✅ SEO and meta tags ready
- ✅ Production environment configured

## Recommended Approach: Replit Deployment + Hostinger DNS

This is the **easiest and most reliable** option:

### Step 1: Deploy on Replit

1. Click the "Deploy" button in Replit
2. Choose "Autoscale" deployment
3. Replit will provide a URL like: `https://yuthub.replit.app`

### Step 2: Configure DNS in Hostinger

1. Log into your Hostinger account
2. Go to **Domains** → **Manage** → **DNS/Nameservers**
3. Add these DNS records:

```
Type: CNAME
Name: www
Value: yuthub.replit.app
TTL: 3600

Type: A
Name: @
Value: [Get IP from ping yuthub.replit.app]
TTL: 3600
```

### Step 3: Configure Custom Domain in Replit

1. In Replit deployment settings
2. Add custom domain: `www.yuthub.com`
3. Replit will handle SSL automatically

## Alternative: Traditional Hosting Setup

If you prefer traditional hosting:

### Step 1: Choose Hosting Provider

- **AWS EC2**: $5-10/month
- **DigitalOcean Droplet**: $5/month
- **Google Cloud Run**: Pay-per-use
- **Hostinger VPS**: $3.99/month

### Step 2: Deploy Application

```bash
# On your server
git clone [your-repo]
cd yuthub
npm install
npm run db:push
./deploy.sh
```

### Step 3: Configure DNS in Hostinger

```
Type: A
Name: www
Value: [YOUR_SERVER_IP]
TTL: 3600

Type: A
Name: @
Value: [YOUR_SERVER_IP]
TTL: 3600
```

### Step 4: Set Up SSL

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yuthub.com -d www.yuthub.com
```

## Environment Variables for Production

Set these in your hosting environment:

```bash
NODE_ENV=production
PRODUCTION_DOMAIN=www.yuthub.com
DATABASE_URL=[your_database_url]
SESSION_SECRET=[your_session_secret]
GOOGLE_CLIENT_ID=[your_google_client_id]
GOOGLE_CLIENT_SECRET=[your_google_client_secret]
MICROSOFT_CLIENT_ID=[your_microsoft_client_id]
MICROSOFT_CLIENT_SECRET=[your_microsoft_client_secret]
```

## OAuth Provider Updates Required

Once domain is live, update these in your OAuth consoles:

### Google OAuth Console

- Authorized domains: `yuthub.com`
- Redirect URI: `https://www.yuthub.com/auth/google/callback`

### Microsoft Azure AD

- Redirect URI: `https://www.yuthub.com/auth/microsoft/callback`

### Apple Sign-In

- Redirect URI: `https://www.yuthub.com/auth/apple/callback`

## Testing After Setup

1. Visit https://www.yuthub.com
2. Test SSL certificate
3. Verify OAuth login flows
4. Check sitemap: https://www.yuthub.com/sitemap.xml

## Timeline

- **DNS Propagation**: 1-24 hours
- **SSL Certificate**: 5-10 minutes
- **Full Setup**: 1-2 hours

## Next Steps

1. Choose deployment method (Replit recommended)
2. Configure DNS in Hostinger
3. Update OAuth providers
4. Test the live application
