import express from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import { authenticateUser, getUserOrganization } from '../middleware/auth.js';
import { log } from '../utils/logger.js';
import { captureException } from '../utils/monitoring.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Allowed MIME types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

router.use(authenticateUser);
router.use(getUserOrganization);

/**
 * POST /api/files/upload
 * Upload file to Supabase Storage
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { entityType, entityId, description, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!entityType || !entityId) {
      return res.status(400).json({
        error: 'Missing required fields: entityType and entityId',
      });
    }

    const file = req.file;
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${organizationId}/${entityType}/${entityId}/${timestamp}-${sanitizedFilename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(storagePath);

    // Save metadata to database
    const { data: attachment, error: dbError } = await supabase
      .from('attachments')
      .insert({
        organization_id: organizationId,
        entity_type: entityType,
        entity_id: entityId,
        file_name: file.originalname,
        file_size: file.size,
        file_type: file.mimetype,
        storage_path: storagePath,
        public_url: publicUrl,
        description: description || null,
        tags: tags ? JSON.parse(tags) : null,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (dbError) {
      // Cleanup storage if database insert fails
      await supabase.storage
        .from('attachments')
        .remove([storagePath]);

      throw dbError;
    }

    log.audit('file_uploaded', userId, {
      filename: file.originalname,
      entityType,
      entityId,
      fileSize: file.size,
    });

    res.status(201).json({
      success: true,
      attachment,
    });
  } catch (error) {
    log.error('File upload error', { error: error.message });
    captureException(error, { endpoint: '/api/files/upload' });

    res.status(500).json({
      error: 'Failed to upload file',
      message: error.message,
    });
  }
});

/**
 * GET /api/files/:id
 * Get file metadata
 */
router.get('/:id', async (req, res) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;

    const { data: attachment, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) throw error;

    if (!attachment) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ attachment });
  } catch (error) {
    log.error('Get file error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

/**
 * GET /api/files/entity/:entityType/:entityId
 * List files for an entity
 */
router.get('/entity/:entityType/:entityId', async (req, res) => {
  try {
    const { organizationId } = req;
    const { entityType, entityId } = req.params;

    const { data: attachments, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ attachments: attachments || [] });
  } catch (error) {
    log.error('List files error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

/**
 * DELETE /api/files/:id
 * Delete file
 */
router.delete('/:id', async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { id } = req.params;

    // Get file metadata
    const { data: attachment, error: fetchError } = await supabase
      .from('attachments')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError) throw fetchError;

    if (!attachment) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('attachments')
      .remove([attachment.storage_path]);

    if (storageError) {
      log.warn('Storage delete failed', {
        error: storageError.message,
        path: attachment.storage_path,
      });
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('attachments')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (dbError) throw dbError;

    log.audit('file_deleted', userId, {
      filename: attachment.file_name,
      entityType: attachment.entity_type,
      entityId: attachment.entity_id,
    });

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    log.error('Delete file error', { error: error.message });
    captureException(error, { endpoint: '/api/files/delete' });

    res.status(500).json({ error: 'Failed to delete file' });
  }
});

/**
 * GET /api/files/:id/download
 * Get signed URL for file download
 */
router.get('/:id/download', async (req, res) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;

    const { data: attachment, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) throw error;

    if (!attachment) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Generate signed URL (valid for 1 hour)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('attachments')
      .createSignedUrl(attachment.storage_path, 3600);

    if (urlError) throw urlError;

    res.json({
      downloadUrl: signedUrlData.signedUrl,
      filename: attachment.file_name,
      expiresIn: 3600,
    });
  } catch (error) {
    log.error('Generate download URL error', { error: error.message });
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

export default router;
