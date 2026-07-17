import { z } from 'zod';

export const updateWebsiteSettingsSchema = z.object({
  siteName: z.string().min(2).optional(),
  siteDescription: z.string().optional(),
  siteLogo: z.string().optional(),
  favicon: z.string().optional(),
  contact: z
    .object({
      phone: z.string().optional(),
      whatsapp: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
    })
    .optional(),
  socialMedia: z
    .object({
      instagram: z.string().optional(),
      tiktok: z.string().optional(),
      youtube: z.string().optional(),
      twitter: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
  navigation: z
    .array(
      z.object({
        label: z.string(),
        href: z.string(),
        order: z.number().default(0),
        isVisible: z.boolean().default(true),
      })
    )
    .optional(),
  footer: z
    .object({
      text: z.string().optional(),
      links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
      copyright: z.string().optional(),
    })
    .optional(),
  activeEventId: z.string().optional(),
});

export type UpdateWebsiteSettingsInput = z.infer<typeof updateWebsiteSettingsSchema>;
