import { z } from 'zod';

export const createNewsSchema = z.object({
  title: z.string().min(3, 'Judul berita minimal 3 karakter'),
  content: z.string().min(20, 'Konten berita minimal 20 karakter'),
  excerpt: z.string().min(10, 'Ringkasan minimal 10 karakter'),
  coverImage: z.string().optional(),
  category: z.enum(['pengumuman', 'informasi', 'artikel', 'liputan']).default('informasi'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tags: z.array(z.string()).optional(),
});

export const updateNewsSchema = createNewsSchema.partial();

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
