import { z } from 'zod';

export const generateTrainingWithAISchema = z.object({
  title: z
    .string()
    .min(5, 'Título deve ter no mínimo 5 caracteres')
    .max(255),
  contentIds: z
    .array(z.string().uuid())
    .min(1, 'Selecione pelo menos um conteúdo'),
  targetAudience: z
    .string()
    .min(3, 'Público-alvo obrigatório')
    .max(255),
  difficulty: z.enum(['basic', 'intermediate', 'advanced', 'expert']),
  objectiveDescription: z
    .string()
    .min(10, 'Descrição do objetivo deve ter no mínimo 10 caracteres')
    .max(500),
  questionCount: z
    .number()
    .int()
    .min(3, 'Mínimo 3 perguntas')
    .max(50, 'Máximo 50 perguntas'),
  questionTypes: z
    .array(
      z.enum([
        'multiple_choice',
        'true_false',
        'short_answer',
        'essay',
        'case_study',
      ])
    )
    .min(1, 'Selecione pelo menos um tipo de pergunta'),
  minPassScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .default(70),
  timeLimitMinutes: z.number().int().positive().optional(),
  maxAttempts: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(3),
  maxPoints: z
    .number()
    .int()
    .positive()
    .default(100),
});

export type GenerateTrainingWithAIInput = z.infer<typeof generateTrainingWithAISchema>;

export const createTrainingManuallySchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().optional(),
  areaId: z.string().uuid().optional(),
  difficulty: z.enum(['basic', 'intermediate', 'advanced', 'expert']).default('intermediate'),
  minPassScore: z.number().int().min(0).max(100).default(70),
  timeLimitMinutes: z.number().int().positive().optional(),
  maxAttempts: z.number().int().min(1).max(10).default(3),
  maxPoints: z.number().int().positive().default(100),
  isMandatory: z.boolean().default(false),
});

export type CreateTrainingManuallyInput = z.infer<typeof createTrainingManuallySchema>;

export const createTrainingQuestionSchema = z.object({
  type: z.enum([
    'multiple_choice',
    'true_false',
    'short_answer',
    'essay',
    'case_study',
  ]),
  statement: z.string().min(5).max(1000),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.number()]),
  explanation: z.string().min(10),
  difficulty: z.enum(['basic', 'intermediate', 'advanced', 'expert']),
  points: z.number().int().positive(),
  sourceReference: z.string().optional(),
});

export type CreateTrainingQuestionInput = z.infer<typeof createTrainingQuestionSchema>;

export const publishTrainingSchema = z.object({
  targetEmployees: z.array(z.string().uuid()).optional(),
  targetDepartments: z.array(z.string().uuid()).optional(),
  targetTeams: z.array(z.string().uuid()).optional(),
  publishedAt: z.coerce.date().default(() => new Date()),
});

export type PublishTrainingInput = z.infer<typeof publishTrainingSchema>;
