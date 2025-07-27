import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { storage } from '../storage';
import { z } from 'zod';

const BACKUP_BASE_PATH = './backups';
const UPLOAD_BASE_PATH = './uploads';

interface BackupOptions {
  type: 'full' | 'incremental' | 'differential';
  destination: string;
  compression?: boolean;
  encryption?: boolean;
}

export class FileBackupService {
  private static ensureBackupDirectory() {
    if (!fs.existsSync(BACKUP_BASE_PATH)) {
      fs.mkdirSync(BACKUP_BASE_PATH, { recursive: true });
    }
  }

  static async createBackup(options: BackupOptions): Promise<void> {
    this.ensureBackupDirectory();

    const startTime = Date.now();
    const backupDate = new Date().toISOString().split('T')[0];
    const backupFileName = `backup_${options.type}_${backupDate}_${Date.now()}`;
    const backupPath = path.join(BACKUP_BASE_PATH, backupFileName);

    try {
      // Create backup record
      const backupRecord = await storage.createBackupRecord({
        backupDate: new Date(),
        backupType: options.type,
        backupLocation: backupPath,
        totalFiles: 0,
        totalSize: 0,
        backupStatus: 'in_progress',
      });

      // Count files and calculate size
      const { fileCount, totalSize } = await this.getBackupStats();

      // Create compressed backup
      await this.compressFiles(
        UPLOAD_BASE_PATH,
        backupPath,
        options.compression
      );

      // Verify backup integrity
      const verificationResult = await this.verifyBackup(backupPath);

      // Update backup record
      await storage.updateBackupRecord(backupRecord.id, {
        totalFiles: fileCount,
        totalSize: totalSize,
        backupStatus: 'completed',
        backupDuration: Math.floor((Date.now() - startTime) / 1000),
        verificationStatus: verificationResult ? 'verified' : 'failed',
        completedAt: new Date(),
      });

      console.log(`Backup completed successfully: ${backupPath}`);
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }

  private static async getBackupStats(): Promise<{
    fileCount: number;
    totalSize: number;
  }> {
    const scanDirectory = (dir: string): { files: string[]; size: number } => {
      let files: string[] = [];
      let size = 0;

      if (!fs.existsSync(dir)) {
        return { files, size };
      }

      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          const subResult = scanDirectory(fullPath);
          files = files.concat(subResult.files);
          size += subResult.size;
        } else {
          files.push(fullPath);
          size += stat.size;
        }
      }

      return { files, size };
    };

    const result = scanDirectory(UPLOAD_BASE_PATH);
    return { fileCount: result.files.length, totalSize: result.size };
  }

  private static async compressFiles(
    sourcePath: string,
    destinationPath: string,
    compression: boolean = true
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = compression ? 'tar' : 'cp';
      const args = compression
        ? [
            '-czf',
            destinationPath + '.tar.gz',
            '-C',
            path.dirname(sourcePath),
            path.basename(sourcePath),
          ]
        : ['-r', sourcePath, destinationPath];

      const process = spawn(command, args);

      process.on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Backup compression failed with code ${code}`));
        }
      });

      process.on('error', error => {
        reject(error);
      });
    });
  }

  private static async verifyBackup(backupPath: string): Promise<boolean> {
    try {
      const actualBackupPath = backupPath + '.tar.gz';
      if (!fs.existsSync(actualBackupPath)) {
        return false;
      }

      // Simple verification - check if file exists and has size > 0
      const stats = fs.statSync(actualBackupPath);
      return stats.size > 0;
    } catch (error) {
      console.error('Backup verification failed:', error);
      return false;
    }
  }

  static async scheduleBackup(
    type: 'full' | 'incremental' | 'differential',
    intervalMs: number
  ): Promise<void> {
    const performBackup = async () => {
      try {
        await this.createBackup({
          type,
          destination: BACKUP_BASE_PATH,
          compression: true,
          encryption: false,
        });
      } catch (error) {
        console.error(`Scheduled ${type} backup failed:`, error);
      }
    };

    // Run initial backup
    await performBackup();

    // Schedule recurring backups
    setInterval(performBackup, intervalMs);
  }

  static async restoreBackup(backupId: number): Promise<void> {
    try {
      const backupRecord = await storage.getBackupRecords();
      const backup = backupRecord.find(b => b.id === backupId);

      if (!backup) {
        throw new Error('Backup record not found');
      }

      if (backup.verificationStatus !== 'verified') {
        throw new Error('Cannot restore unverified backup');
      }

      const backupPath = backup.backupLocation + '.tar.gz';

      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup file not found');
      }

      // Create restore directory
      const restoreDir = path.join(BACKUP_BASE_PATH, 'restore_' + Date.now());
      fs.mkdirSync(restoreDir, { recursive: true });

      // Extract backup
      await this.extractBackup(backupPath, restoreDir);

      console.log(`Backup restored to: ${restoreDir}`);
    } catch (error) {
      console.error('Backup restore failed:', error);
      throw error;
    }
  }

  private static async extractBackup(
    backupPath: string,
    destinationPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn('tar', ['-xzf', backupPath, '-C', destinationPath]);

      process.on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Backup extraction failed with code ${code}`));
        }
      });

      process.on('error', error => {
        reject(error);
      });
    });
  }

  static async cleanupOldBackups(retentionDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const backupRecords = await storage.getBackupRecords();

      for (const backup of backupRecords) {
        if (backup.createdAt < cutoffDate) {
          // Delete backup file
          const backupPath = backup.backupLocation + '.tar.gz';
          if (fs.existsSync(backupPath)) {
            fs.unlinkSync(backupPath);
          }

          // Update record to mark as deleted
          await storage.updateBackupRecord(backup.id, {
            backupStatus: 'deleted',
          });
        }
      }

      console.log('Old backups cleaned up successfully');
    } catch (error) {
      console.error('Backup cleanup failed:', error);
    }
  }
}

// Initialize backup service with default schedules
export function initializeBackupService(): void {
  // Schedule daily full backup at 2 AM
  const dailyBackupTime = new Date();
  dailyBackupTime.setHours(2, 0, 0, 0);

  const msUntilDailyBackup = dailyBackupTime.getTime() - Date.now();
  const msInDay = 24 * 60 * 60 * 1000;

  setTimeout(
    () => {
      FileBackupService.scheduleBackup('full', msInDay);
    },
    msUntilDailyBackup > 0 ? msUntilDailyBackup : msInDay + msUntilDailyBackup
  );

  // Schedule incremental backup every 6 hours
  FileBackupService.scheduleBackup('incremental', 6 * 60 * 60 * 1000);

  // Schedule cleanup of old backups daily
  setInterval(() => {
    FileBackupService.cleanupOldBackups(30);
  }, msInDay);
}
