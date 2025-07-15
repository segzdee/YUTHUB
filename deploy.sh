#!/bin/bash

# Production Deployment Script for YUTHUB
# Domain: www.yuthub.com

echo "🚀 Starting YUTHUB production deployment..."

# Set production environment
export NODE_ENV=production
export PRODUCTION_DOMAIN=www.yuthub.com

# Load production environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | xargs)
fi

echo "✅ Environment configured for $PRODUCTION_DOMAIN"

# Build the application
echo "📦 Building application..."
vite build

# Database migration (if needed)
echo "🗄️  Running database migrations..."
npm run db:push

# Start the application
echo "🌐 Starting production server..."
NODE_ENV=production PRODUCTION_DOMAIN=www.yuthub.com tsx server/index.ts

echo "🎉 YUTHUB is now running in production mode!"
echo "🔗 Application URL: https://$PRODUCTION_DOMAIN"
echo ""
echo "Next steps:"
echo "1. Configure DNS records for www.yuthub.com"
echo "2. Set up SSL certificates"
echo "3. Update OAuth provider redirect URIs:"
echo "   - Google: https://www.yuthub.com/auth/google/callback"
echo "   - Microsoft: https://www.yuthub.com/auth/microsoft/callback"
echo "   - Apple: https://www.yuthub.com/auth/apple/callback"