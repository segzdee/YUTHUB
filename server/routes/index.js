import express from 'express';
import authRoutes from './auth.js';
import dashboardRoutes from './dashboard.js';
import residentsRoutes from './residents.js';
import supportPlansRoutes from './support-plans.js';
import propertiesRoutes from './properties.js';
import complianceRoutes from './compliance.js';
import reportsRoutes from './reports.js';
import billingRoutes from './billing.js';
import usersRoutes from './users.js';
import organizationsRoutes from './organizations.js';
import stripeRoutes from './stripe.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/residents', residentsRoutes);
router.use('/support-plans', supportPlansRoutes);
router.use('/properties', propertiesRoutes);
router.use('/compliance', complianceRoutes);
router.use('/reports', reportsRoutes);
router.use('/billing', billingRoutes);
router.use('/users', usersRoutes);
router.use('/organizations', organizationsRoutes);
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
    description: 'Complete API for UK youth housing management',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      residents: '/api/residents',
      supportPlans: '/api/support-plans',
      properties: '/api/properties',
      compliance: '/api/compliance',
      reports: '/api/reports',
      billing: '/api/billing',
      users: '/api/users',
      organizations: '/api/organizations',
      stripe: '/api/stripe',
      health: '/api/health',
    },
    documentation: 'All endpoints require authentication except /auth/login and /auth/register',
  });
});

export default router;
