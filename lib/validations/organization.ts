import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(255),
  cnpj: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(val), 'CNPJ inválido'),
  plan: z.enum(['basic', 'professional', 'enterprise']).default('basic'),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = createOrganizationSchema.partial();
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(255),
  description: z.string().optional(),
  managerId: z.string().uuid().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser no formato hex (#000000)')
    .default('#3b82f6'),
  trainingGoal: z.number().int().positive().optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

export const updateDepartmentSchema = createDepartmentSchema.partial();
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

export const departmentFilterSchema = z.object({
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type DepartmentFilterInput = z.infer<typeof departmentFilterSchema>;
