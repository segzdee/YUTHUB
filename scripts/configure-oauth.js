#!/usr/bin/env node

/**
 * OAuth Configuration Helper Script
 * 
 * This script helps configure OAuth provider settings and test authentication
 */

console.log('🔧 OAuth Provider Configuration Helper');
console.log('=====================================');

// Check environment variables
const requiredEnvVars = ['REPL_ID', 'SESSION_SECRET', 'REPLIT_DOMAINS'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  process.exit(1);
}

console.log('✅ Environment variables configured:');
console.log(`   - REPL_ID: ${process.env.REPL_ID}`);
console.log(`   - SESSION_SECRET: ${process.env.SESSION_SECRET ? '[CONFIGURED]' : '[MISSING]'}`);
console.log(`   - REPLIT_DOMAINS: ${process.env.REPLIT_DOMAINS}`);
console.log(`   - ISSUER_URL: ${process.env.ISSUER_URL || 'https://replit.com/oidc (default)'}`);

console.log('\n🌍 Production Domains:');
const domains = process.env.REPLIT_DOMAINS.split(',');
domains.forEach((domain, index) => {
  console.log(`   ${index + 1}. https://${domain}`);
});

console.log('\n📝 OAuth Callback URLs to Configure:');
domains.forEach((domain, index) => {
  console.log(`   ${index + 1}. https://${domain}/api/callback`);
});

console.log('\n🔧 OAuth Provider Configuration Steps:');
console.log('1. Go to your OAuth provider console');
console.log('2. Find your application settings');
console.log('3. Add the callback URLs listed above');
console.log('4. Ensure these scopes are enabled: openid, email, profile, offline_access');
console.log('5. Save the configuration');

console.log('\n🧪 Testing URLs:');
domains.forEach((domain, index) => {
  console.log(`   ${index + 1}. https://${domain}/api/login`);
});

console.log('\n✅ Configuration ready! Update your OAuth provider with the callback URLs above.');