import { Express } from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SSLOptions {
  key: Buffer;
  cert: Buffer;
}

export function loadSSLCertificates(): SSLOptions | null {
  try {
    const keyPath = path.join(__dirname, '../ssl/server.key');
    const certPath = path.join(__dirname, '../ssl/server.crt');

    // Check if SSL files exist
    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      console.log('📋 SSL certificates not found. Running in HTTP mode.');
      return null;
    }

    const key = fs.readFileSync(keyPath);
    const cert = fs.readFileSync(certPath);

    console.log('🔒 SSL certificates loaded successfully');
    return { key, cert };
  } catch (error) {
    console.error('❌ Failed to load SSL certificates:', error);
    return null;
  }
}

export function createSecureServer(app: Express): https.Server | http.Server {
  const sslOptions = loadSSLCertificates();

  if (sslOptions) {
    // Create HTTPS server
    const httpsServer = https.createServer(sslOptions, app);
    console.log('🔒 HTTPS server created');
    return httpsServer;
  } else {
    // Fallback to HTTP server
    const httpServer = http.createServer(app);
    console.log('🌐 HTTP server created (SSL not available)');
    return httpServer;
  }
}

export function setupSSLRedirect(app: Express): void {
  // Redirect HTTP to HTTPS if SSL is enabled
  app.use((req, res, next) => {
    const isSSLEnabled = process.env.HTTPS_ENABLED === 'true';
    const forwardedProto = req.header('x-forwarded-proto');
    const isSecure = req.secure || forwardedProto === 'https';

    if (isSSLEnabled && !isSecure) {
      const redirectUrl = `https://${req.header('host')}${req.url}`;
      console.log(`🔄 Redirecting to HTTPS: ${redirectUrl}`);
      return res.redirect(301, redirectUrl);
    }

    next();
  });
}

export function setupSecurityHeaders(app: Express): void {
  // Add security headers for HTTPS
  app.use((req, res, next) => {
    const isSSLEnabled = process.env.HTTPS_ENABLED === 'true';

    if (isSSLEnabled) {
      // Strict Transport Security
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    // General security headers
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()'
    );

    next();
  });
}

export function validateSSLCertificate(): boolean {
  try {
    const sslOptions = loadSSLCertificates();

    if (!sslOptions) {
      console.log('📋 No SSL certificates found for validation');
      return false;
    }

    // Basic certificate validation
    const certString = sslOptions.cert.toString();
    const keyString = sslOptions.key.toString();

    // Check if certificate and key contain required headers
    const hasCertHeader = certString.includes('-----BEGIN CERTIFICATE-----');
    const hasKeyHeader =
      keyString.includes('-----BEGIN PRIVATE KEY-----') ||
      keyString.includes('-----BEGIN RSA PRIVATE KEY-----') ||
      keyString.includes('-----BEGIN EC PRIVATE KEY-----');

    if (!hasCertHeader || !hasKeyHeader) {
      console.error('❌ Invalid SSL certificate format');
      return false;
    }

    console.log('✅ SSL certificate validation passed');
    return true;
  } catch (error) {
    console.error('❌ SSL certificate validation failed:', error);
    return false;
  }
}

export function getServerPort(): { port: number; isSSL: boolean } {
  const isSSLEnabled = process.env.HTTPS_ENABLED === 'true';
  const sslOptions = loadSSLCertificates();

  console.log('🔍 SSL Configuration Debug:');
  console.log('  HTTPS_ENABLED:', process.env.HTTPS_ENABLED);
  console.log('  SSL enabled:', isSSLEnabled);
  console.log('  SSL certificates available:', sslOptions ? 'Yes' : 'No');

  // For Replit deployment, always use port 5000
  const port = parseInt(process.env.PORT || '5000', 10);

  if (isSSLEnabled && sslOptions && validateSSLCertificate()) {
    return { port, isSSL: true };
  }

  return { port, isSSL: false };
}
