# OAuth Callback Configuration Guide

## Production Domain Setup Complete

The application now supports stable production domains for OAuth callbacks:

### Primary Domains
- **Primary Replit Domain**: `yuthub.replit.app`
- **Custom Domain**: `yuthub.com` ✅
- **Custom Domain with WWW**: `www.yuthub.com` (verifying...)

### OAuth Callback URLs to Configure

Configure these callback URLs in your OAuth provider's console:

1. **Primary**: `https://yuthub.replit.app/api/callback`
2. **Custom**: `https://yuthub.com/api/callback`
3. **With WWW**: `https://www.yuthub.com/api/callback`

### OAuth Provider Configuration Steps

#### For Replit OIDC Provider:
1. Go to your Replit OAuth settings
2. Remove the old development callback URL:
   - `https://27891fa9-b276-4e4e-a11a-60ce998c53b2-00-2uromwtwyow5n.janeway.replit.dev/api/callback`
3. Add the new production callback URLs:
   - `https://yuthub.replit.app/api/callback`
   - `https://yuthub.com/api/callback`
   - `https://www.yuthub.com/api/callback`

#### For Other OAuth Providers (Google, Microsoft, etc.):
1. Update redirect URIs in each provider's console
2. Use the same callback URLs as above
3. Test each provider after configuration

### Authentication Flow Changes

The application now automatically:
- Registers authentication strategies for all production domains
- Handles domain detection for callbacks
- Provides proper error messages for misconfigured domains
- Maintains session persistence across all domains

### CORS Configuration

Updated CORS origins to include all production domains:
- `https://yuthub.replit.app`
- `https://yuthub.com`
- `https://www.yuthub.com`
- `https://app.yuthub.com`
- `https://admin.yuthub.com`

### Session Cookie Configuration

Production session cookies are configured with:
- **HttpOnly**: true (XSS protection)
- **Secure**: true (HTTPS only in production)
- **SameSite**: lax (CSRF protection)
- **Domain**: `.yuthub.com` or `.replit.app` (subdomain sharing)

### Testing Authentication

1. Visit `https://yuthub.com`
2. Click "Sign In" 
3. OAuth should redirect to provider
4. After authentication, should redirect back to `https://yuthub.com/api/callback`
5. Session should persist across page refreshes

### Benefits of This Setup

✅ **Stable URLs**: No more changing development domains
✅ **Professional**: Clean yuthub.com branding
✅ **Secure**: HTTPS-only with proper cookie configuration
✅ **Flexible**: Multiple domain support for different use cases
✅ **Production-Ready**: Proper session management and security

### Troubleshooting

If authentication fails:
1. Check OAuth provider console for correct callback URLs
2. Verify domain is properly configured in DNS
3. Check browser developer tools for cookie issues
4. Review server logs for authentication errors

### Security Considerations

- All authentication endpoints require HTTPS in production
- Session cookies are HTTP-only and secure
- CORS is restricted to known domains
- OAuth state parameter validation prevents CSRF attacks