import { z } from 'zod';

export const createTicketTypeSchema = z.object({
  name: z.string().min(2, 'Nama tiket minimal 2 karakter'),
  description: z.string().optional(),
  price: z.number().min(0, 'Harga tidak boleh negatif').default(0),
  currency: z.string().default('IDR'),
  quota: z.number().min(1, 'Kuota minimal 1'),
  isActive: z.boolean().default(true),
  benefits: z.array(z.string()).optional(),
  validFrom: z.string().or(z.date()).optional(),
  validUntil: z.string().or(z.date()).optional(),
  order: z.number().default(0),
});

export const updateTicketTypeSchema = createTicketTypeSchema.partial();

export const registerTicketSchema = z.object({
  name: z.string().min(2, 'Nama lengkap wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().min(8, 'Nomor Telepon/WA minimal 8 digit'),
  organization: z.string().optional(),
  ticketTypeId: z.string().min(1, 'Pilih jenis tiket'),
  quantity: z.number().min(1).max(5).default(1),
});

export type CreateTicketTypeInput = z.infer<typeof createTicketTypeSchema>;
export type UpdateTicketTypeInput = z.infer<typeof updateTicketTypeSchema>;
export type RegisterTicketInput = z.infer<typeof registerTicketSchema>;
