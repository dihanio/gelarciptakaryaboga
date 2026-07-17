import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nama pengguna minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  avatar: z.string().optional(),
  role: z
    .enum(['super_admin', 'admin_event', 'ticket_officer', 'checkin_officer', 'content_editor', 'media', 'viewer'])
    .default('viewer'),
  assignedEvents: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = createUserSchema.partial().extend({
  password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
