import * as fs from 'fs/promises';
import * as path from 'path';
import type { StorageProvider, UploadOptions, UploadResult } from './types';

export class LocalStorageProvider implements StorageProvider {
  private basePath: string;
  private baseUrl: string;

  constructor() {
    this.basePath = process.env.STORAGE_LOCAL_PATH || 'data/uploads';
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  async upload(file: Buffer, filePath: string, options?: UploadOptions): Promise<UploadResult> {
    const fullPath = path.join(process.cwd(), this.basePath, filePath);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, file);

    const stats = await fs.stat(fullPath);

    return {
      url: this.getUrl(filePath),
      path: filePath,
      filename: path.basename(filePath),
      size: stats.size,
      contentType: options?.contentType || 'application/octet-stream',
    };
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), this.basePath, filePath);
    try {
      await fs.unlink(fullPath);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && (error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  getUrl(filePath: string): string {
    return `/api/uploads/${filePath}`;
  }

  async exists(filePath: string): Promise<boolean> {
    const fullPath = path.join(process.cwd(), this.basePath, filePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
