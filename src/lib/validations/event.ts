import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string().min(3, 'Nama acara minimal 3 karakter'),
  slug: z.string().min(3, 'Slug minimal 3 karakter').optional(),
  description: z.string().optional(),
  theme: z.string().min(3, 'Tema acara wajib diisi'),
  logo: z.string().url('URL logo tidak valid').optional().or(z.literal('')),
  banner: z.string().url('URL banner tidak valid').optional().or(z.literal('')),
  date: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional(),
  time: z.string().min(1, 'Waktu pelaksanaan wajib diisi'),
  location: z.object({
    name: z.string().min(1, 'Nama lokasi wajib diisi'),
    address: z.string().min(1, 'Alamat lokasi wajib diisi'),
    mapUrl: z.string().optional(),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
  }),
  status: z.enum(['draft', 'upcoming', 'active', 'completed', 'archived']).default('draft'),
  registration: z
    .object({
      isOpen: z.boolean().default(false),
      startDate: z.string().or(z.date()).optional(),
      endDate: z.string().or(z.date()).optional(),
      maxCapacity: z.number().min(0).default(0),
    })
    .optional(),
  countdown: z
    .object({
      enabled: z.boolean().default(true),
      targetDate: z.string().or(z.date()),
    })
    .optional(),
  about: z
    .object({
      content: z.string().default(''),
      images: z.array(z.string()).optional(),
    })
    .optional(),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
