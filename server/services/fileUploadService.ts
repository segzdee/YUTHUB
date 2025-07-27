import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import crypto from 'crypto';
import { storage } from '../storage';

const UPLOAD_BASE_PATH = './uploads';
const THUMBNAIL_PATH = './uploads/thumbnails';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// File type validation
const ALLOWED_MIME_TYPES = [
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

// Ensure upload directories exist
export function initializeFileUploadService(): void {
  const directories = [
    UPLOAD_BASE_PATH,
    THUMBNAIL_PATH,
    path.join(UPLOAD_BASE_PATH, 'documents'),
    path.join(UPLOAD_BASE_PATH, 'photos'),
    path.join(UPLOAD_BASE_PATH, 'contracts'),
    path.join(UPLOAD_BASE_PATH, 'certificates'),
    path.join(UPLOAD_BASE_PATH, 'forms'),
    path.join(UPLOAD_BASE_PATH, 'receipts'),
    path.join(UPLOAD_BASE_PATH, 'reports'),
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Multer configuration
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    const documentType = req.body.documentType || 'documents';
    const uploadPath = path.join(UPLOAD_BASE_PATH, documentType);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    const safeName = baseName.replace(/[^a-zA-Z0-9]/g, '_');

    cb(null, `${safeName}_${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

export const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
  fileFilter,
});

// Generate thumbnail for images
export async function generateThumbnail(
  filePath: string,
  filename: string
): Promise<string | null> {
  try {
    const ext = path.extname(filename).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);

    if (!isImage) {
      return null;
    }

    const thumbnailFilename = `thumb_${filename.replace(ext, '.jpg')}`;
    const thumbnailPath = path.join(THUMBNAIL_PATH, thumbnailFilename);

    await sharp(filePath)
      .resize(300, 300, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return thumbnailPath;
  } catch (error) {
    console.error('Thumbnail generation failed:', error);
    return null;
  }
}

// Compress images
export async function compressImage(filePath: string): Promise<void> {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);

    if (!isImage) {
      return;
    }

    const tempPath = filePath + '.tmp';

    await sharp(filePath).jpeg({ quality: 85 }).toFile(tempPath);

    // Replace original with compressed version
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    console.error('Image compression failed:', error);
    // Clean up temp file if it exists
    const tempPath = filePath + '.tmp';
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}

// Check file access permissions
export async function checkFileAccess(
  userId: string,
  documentId: number,
  organizationId: number
): Promise<boolean> {
  try {
    const document = await storage.getDocument(documentId);
    if (!document) {
      return false;
    }

    // Check if user uploaded the file
    if (document.uploadedBy === userId) {
      return true;
    }

    // Check if file is shared with user
    const shares = await storage.getFileShares(documentId);
    const userShare = shares.find(share => share.sharedWith === userId);

    if (userShare && !userShare.isRevoked) {
      // Check if share hasn't expired
      if (userShare.expiresAt && userShare.expiresAt < new Date()) {
        return false;
      }
      return true;
    }

    // Additional organization-level checks could go here
    return false;
  } catch (error) {
    console.error('File access check failed:', error);
    return false;
  }
}

// Check storage quota
export async function checkStorageQuota(
  organizationId: number,
  additionalSize: number
): Promise<{ allowed: boolean; currentUsage: number; limit: number }> {
  try {
    const analytics = await getStorageAnalytics(organizationId);
    const newUsage = analytics.totalSize + additionalSize;

    return {
      allowed: newUsage <= analytics.limit,
      currentUsage: analytics.totalSize,
      limit: analytics.limit,
    };
  } catch (error) {
    console.error('Storage quota check failed:', error);
    return {
      allowed: false,
      currentUsage: 0,
      limit: 0,
    };
  }
}

// Get storage analytics
export async function getStorageAnalytics(organizationId: number): Promise<{
  totalFiles: number;
  totalSize: number;
  limit: number;
  usagePercentage: number;
}> {
  try {
    // Get all documents for organization
    const documents = await storage.getDocuments({});

    // Filter by organization (would need to add organization filtering to storage)
    const totalFiles = documents.length;
    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);

    // Storage limits based on subscription tier
    const limit = 10 * 1024 * 1024 * 1024; // 10GB default
    const usagePercentage = (totalSize / limit) * 100;

    return {
      totalFiles,
      totalSize,
      limit,
      usagePercentage,
    };
  } catch (error) {
    console.error('Storage analytics failed:', error);
    return {
      totalFiles: 0,
      totalSize: 0,
      limit: 0,
      usagePercentage: 0,
    };
  }
}

// Clean up orphaned files
export async function cleanupOrphanedFiles(): Promise<void> {
  try {
    const documents = await storage.getDocuments({});
    const documentPaths = new Set(documents.map(doc => doc.filePath));

    // Scan upload directories
    const scanDir = (dirPath: string) => {
      if (!fs.existsSync(dirPath)) return;

      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else {
          // Check if file is referenced in database
          if (!documentPaths.has(fullPath)) {
            // File is orphaned, delete it
            fs.unlinkSync(fullPath);
            console.log(`Deleted orphaned file: ${fullPath}`);
          }
        }
      }
    };

    scanDir(UPLOAD_BASE_PATH);
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

// Schedule cleanup task
export function scheduleCleanupTask(): void {
  // Run cleanup every 24 hours
  setInterval(cleanupOrphanedFiles, 24 * 60 * 60 * 1000);
}

// Generate file checksum
export function generateFileChecksum(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', data => {
      hash.update(data);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', error => {
      reject(error);
    });
  });
}

// Validate file integrity
export async function validateFileIntegrity(
  documentId: number
): Promise<boolean> {
  try {
    const document = await storage.getDocument(documentId);
    if (!document) {
      return false;
    }

    if (!fs.existsSync(document.filePath)) {
      return false;
    }

    const currentChecksum = await generateFileChecksum(document.filePath);
    return currentChecksum === document.checksum;
  } catch (error) {
    console.error('File integrity validation failed:', error);
    return false;
  }
}
