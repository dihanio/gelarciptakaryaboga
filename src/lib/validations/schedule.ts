import { z } from 'zod';

export const createScheduleSchema = z.object({
  title: z.string().min(2, 'Judul acara minimal 2 karakter'),
  description: z.string().optional(),
  startTime: z.string().min(1, 'Waktu mulai wajib diisi'),
  endTime: z.string().optional(),
  speaker: z.string().optional(),
  location: z.string().optional(),
  type: z
    .enum(['ceremony', 'presentation', 'performance', 'break', 'judging', 'awarding', 'other'])
    .default('other'),
  order: z.number().default(0),
});

export const updateScheduleSchema = createScheduleSchema.partial();

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
