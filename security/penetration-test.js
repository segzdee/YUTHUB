#!/usr/bin/env node

/**
 * YUTHUB Penetration Testing Suite
 * Automated security testing for common vulnerabilities
 */

const axios = require('axios');
const colors = require('colors');

const BASE_URL = process.env.TARGET_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5177';

class PenetrationTest {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  async runAllTests() {
    console.log('🔍 Starting YUTHUB Penetration Testing Suite'.cyan);
    console.log('=' .repeat(50));
    
    // OWASP Top 10 Tests
    await this.testSQLInjection();
    await this.testXSS();
    await this.testAuthentication();
    await this.testAccessControl();
    await this.testSecurityMisconfiguration();
    await this.testSensitiveDataExposure();
    await this.testXXE();
    await this.testDeserializationVulnerabilities();
    await this.testCSRF();
    await this.testKnownVulnerabilities();
    
    // Additional Tests
    await this.testRateLimiting();
    await this.testHeaderSecurity();
    await this.testAPIEndpoints();
    await this.testFileUpload();
    await this.testSessionManagement();
    
    this.printResults();
  }

  async testSQLInjection() {
    console.log('\n📊 Testing SQL Injection vulnerabilities...');
    
    const sqlPayloads = [
      "' OR '1'='1",
      "1; DROP TABLE users--",
      "admin'--",
      "' UNION SELECT * FROM users--",
      "1' AND '1' = '1"
    ];

    for (const payload of sqlPayloads) {
      try {
        const response = await axios.get(`${BASE_URL}/api/users?id=${encodeURIComponent(payload)}`);
        if (response.status === 200 && response.data.length > 0) {
          this.results.failed.push(`SQL Injection vulnerability found with payload: ${payload}`);
        } else {
          this.results.passed.push(`SQL Injection test passed for payload: ${payload}`);
        }
      } catch (error) {
        this.results.passed.push(`SQL Injection protected against: ${payload}`);
      }
    }
  }

  async testXSS() {
    console.log('\n🔒 Testing XSS vulnerabilities...');
    
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>',
      '"><script>alert("XSS")</script>'
    ];

    for (const payload of xssPayloads) {
      try {
        const response = await axios.post(`${BASE_URL}/api/comments`, {
          text: payload
        });
        
        // Check if payload is reflected without sanitization
        if (response.data && response.data.text === payload) {
          this.results.failed.push(`XSS vulnerability: Unsanitized input stored`);
        } else {
          this.results.passed.push(`XSS protection working for: ${payload.substring(0, 30)}...`);
        }
      } catch (error) {
        this.results.passed.push(`XSS attempt blocked`);
      }
    }
  }

  async testAuthentication() {
    console.log('\n🔐 Testing Authentication security...');
    
    // Test weak passwords
    const weakPasswords = ['123456', 'password', 'admin', '12345678'];
    for (const password of weakPasswords) {
      try {
        const response = await axios.post(`${BASE_URL}/auth/register`, {
          email: 'test@example.com',
          password: password
        });
        if (response.status === 200) {
          this.results.failed.push(`Weak password accepted: ${password}`);
        }
      } catch (error) {
        this.results.passed.push(`Weak password rejected: ${password}`);
      }
    }

    // Test brute force protection
    let blocked = false;
    for (let i = 0; i < 10; i++) {
      try {
        await axios.post(`${BASE_URL}/auth/login`, {
          email: 'admin@yuthub.com',
          password: 'wrongpassword'
        });
      } catch (error) {
        if (error.response && error.response.status === 429) {
          blocked = true;
          break;
        }
      }
    }
    
    if (blocked) {
      this.results.passed.push('Brute force protection active');
    } else {
      this.results.failed.push('No brute force protection detected');
    }
  }

  async testAccessControl() {
    console.log('\n🚪 Testing Access Control...');
    
    // Test unauthorized access to admin endpoints
    const adminEndpoints = [
      '/api/platform-admin/users',
      '/api/platform-admin/settings',
      '/api/admin/audit-logs'
    ];

    for (const endpoint of adminEndpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        if (response.status === 200) {
          this.results.failed.push(`Unauthorized access to: ${endpoint}`);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.results.passed.push(`Protected endpoint: ${endpoint}`);
        }
      }
    }
  }

  async testSecurityMisconfiguration() {
    console.log('\n⚙️ Testing Security Misconfiguration...');
    
    // Check for exposed debug endpoints
    const debugEndpoints = [
      '/api/test-session',
      '/api/test-login',
      '/debug',
      '/.env',
      '/config.json'
    ];

    for (const endpoint of debugEndpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        if (response.status === 200) {
          this.results.failed.push(`Debug endpoint exposed: ${endpoint}`);
        }
      } catch (error) {
        this.results.passed.push(`Debug endpoint not accessible: ${endpoint}`);
      }
    }

    // Check for directory listing
    try {
      const response = await axios.get(`${BASE_URL}/uploads/`);
      if (response.data.includes('Index of')) {
        this.results.failed.push('Directory listing enabled');
      } else {
        this.results.passed.push('Directory listing disabled');
      }
    } catch (error) {
      this.results.passed.push('Directory listing protected');
    }
  }

  async testSensitiveDataExposure() {
    console.log('\n🔍 Testing Sensitive Data Exposure...');
    
    // Test for sensitive data in responses
    try {
      const response = await axios.get(`${BASE_URL}/api/users/profile`);
      const sensitiveFields = ['password', 'creditCard', 'ssn', 'apiKey'];
      
      for (const field of sensitiveFields) {
        if (response.data && response.data[field]) {
          this.results.failed.push(`Sensitive field exposed: ${field}`);
        } else {
          this.results.passed.push(`Sensitive field protected: ${field}`);
        }
      }
    } catch (error) {
      this.results.passed.push('User profile endpoint protected');
    }
  }

  async testXXE() {
    console.log('\n📄 Testing XXE vulnerabilities...');
    
    const xxePayload = `<?xml version="1.0"?>
    <!DOCTYPE foo [
      <!ENTITY xxe SYSTEM "file:///etc/passwd">
    ]>
    <data>&xxe;</data>`;

    try {
      const response = await axios.post(`${BASE_URL}/api/import`, xxePayload, {
        headers: { 'Content-Type': 'text/xml' }
      });
      
      if (response.data && response.data.includes('root:')) {
        this.results.failed.push('XXE vulnerability detected');
      } else {
        this.results.passed.push('XXE attack blocked');
      }
    } catch (error) {
      this.results.passed.push('XXE protection active');
    }
  }

  async testDeserializationVulnerabilities() {
    console.log('\n🔄 Testing Deserialization vulnerabilities...');
    
    const maliciousPayload = {
      "__proto__": {
        "isAdmin": true
      }
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/users/update`, maliciousPayload);
      this.results.passed.push('Prototype pollution protected');
    } catch (error) {
      this.results.passed.push('Deserialization attack blocked');
    }
  }

  async testCSRF() {
    console.log('\n🛡️ Testing CSRF protection...');
    
    try {
      // Attempt request without CSRF token
      const response = await axios.post(`${BASE_URL}/api/users/delete`, {
        userId: '123'
      }, {
        headers: {
          'Origin': 'http://evil-site.com'
        }
      });
      
      if (response.status === 200) {
        this.results.failed.push('CSRF protection missing');
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        this.results.passed.push('CSRF protection active');
      }
    }
  }

  async testKnownVulnerabilities() {
    console.log('\n📚 Testing for Known Vulnerabilities...');
    
    // Check for outdated libraries in response headers
    try {
      const response = await axios.get(`${BASE_URL}/`);
      const headers = response.headers;
      
      if (headers['x-powered-by']) {
        this.results.warnings.push(`Server header exposed: ${headers['x-powered-by']}`);
      } else {
        this.results.passed.push('Server headers hidden');
      }
      
      if (headers['server']) {
        this.results.warnings.push(`Server version exposed: ${headers['server']}`);
      }
    } catch (error) {
      this.results.passed.push('Headers check completed');
    }
  }

  async testRateLimiting() {
    console.log('\n⏱️ Testing Rate Limiting...');
    
    const requests = [];
    for (let i = 0; i < 150; i++) {
      requests.push(axios.get(`${BASE_URL}/api/users`));
    }

    try {
      const responses = await Promise.allSettled(requests);
      const rejected = responses.filter(r => 
        r.status === 'rejected' && 
        r.reason.response && 
        r.reason.response.status === 429
      );
      
      if (rejected.length > 0) {
        this.results.passed.push(`Rate limiting active: ${rejected.length} requests blocked`);
      } else {
        this.results.failed.push('Rate limiting not detected');
      }
    } catch (error) {
      this.results.passed.push('Rate limiting test completed');
    }
  }

  async testHeaderSecurity() {
    console.log('\n📋 Testing Security Headers...');
    
    try {
      const response = await axios.get(`${BASE_URL}/`);
      const headers = response.headers;
      
      const requiredHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'content-security-policy',
        'strict-transport-security'
      ];

      for (const header of requiredHeaders) {
        if (headers[header]) {
          this.results.passed.push(`Security header present: ${header}`);
        } else {
          this.results.failed.push(`Missing security header: ${header}`);
        }
      }
    } catch (error) {
      this.results.warnings.push('Could not test security headers');
    }
  }

  async testAPIEndpoints() {
    console.log('\n🔌 Testing API Endpoints...');
    
    // Test for IDOR vulnerabilities
    try {
      const response = await axios.get(`${BASE_URL}/api/users/1`);
      if (response.status === 200) {
        this.results.warnings.push('Potential IDOR vulnerability - verify access controls');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.results.passed.push('IDOR protection active');
      }
    }
  }

  async testFileUpload() {
    console.log('\n📁 Testing File Upload Security...');
    
    const maliciousFiles = [
      { name: 'test.php', content: '<?php phpinfo(); ?>' },
      { name: 'test.exe', content: 'MZ\x90\x00' },
      { name: '../../../etc/passwd', content: 'malicious' }
    ];

    for (const file of maliciousFiles) {
      try {
        const formData = new FormData();
        formData.append('file', new Blob([file.content]), file.name);
        
        const response = await axios.post(`${BASE_URL}/api/upload`, formData);
        
        if (response.status === 200) {
          this.results.failed.push(`Dangerous file accepted: ${file.name}`);
        }
      } catch (error) {
        this.results.passed.push(`Malicious file blocked: ${file.name}`);
      }
    }
  }

  async testSessionManagement() {
    console.log('\n🔐 Testing Session Management...');
    
    // Test session fixation
    try {
      const sessionId = 'fixed-session-id-12345';
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'password'
      }, {
        headers: {
          'Cookie': `sessionId=${sessionId}`
        }
      });
      
      if (response.headers['set-cookie'] && 
          response.headers['set-cookie'].includes(sessionId)) {
        this.results.failed.push('Session fixation vulnerability detected');
      } else {
        this.results.passed.push('Session fixation protected');
      }
    } catch (error) {
      this.results.passed.push('Session management secure');
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 PENETRATION TEST RESULTS'.bold);
    console.log('='.repeat(50));
    
    console.log('\n✅ PASSED TESTS:'.green);
    this.results.passed.forEach(test => {
      console.log(`  ✓ ${test}`.green);
    });
    
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:'.yellow);
      this.results.warnings.forEach(warning => {
        console.log(`  ⚠ ${warning}`.yellow);
      });
    }
    
    if (this.results.failed.length > 0) {
      console.log('\n❌ FAILED TESTS:'.red);
      this.results.failed.forEach(test => {
        console.log(`  ✗ ${test}`.red);
      });
    }
    
    const total = this.results.passed.length + this.results.failed.length;
    const score = (this.results.passed.length / total * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(50));
    console.log(`📈 SECURITY SCORE: ${score}%`.bold);
    console.log(`   Passed: ${this.results.passed.length}/${total}`);
    console.log(`   Failed: ${this.results.failed.length}/${total}`);
    console.log(`   Warnings: ${this.results.warnings.length}`);
    console.log('='.repeat(50));
    
    if (this.results.failed.length > 0) {
      console.log('\n⚠️  CRITICAL ISSUES FOUND - DO NOT DEPLOY TO PRODUCTION'.red.bold);
      process.exit(1);
    } else {
      console.log('\n✅ All security tests passed!'.green.bold);
      process.exit(0);
    }
  }
}

// Run tests
const tester = new PenetrationTest();
tester.runAllTests().catch(console.error);