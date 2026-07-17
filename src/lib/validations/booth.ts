import { z } from 'zod';

export const createBoothSchema = z.object({
  number: z.string().min(1, 'Nomor booth wajib diisi'),
  name: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['available', 'assigned', 'inactive']).default('available'),
  order: z.number().default(0),
});

export const updateBoothSchema = createBoothSchema.partial();

export type CreateBoothInput = z.infer<typeof createBoothSchema>;
export type UpdateBoothInput = z.infer<typeof updateBoothSchema>;
