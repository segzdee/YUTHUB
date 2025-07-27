// Test SSL configuration and certificate validation
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Testing SSL Configuration...');

// Test certificate files
const certPath = path.join(__dirname, 'ssl', 'server.crt');
const keyPath = path.join(__dirname, 'ssl', 'server.key');

console.log('Certificate path:', certPath);
console.log('Key path:', keyPath);

// Check if files exist
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log('✅ SSL certificate files found');

  // Check file permissions
  const certStats = fs.statSync(certPath);
  const keyStats = fs.statSync(keyPath);

  console.log('Certificate permissions:', (certStats.mode & 0o777).toString(8));
  console.log('Key permissions:', (keyStats.mode & 0o777).toString(8));

  // Test certificate validity

  exec(
    `openssl x509 -in ${certPath} -text -noout | grep "Not After"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Certificate validation failed:', error.message);
      } else {
        console.log('✅ Certificate expiry:', stdout.trim());
      }
    }
  );

  // Test key validity
  exec(`openssl rsa -in ${keyPath} -check -noout`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Private key validation failed:', error.message);
    } else {
      console.log('✅ Private key is valid');
    }
  });
} else {
  console.log('❌ SSL certificate files not found');
  console.log(
    'Generate certificates with: ./scripts/generate-ssl-cert.sh self-signed'
  );
}
