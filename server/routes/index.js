import express from 'express';
import authRoutes from './auth.js';
import residentsRoutes from './residents.js';
import propertiesRoutes from './properties.js';
import stripeRoutes from './stripe.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/residents', residentsRoutes);
router.use('/properties', propertiesRoutes);
router.use('/stripe', stripeRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      websockets: process.env.ENABLE_WEBSOCKETS === 'true',
      stripe: process.env.ENABLE_STRIPE_PAYMENTS === 'true',
    },
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'YUTHUB Housing Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      residents: '/api/residents',
      properties: '/api/properties',
      stripe: '/api/stripe',
      health: '/api/health',
    },
  });
});

export default router;
