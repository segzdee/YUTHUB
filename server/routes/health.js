import express from 'express';
import { supabase } from '../config/supabase.js';
import { getCircuitBreakerStates } from '../utils/circuitBreaker.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {},
  };

  try {
    const { error: dbError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);

    health.services.database = {
      status: dbError ? 'unhealthy' : 'healthy',
      responseTime: Date.now(),
      ...(dbError && { error: dbError.message }),
    };
  } catch (error) {
    health.services.database = {
      status: 'unhealthy',
      error: error.message,
    };
    health.status = 'degraded';
  }

  try {
    const { data: authHealth, error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    health.services.auth = {
      status: authError ? 'unhealthy' : 'healthy',
      ...(authError && { error: authError.message }),
    };
  } catch (error) {
    health.services.auth = {
      status: 'unhealthy',
      error: error.message,
    };
    health.status = 'degraded';
  }

  health.services.circuitBreakers = getCircuitBreakerStates();

  const hasUnhealthyService = Object.values(health.services).some(
    service => service.status === 'unhealthy'
  );

  if (hasUnhealthyService) {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;

  res.status(statusCode).json(health);
});

router.get('/ready', async (req, res) => {
  try {
    const { error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);

    if (error) {
      return res.status(503).json({
        ready: false,
        error: error.message,
      });
    }

    res.json({ ready: true });
  } catch (error) {
    res.status(503).json({
      ready: false,
      error: error.message,
    });
  }
});

router.get('/live', (req, res) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
