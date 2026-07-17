export interface UploadOptions {
  folder?: string;
  filename?: string;
  contentType?: string;
  maxSize?: number;
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
  };
}

export interface UploadResult {
  url: string;
  path: string;
  filename: string;
  size: number;
  contentType: string;
}

export interface StorageProvider {
  upload(file: Buffer, path: string, options?: UploadOptions): Promise<UploadResult>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
  exists(path: string): Promise<boolean>;
}
