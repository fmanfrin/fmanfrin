/**
 * OpenAI Training Generation Service
 * Generates training content, questions, and learning objectives
 * using structured prompts and JSON responses
 */

import { z } from 'zod';

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

if (!apiKey) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

// Schema for generated question
const GeneratedQuestionSchema = z.object({
  type: z.enum(['multiple_choice', 'true_false', 'short_answer', 'essay', 'case_study']),
  statement: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.number()]),
  explanation: z.string(),
  difficulty: z.enum(['basic', 'intermediate', 'advanced', 'expert']),
  points: z.number().int().positive(),
  sourceReference: z.string(),
});

// Schema for generated training
export const GeneratedTrainingSchema = z.object({
  trainingTitle: z.string(),
  description: z.string(),
  learningObjectives: z.array(z.string()),
  contentSummary: z.string(),
  estimatedDurationMinutes: z.number().int().positive(),
  suggestedMinPassScore: z.number().int().min(0).max(100),
  suggestedMaxPoints: z.number().int().positive(),
  questions: z.array(GeneratedQuestionSchema),
});

export type GeneratedTraining = z.infer<typeof GeneratedTrainingSchema>;
export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;

interface TrainingGenerationRequest {
  title: string;
  contentTexts: string[];
  targetAudience: string;
  difficulty: 'basic' | 'intermediate' | 'advanced' | 'expert';
  objectiveDescription: string;
  questionCount: number;
  questionTypes: string[];
  minPassScore?: number;
  maxPoints?: number;
}

/**
 * Generate training with AI
 * Uses OpenAI to create structured training content
 */
export async function generateTrainingWithAI(
  request: TrainingGenerationRequest
): Promise<GeneratedTraining> {
  const contentCombined = request.contentTexts.join('\n\n---\n\n');

  const systemPrompt = `You are an expert instructional designer and training specialist.
Your task is to create high-quality, engaging training content based on provided materials.

CRITICAL RULES:
1. ONLY use information from the provided content
2. If information is insufficient, indicate it in the explanation
3. Never invent data, policies, procedures, or prices not in the content
4. Avoid questions that can't be answered from the content
5. Use clear, professional language appropriate for the target audience
6. Ensure diversity in question types and difficulty levels
7. Never include personal data (names, emails, phone numbers, CPF) in questions
8. Always reference the specific part of content where the answer is found

Return ONLY valid JSON matching the schema. No markdown, no extra text.`;

  const userPrompt = `Create a training course with the following specifications:

TRAINING CONFIGURATION:
- Title: ${request.title}
- Target Audience: ${request.targetAudience}
- Difficulty Level: ${request.difficulty}
- Learning Objective: ${request.objectiveDescription}
- Number of Questions: ${request.questionCount}
- Question Types: ${request.questionTypes.join(', ')}
- Minimum Pass Score: ${request.minPassScore || 70}%
- Maximum Points: ${request.maxPoints || 100}

CONTENT TO USE:
${contentCombined}

INSTRUCTIONS:
1. Create a compelling training title and description
2. Define 3-5 specific learning objectives
3. Write a brief summary of key content points
4. Generate ${request.questionCount} questions that:
   - Test comprehension of the provided content
   - Are appropriate for the difficulty level
   - Include clear explanations with content references
   - Cover different topics from the material
   - For multiple choice: provide 4-5 options with clear distinctions
   - For essays: have clear evaluation criteria

5. Return response as valid JSON matching this structure:
{
  "trainingTitle": "string",
  "description": "string",
  "learningObjectives": ["string", ...],
  "contentSummary": "string",
  "estimatedDurationMinutes": number,
  "suggestedMinPassScore": number (0-100),
  "suggestedMaxPoints": number,
  "questions": [
    {
      "type": "multiple_choice|true_false|short_answer|essay|case_study",
      "statement": "string",
      "options": ["string", ...] (only for multiple_choice/true_false),
      "correctAnswer": "string or index",
      "explanation": "string",
      "difficulty": "basic|intermediate|advanced|expert",
      "points": number,
      "sourceReference": "specific section from content"
    }
  ]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse and validate the response
    const parsed = JSON.parse(content);
    const validated = GeneratedTrainingSchema.parse(parsed);

    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Response validation error:', error.errors);
      throw new Error(
        `Invalid response structure: ${error.errors[0]?.message || 'Unknown validation error'}`
      );
    }
    throw error;
  }
}

/**
 * Log AI usage for billing and analytics
 */
export interface AIUsageData {
  organizationId: string;
  userId: string;
  action: string;
  modelUsed: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  trainingId?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}

/**
 * Estimate cost of API call
 * Pricing as of June 2024
 */
export function estimateOpenAICost(
  inputTokens: number,
  outputTokens: number,
  modelUsed: string = model
): number {
  // GPT-4 Turbo pricing (USD per token)
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4-turbo-preview': { input: 0.00001, output: 0.00003 },
    'gpt-4': { input: 0.00003, output: 0.00006 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  };

  const rates = pricing[modelUsed] || pricing['gpt-4-turbo-preview'];
  return inputTokens * rates.input + outputTokens * rates.output;
}

/**
 * Mock AI response for testing (without API key)
 */
export function generateMockTraining(request: TrainingGenerationRequest): GeneratedTraining {
  return {
    trainingTitle: `${request.title} - Training Course`,
    description: `Comprehensive training on ${request.title} for ${request.targetAudience}`,
    learningObjectives: [
      `Understand the fundamental concepts of ${request.title}`,
      `Apply knowledge in practical scenarios`,
      `Evaluate and analyze related situations`,
    ],
    contentSummary: 'This training covers the essential aspects of the topic with practical examples.',
    estimatedDurationMinutes: 45,
    suggestedMinPassScore: request.minPassScore || 70,
    suggestedMaxPoints: request.maxPoints || 100,
    questions: Array.from({ length: Math.min(request.questionCount, 5) }).map((_, i) => ({
      type: (request.questionTypes[i % request.questionTypes.length] ||
        'multiple_choice') as GeneratedQuestion['type'],
      statement: `Question ${i + 1}: What is an important aspect of ${request.title}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 1,
      explanation: `This is the correct answer because it aligns with the content about ${request.title}.`,
      difficulty: request.difficulty,
      points: Math.floor(request.maxPoints! / request.questionCount) || 10,
      sourceReference: 'Content section 1',
    })),
  };
}
