#!/usr/bin/env node

const pages = [
  { name: 'Landing Page', url: 'http://localhost:5177/' },
  { name: 'Login Page', url: 'http://localhost:5177/login' },
  { name: 'Signup Page', url: 'http://localhost:5177/signup' },
  { name: 'Dashboard', url: 'http://localhost:5177/app/dashboard' },
  { name: 'Housing', url: 'http://localhost:5177/app/housing' },
  { name: 'Support', url: 'http://localhost:5177/app/support' },
  { name: 'Independence', url: 'http://localhost:5177/app/independence' },
  { name: 'Analytics', url: 'http://localhost:5177/app/analytics' },
  { name: 'Safeguarding', url: 'http://localhost:5177/app/safeguarding' },
  { name: 'Crisis', url: 'http://localhost:5177/app/crisis' },
  { name: 'Financials', url: 'http://localhost:5177/app/financials' },
  { name: 'Billing', url: 'http://localhost:5177/app/billing' },
  { name: 'Forms', url: 'http://localhost:5177/app/forms' },
  { name: 'Reports', url: 'http://localhost:5177/app/reports' },
  { name: 'Settings', url: 'http://localhost:5177/app/settings' },
  { name: 'Help', url: 'http://localhost:5177/app/help' },
  { name: '404 Not Found', url: 'http://localhost:5177/nonexistent' }
];

console.log('Testing YUTHUB Pages...\n');

async function testPage(page) {
  try {
    const response = await fetch(page.url, {
      method: 'GET',
      redirect: 'manual'
    });
    
    const status = response.status;
    const isRedirect = status >= 300 && status < 400;
    const isOk = status === 200;
    
    let result = '❌ FAILED';
    if (isOk) {
      result = '✅ OK';
    } else if (isRedirect) {
      const location = response.headers.get('location');
      result = `↪️ REDIRECT to ${location || 'unknown'}`;
    }
    
    console.log(`${page.name.padEnd(20)} ${page.url.padEnd(45)} ${status} ${result}`);
    
    return { page: page.name, status, success: isOk || isRedirect };
  } catch (error) {
    console.log(`${page.name.padEnd(20)} ${page.url.padEnd(45)} ERROR: ${error.message}`);
    return { page: page.name, status: 0, success: false };
  }
}

async function runTests() {
  const results = [];
  
  for (const page of pages) {
    const result = await testPage(page);
    results.push(result);
  }
  
  console.log('\n========================================');
  console.log('Test Summary:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('========================================');
}

runTests();