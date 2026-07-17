import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import type { UploadResult } from '@/lib/storage/types';
import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit-logger';
import { uploadRateLimiter } from '@/lib/rate-limiter';
import { nanoid } from 'nanoid';
import path from 'path';
import type { ApiResponse } from '@/types';

// Validations
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

// Simple Magic Bytes Checker
function checkMagicBytes(buffer: Buffer, mime: string): boolean {
  if (buffer.length < 4) return false; // Too small
  const hex = buffer.toString('hex', 0, 4).toUpperCase();
  
  if (mime === 'image/jpeg') return hex.startsWith('FFD8FF');
  if (mime === 'image/png') return hex === '89504E47';
  if (mime === 'image/webp') return buffer.toString('hex', 8, 12).toUpperCase() === '57454250'; // 'WEBP'
  if (mime === 'application/pdf') return hex === '25504446';
  
  return false;
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<UploadResult | UploadResult[]>>> {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = uploadRateLimiter.check(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests', retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000) } as ApiResponse<UploadResult>,
        { status: 429, headers: { 'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString() } }
      );
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const folder = (formData.get('folder') as string) || 'general';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada file yang diunggah' },
        { status: 400 }
      );
    }

    const storage = getStorage();
    const results: UploadResult[] = [];

    for (const file of files) {
      if (file.size === 0) {
        throw new Error(`File ${file.name} kosong`);
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Ukuran file ${file.name} melebihi batas 5MB`);
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error(`Tipe file ${file.type} tidak didukung`);
      }
      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        throw new Error(`Ekstensi file ${ext} tidak diizinkan`);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      
      if (!checkMagicBytes(buffer, file.type)) {
        throw new Error(`File ${file.name} rusak atau memiliki ekstensi palsu`);
      }

      const filename = `${nanoid(10)}${ext}`;
      const filePath = `${folder}/${filename}`;

      const result = await storage.upload(buffer, filePath, {
        contentType: file.type,
      });

      results.push(result);
    }
    
    await logAction(request, session.userId, 'upload', 'File', folder, {
      count: files.length,
      folder,
    });

    return NextResponse.json({
      success: true,
      data: results.length === 1 ? results[0] : results,
      message: 'Upload file berhasil',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
