import { z } from 'zod';

export const createCompetitionSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  bannerUrl: z.string().url().optional(),
  areaId: z.string().uuid().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  criteria: z.enum([
    'largest_score',
    'best_avg',
    'most_completed',
    'fastest',
    'best_improvement',
    'specific_training',
  ]),
  validTrainingIds: z.array(z.string().uuid()),
  winnerCount: z.number().int().positive().default(3),
  status: z.enum(['draft', 'scheduled', 'active', 'ended']).default('draft'),
});

export type CreateCompetitionInput = z.infer<typeof createCompetitionSchema>;

export const createPrizeSchema = z.object({
  competitionId: z.string().uuid(),
  position: z.number().int().positive(),
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  valueEstimated: z.number().positive(),
  imageUrl: z.string().url().optional(),
  quantity: z.number().int().positive().default(1),
});

export type CreatePrizeInput = z.infer<typeof createPrizeSchema>;

export const joinCompetitionSchema = z.object({
  competitionId: z.string().uuid(),
});

export type JoinCompetitionInput = z.infer<typeof joinCompetitionSchema>;

export const competitionFilterSchema = z.object({
  status: z.enum(['draft', 'scheduled', 'active', 'ended']).optional(),
  areaId: z.string().uuid().optional(),
  sortBy: z.enum(['startDate', 'endDate', 'name']).default('startDate'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export type CompetitionFilterInput = z.infer<typeof competitionFilterSchema>;
