import type { StorageProvider } from './types';
import { LocalStorageProvider } from './local';

let storageInstance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (storageInstance) return storageInstance;

  const provider = process.env.STORAGE_PROVIDER || 'local';

  switch (provider) {
    case 'local':
      storageInstance = new LocalStorageProvider();
      break;
    case 'cloudinary':
      // Future: import CloudinaryStorageProvider
      throw new Error('Cloudinary storage provider not yet implemented. Set STORAGE_PROVIDER=local in .env');
    case 's3':
      // Future: import S3StorageProvider
      throw new Error('S3 storage provider not yet implemented. Set STORAGE_PROVIDER=local in .env');
    default:
      throw new Error(`Unknown storage provider: ${provider}`);
  }

  return storageInstance;
}

export type { StorageProvider, UploadOptions, UploadResult } from './types';
