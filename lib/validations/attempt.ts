import { z } from 'zod';

export const startTrainingAttemptSchema = z.object({
  trainingId: z.string().uuid(),
  employeeId: z.string().uuid(),
});

export type StartTrainingAttemptInput = z.infer<typeof startTrainingAttemptSchema>;

export const submitAnswerSchema = z.object({
  trainingAttemptId: z.string().uuid(),
  questionId: z.string().uuid(),
  answerValue: z.union([
    z.string(),
    z.number(),
    z.array(z.union([z.string(), z.number()])),
  ]),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

export const submitTrainingSchema = z.object({
  trainingAttemptId: z.string().uuid(),
});

export type SubmitTrainingInput = z.infer<typeof submitTrainingSchema>;

export const evaluateAnswerSchema = z.object({
  trainingAnswerId: z.string().uuid(),
  score: z.number().int().min(0),
  feedback: z.string().optional(),
});

export type EvaluateAnswerInput = z.infer<typeof evaluateAnswerSchema>;
