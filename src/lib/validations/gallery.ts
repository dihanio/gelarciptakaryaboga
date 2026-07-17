import { z } from 'zod';

export const createGallerySchema = z.object({
  title: z.string().min(2, 'Judul foto/video minimal 2 karakter'),
  type: z.enum(['photo', 'video']).default('photo'),
  url: z.string().url('URL media tidak valid'),
  thumbnail: z.string().optional(),
  album: z.string().default('Umum'),
  description: z.string().optional(),
  order: z.number().default(0),
});

export const updateGallerySchema = createGallerySchema.partial();

export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
export type UpdateGalleryInput = z.infer<typeof updateGallerySchema>;
