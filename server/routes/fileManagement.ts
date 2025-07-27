import { Router } from 'express';
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import {
  upload,
  generateThumbnail,
  compressImage,
  checkFileAccess,
  checkStorageQuota,
  getStorageAnalytics,
  initializeFileUploadService,
} from '../services/fileUploadService';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import { z } from 'zod';

const router = Router();

// Initialize file upload service
initializeFileUploadService();

// File upload schema validation
const fileUploadSchema = z.object({
  entityType: z.string(),
  entityId: z.string().transform(Number),
  documentType: z.string(),
  description: z.string().optional(),
  tags: z.string().optional(),
  isConfidential: z
    .string()
    .optional()
    .transform(val => val === 'true'),
});

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    organizationId: number;
    subscriptionTier: string;
  };
}

// Upload multiple files
router.post(
  '/upload',
  isAuthenticated,
  upload.array('files', 10),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validatedData = fileUploadSchema.parse(req.body);
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const userId = req.user!.id;
      const organizationId = req.user!.organizationId;
      const uploadedFiles = [];

      for (const file of files) {
        try {
          // Check storage quota
          const quotaCheck = await checkStorageQuota(organizationId, file.size);
          if (!quotaCheck.allowed) {
            return res.status(413).json({
              error: 'Storage quota exceeded',
              currentUsage: quotaCheck.currentUsage,
              limit: quotaCheck.limit,
            });
          }

          // Generate file checksum
          const checksum = crypto
            .createHash('md5')
            .update(fs.readFileSync(file.path))
            .digest('hex');

          // Generate thumbnail if image
          const thumbnailPath = await generateThumbnail(
            file.path,
            file.filename
          );

          // Compress image if needed
          await compressImage(file.path);

          // Create document record
          const document = await storage.createDocument({
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
            filePath: file.path,
            thumbnailPath: thumbnailPath || undefined,
            uploadedBy: userId,
            entityType: validatedData.entityType,
            entityId: validatedData.entityId,
            documentType: validatedData.documentType,
            description: validatedData.description,
            tags: validatedData.tags
              ? validatedData.tags.split(',').map(tag => tag.trim())
              : [],
            isConfidential: validatedData.isConfidential || false,
            checksum,
          });

          // Log file upload
          await storage.logFileAccess({
            documentId: document.id,
            userId,
            actionType: 'upload',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            fileSize: file.size,
            success: true,
          });

          uploadedFiles.push(document);
        } catch (error) {
          console.error('Error processing file:', error);
          // Clean up file on error
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          throw error;
        }
      }

      res.json({
        success: true,
        files: uploadedFiles,
        message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ error: 'Failed to upload files' });
    }
  }
);

// Get documents with filtering
router.get(
  '/documents',
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { entityType, entityId, documentType, search } = req.query;

      let documents;
      if (search) {
        documents = await storage.searchDocuments(search as string, {
          entityType: entityType as string,
          documentType: documentType as string,
        });
      } else {
        documents = await storage.getDocuments({
          entityType: entityType as string,
          entityId: entityId ? parseInt(entityId as string) : undefined,
          documentType: documentType as string,
        });
      }

      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  }
);

// Get single document
router.get(
  '/documents/:id',
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Check file access permissions
      const hasAccess = await checkFileAccess(
        req.user!.id,
        documentId,
        req.user!.organizationId
      );
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(document);
    } catch (error) {
      console.error('Error fetching document:', error);
      res.status(500).json({ error: 'Failed to fetch document' });
    }
  }
);

// Download file
router.get(
  '/download/:id',
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Check file access permissions
      const hasAccess = await checkFileAccess(
        req.user!.id,
        documentId,
        req.user!.organizationId
      );
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check if file exists
      if (!fs.existsSync(document.filePath)) {
        return res.status(404).json({ error: 'File not found on disk' });
      }

      const startTime = Date.now();

      // Update download count and last accessed
      await storage.updateDocument(documentId, {
        downloadCount: (document.downloadCount || 0) + 1,
        lastAccessedAt: new Date(),
      });

      // Log file access
      await storage.logFileAccess({
        documentId,
        userId: req.user!.id,
        actionType: 'download',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        fileSize: document.fileSize,
        downloadDuration: Date.now() - startTime,
        success: true,
      });

      // Set appropriate headers
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${document.originalName}"`
      );
      res.setHeader('Content-Length', document.fileSize.toString());

      // Stream file to client
      const fileStream = fs.createReadStream(document.filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ error: 'Failed to download file' });
    }
  }
);

// Get thumbnail
router.get(
  '/thumbnail/:id',
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);

      if (!document || !document.thumbnailPath) {
        return res.status(404).json({ error: 'Thumbnail not found' });
      }

      // Check file access permissions
      const hasAccess = await checkFileAccess(
        req.user!.id,
        documentId,
        req.user!.organizationId
      );
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check if thumbnail exists
      if (!fs.existsSync(document.thumbnailPath)) {
        return res.status(404).json({ error: 'Thumbnail not found on disk' });
      }

      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

      const thumbnailStream = fs.createReadStream(document.thumbnailPath);
      thumbnailStream.pipe(res);
    } catch (error) {
      console.error('Error serving thumbnail:', error);
      res.status(500).json({ error: 'Failed to serve thumbnail' });
    }
  }
);

// Update document metadata
router.patch(
  '/documents/:id',
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const { description, tags, isConfidential } = req.body;

      // Check file access permissions
      const hasAccess = await checkFileAccess(
        req.user!.id,
        documentId,
        req.user!.organizationId
      );
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updates: Partial<any> = {};
      if (description !== undefined) updates.description = description;
      if (tags !== undefined)
        updates.tags = Array.isArray(tags)
          ? tags
          : tags.split(',').map((tag: string) => tag.trim());
      if (isConfidential !== undefined) updates.isConfidential = isConfidential;

      const document = await storage.updateDocument(documentId, updates);
      res.json(document);
    } catch (error) {
      console.error('Error updating document:', error);
      res.status(500).json({ error: 'Failed to update document' });
    }
  }
);

// Delete document
router.delete(
  '/documents/:id',
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Check file access permissions
      const hasAccess = await checkFileAccess(
        req.user!.id,
        documentId,
        req.user!.organizationId
      );
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Delete files from disk
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
      if (document.thumbnailPath && fs.existsSync(document.thumbnailPath)) {
        fs.unlinkSync(document.thumbnailPath);
      }

      // Delete from database
      await storage.deleteDocument(documentId);

      // Log file deletion
      await storage.logFileAccess({
        documentId,
        userId: req.user!.id,
        actionType: 'delete',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        success: true,
      });

      res.json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  }
);

// Share document
router.post(
  '/share',
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { documentId, sharedWith, accessLevel, expiresAt, shareReason } =
        req.body;

      // Check file access permissions
      const hasAccess = await checkFileAccess(
        req.user!.id,
        documentId,
        req.user!.organizationId
      );
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const share = await storage.createFileShare({
        documentId,
        sharedBy: req.user!.id,
        sharedWith,
        accessLevel: accessLevel || 'view',
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        shareReason,
      });

      res.json(share);
    } catch (error) {
      console.error('Error sharing document:', error);
      res.status(500).json({ error: 'Failed to share document' });
    }
  }
);

// Get file shares
router.get(
  '/shares/:documentId',
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const documentId = parseInt(req.params.documentId);

      // Check file access permissions
      const hasAccess = await checkFileAccess(
        req.user!.id,
        documentId,
        req.user!.organizationId
      );
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const shares = await storage.getFileShares(documentId);
      res.json(shares);
    } catch (error) {
      console.error('Error fetching file shares:', error);
      res.status(500).json({ error: 'Failed to fetch file shares' });
    }
  }
);

// Revoke file share
router.delete(
  '/shares/:shareId',
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const shareId = parseInt(req.params.shareId);
      await storage.revokeFileShare(shareId);
      res.json({ success: true, message: 'File share revoked' });
    } catch (error) {
      console.error('Error revoking file share:', error);
      res.status(500).json({ error: 'Failed to revoke file share' });
    }
  }
);

// Get file access logs
router.get(
  '/access-logs/:documentId',
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const documentId = parseInt(req.params.documentId);

      // Check file access permissions
      const hasAccess = await checkFileAccess(
        req.user!.id,
        documentId,
        req.user!.organizationId
      );
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const logs = await storage.getFileAccessLogs(documentId);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching access logs:', error);
      res.status(500).json({ error: 'Failed to fetch access logs' });
    }
  }
);

// Get storage analytics
router.get(
  '/analytics',
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const analytics = await getStorageAnalytics(req.user!.organizationId);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching storage analytics:', error);
      res.status(500).json({ error: 'Failed to fetch storage analytics' });
    }
  }
);

export default router;
