import { z } from 'zod';
import { validateCPF } from '../utils/cpf';

export const createEmployeeSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(255, 'Nome não pode ter mais de 255 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z
    .string()
    .optional()
    .refine((val) => !val || validateCPF(val), 'CPF inválido'),
  departmentId: z.string().uuid('Departamento inválido'),
  jobTitle: z.string().optional(),
  managerId: z.string().uuid().optional(),
  admissionDate: z.coerce.date().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  unit: z.string().optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = createEmployeeSchema.partial();
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export const importEmployeesSchema = z.object({
  employees: z.array(createEmployeeSchema),
});

export type ImportEmployeesInput = z.infer<typeof importEmployeesSchema>;

export const employeeFilterSchema = z.object({
  departmentId: z.string().uuid().optional(),
  jobTitle: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type EmployeeFilterInput = z.infer<typeof employeeFilterSchema>;
