import { z } from 'zod';

export const createPageSectionSchema = z.object({
  page: z.enum(['landing', 'about', 'contact']).default('landing'),
  sectionType: z.enum([
    'hero',
    'about',
    'highlights',
    'gallery_preview',
    'cta',
    'faq',
    'sponsors',
    'timeline',
    'stats',
    'custom',
  ]),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  media: z
    .array(
      z.object({
        url: z.string(),
        alt: z.string().optional(),
        type: z.enum(['image', 'video']).default('image'),
      })
    )
    .optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  order: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export const updatePageSectionSchema = createPageSectionSchema.partial();

export type CreatePageSectionInput = z.infer<typeof createPageSectionSchema>;
export type UpdatePageSectionInput = z.infer<typeof updatePageSectionSchema>;
