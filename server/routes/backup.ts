import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { backupManager } from '../services/backupManager';

const router = Router();

// List all backups
router.get('/backups', requireAuth, requireRole(['ADMIN', 'PLATFORM_ADMIN']), async (req, res) => {
  try {
    const backups = await backupManager.listBackups();
    res.json({ backups });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// Create manual backup
router.post('/backups', requireAuth, requireRole(['ADMIN', 'PLATFORM_ADMIN']), async (req, res) => {
  try {
    const { type = 'full' } = req.body;
    const result = await backupManager.createBackup(type);
    res.json({ backup: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Restore from backup
router.post('/backups/:id/restore', requireAuth, requireRole(['PLATFORM_ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    await backupManager.restoreFromBackup(id);
    res.json({ message: 'Restore completed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

export default router;