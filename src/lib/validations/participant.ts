import { z } from 'zod';

export const createParticipantSchema = z.object({
  name: z.string().min(2, 'Nama peserta/kelompok minimal 2 karakter'),
  photo: z.string().optional(),
  workName: z.string().min(2, 'Nama karya/menu minimal 2 karakter'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  booth: z.string().optional(),
  category: z.string().optional(),
  members: z
    .array(
      z.object({
        name: z.string().min(1, 'Nama anggota wajib diisi'),
        role: z.string().optional(),
      })
    )
    .optional(),
  order: z.number().default(0),
});

export const updateParticipantSchema = createParticipantSchema.partial();

export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
