#!/usr/bin/env node

/**
 * Production OAuth Setup Script
 *
 * This script displays the OAuth configuration for production domains
 */

console.log('🔧 Production OAuth Configuration');
console.log('=================================');

// Production domains
const productionDomains = ['yuthub.replit.app', 'yuthub.com', 'www.yuthub.com'];

console.log('📝 OAuth Callback URLs to Configure:');
productionDomains.forEach((domain, index) => {
  console.log(`   ${index + 1}. https://${domain}/api/callback`);
});

console.log('\n🔧 Replit OAuth Provider Configuration:');
console.log('1. Go to https://replit.com/account/apps');
console.log('2. Find your application or create a new one');
console.log('3. Add these callback URLs:');
productionDomains.forEach((domain, index) => {
  console.log(`   - https://${domain}/api/callback`);
});

console.log('\n⚙️  Required OAuth Scopes:');
console.log('   - openid');
console.log('   - email');
console.log('   - profile');
console.log('   - offline_access');

console.log('\n🧪 Test Authentication:');
productionDomains.forEach((domain, index) => {
  console.log(`   ${index + 1}. Visit https://${domain}`);
  console.log(
    `      Click "Sign In" → Should redirect to OAuth → Return authenticated`
  );
});

console.log('\n✅ After configuring OAuth provider:');
console.log('   1. Test authentication on each domain');
console.log('   2. Verify session persistence across page refreshes');
console.log('   3. Check browser cookies are being set properly');

console.log('\n🚨 Important Notes:');
console.log('   - All URLs must use HTTPS');
console.log('   - Callback URLs must match exactly');
console.log('   - Remove any old development callback URLs');
console.log('   - Test on all domains after configuration');
