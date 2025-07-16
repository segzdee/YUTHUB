# OAuth Provider Configuration Guide

## Replit OIDC Configuration

### Current Configuration Status
- **REPL_ID**: ✅ Configured
- **SESSION_SECRET**: ✅ Configured  
- **ISSUER_URL**: Using default `https://replit.com/oidc`

### Required Callback URLs

Configure these callback URLs in your Replit OAuth settings:

```
https://yuthub.replit.app/api/callback
https://yuthub.com/api/callback
https://www.yuthub.com/api/callback
```

### Step-by-Step Configuration

#### 1. Access Replit OAuth Settings
1. Go to [Replit Teams/Apps Settings](https://replit.com/account/apps)
2. Find your application with REPL_ID: `${process.env.REPL_ID}`
3. Click "Edit" or "Configure"

#### 2. Update Redirect URIs
Remove old development URLs and add production URLs:

**Remove (if present):**
```
https://27891fa9-b276-4e4e-a11a-60ce998c53b2-00-2uromwtwyow5n.janeway.replit.dev/api/callback
```

**Add these stable production URLs:**
```
https://yuthub.replit.app/api/callback
https://yuthub.com/api/callback
https://www.yuthub.com/api/callback
```

#### 3. Configure OAuth Scopes
Ensure these scopes are enabled:
- `openid`
- `email`
- `profile`
- `offline_access`

#### 4. Save Configuration
Click "Save" or "Update" to apply the changes

### Testing the Configuration

After updating the OAuth provider settings:

1. **Test Primary Domain**: Visit `https://yuthub.replit.app`
2. **Test Custom Domain**: Visit `https://yuthub.com` (once DNS is configured)
3. **Test WWW Domain**: Visit `https://www.yuthub.com` (once DNS is configured)

### Authentication Flow Test

1. Click "Sign In" on any domain
2. Should redirect to Replit OAuth
3. After authentication, should redirect back to your domain
4. Should maintain session across page refreshes

### Troubleshooting

If you see `invalid_redirect_uri` error:
- Verify callback URLs are exactly as specified above
- Check that the domain is properly configured in Replit OAuth settings
- Ensure HTTPS is used for all production URLs

If authentication succeeds but session doesn't persist:
- Check browser cookies are being set
- Verify the domain configuration in session settings
- Check for CORS issues in browser developer tools

### Environment Variables

Current configuration uses these environment variables:
- `REPL_ID`: Your Replit application ID
- `SESSION_SECRET`: Secret key for session signing
- `ISSUER_URL`: OAuth provider URL (defaults to https://replit.com/oidc)

### Security Considerations

- All callback URLs use HTTPS
- Session cookies are HTTP-only and secure
- CORS is restricted to known domains
- OAuth state parameter validation prevents CSRF

### Next Steps

1. Configure the OAuth provider with the callback URLs above
2. Test authentication on each domain
3. Verify session persistence works correctly
4. Monitor logs for any authentication errors