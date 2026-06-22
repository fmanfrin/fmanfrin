import { z } from 'zod';

export const rankingFilterSchema = z.object({
  period: z.enum(['overall', 'monthly', 'quarterly', 'yearly']).default('overall'),
  type: z.enum(['general', 'department', 'team', 'training']).default('general'),
  departmentId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  trainingId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
  sortBy: z.enum(['points', 'name', 'recentActivity']).default('points'),
});

export type RankingFilterInput = z.infer<typeof rankingFilterSchema>;

export const tiebreakRulesSchema = z.object({
  primary: z.enum(['points', 'avgScore', 'trainingCount', 'time', 'date']).default('points'),
  secondary: z.enum(['points', 'avgScore', 'trainingCount', 'time', 'date']).optional(),
  tertiary: z.enum(['points', 'avgScore', 'trainingCount', 'time', 'date']).optional(),
});

export type TiebreakRulesInput = z.infer<typeof tiebreakRulesSchema>;
