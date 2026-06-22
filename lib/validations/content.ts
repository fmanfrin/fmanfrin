import { z } from 'zod';

export const createContentSourceSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(255),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  type: z.enum(['text', 'pdf', 'docx', 'pptx', 'txt', 'markdown', 'url']),
  contentText: z.string().optional(),
  fileUrl: z.string().url().optional(),
});

export type CreateContentSourceInput = z.infer<typeof createContentSourceSchema>;

export const updateContentSourceSchema = createContentSourceSchema.partial();
export type UpdateContentSourceInput = z.infer<typeof updateContentSourceSchema>;

export const contentFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'review', 'published', 'archived']).optional(),
  type: z.enum(['text', 'pdf', 'docx', 'pptx', 'txt', 'markdown', 'url']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type ContentFilterInput = z.infer<typeof contentFilterSchema>;
