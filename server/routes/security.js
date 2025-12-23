import express from 'express';
import { authenticateUser, requireRole } from '../middleware/auth.js';
import {
  getSecurityDashboard,
  getAuthAttemptsByTimeframe,
  getUserSecurityHistory,
  getAnomalousActivity,
  getSecurityMetrics,
  alertOnCriticalEvents,
} from '../utils/securityMonitoring.js';

const router = express.Router();

router.get('/dashboard', authenticateUser, requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const dashboard = await getSecurityDashboard(timeRange);
    res.json(dashboard);
  } catch (error) {
    console.error('Security dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch security dashboard' });
  }
});

router.get('/metrics', authenticateUser, requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const metrics = await getSecurityMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Security metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch security metrics' });
  }
});

router.get('/attempts/timeline', authenticateUser, requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const { timeframe = 'hour', limit = 24 } = req.query;
    const data = await getAuthAttemptsByTimeframe(timeframe, parseInt(limit));
    res.json({ data, timeframe, limit });
  } catch (error) {
    console.error('Auth attempts timeline error:', error);
    res.status(500).json({ error: 'Failed to fetch auth attempts timeline' });
  }
});

router.get('/anomalies', authenticateUser, requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const { threshold = 5 } = req.query;
    const anomalies = await getAnomalousActivity(parseInt(threshold));
    res.json(anomalies);
  } catch (error) {
    console.error('Anomalous activity error:', error);
    res.status(500).json({ error: 'Failed to fetch anomalous activity' });
  }
});

router.get('/user/:userId/history', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    if (req.userId !== userId && !['owner', 'admin'].includes(req.userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const history = await getUserSecurityHistory(userId, parseInt(limit));
    res.json(history);
  } catch (error) {
    console.error('User security history error:', error);
    res.status(500).json({ error: 'Failed to fetch user security history' });
  }
});

router.get('/alerts', authenticateUser, requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const criticalEvents = await alertOnCriticalEvents();
    res.json({ alerts: criticalEvents, count: criticalEvents.length });
  } catch (error) {
    console.error('Security alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch security alerts' });
  }
});

export default router;
