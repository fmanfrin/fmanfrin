import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import * as db from '@/lib/db';
import { generateTrainingWithAISchema } from '@/lib/validations/training';
import {
  generateTrainingWithAI,
  generateMockTraining,
} from '@/lib/ai/training-generator';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, contentIds, ...trainingConfig } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Validate input
    generateTrainingWithAISchema.parse({
      ...trainingConfig,
      contentIds,
    });

    // Fetch content to train on
    const contentPromises = contentIds.map((id: string) =>
      db.getContentSource(id)
    );
    const contents = await Promise.all(contentPromises);

    const contentTexts = contents
      .filter((c) => c && c.content_text)
      .map((c) => c.content_text);

    if (contentTexts.length === 0) {
      return NextResponse.json(
        {
          error: 'Selected content sources have no text. Upload content with text first.',
        },
        { status: 400 }
      );
    }

    // Generate training with AI
    const generatedTraining = process.env.OPENAI_API_KEY
      ? await generateTrainingWithAI({
          title: trainingConfig.title,
          contentTexts,
          targetAudience: trainingConfig.targetAudience,
          difficulty: trainingConfig.difficulty,
          objectiveDescription: trainingConfig.objectiveDescription,
          questionCount: trainingConfig.questionCount,
          questionTypes: trainingConfig.questionTypes,
          minPassScore: trainingConfig.minPassScore,
          maxPoints: trainingConfig.maxPoints,
        })
      : generateMockTraining({
          title: trainingConfig.title,
          contentTexts,
          targetAudience: trainingConfig.targetAudience,
          difficulty: trainingConfig.difficulty,
          objectiveDescription: trainingConfig.objectiveDescription,
          questionCount: trainingConfig.questionCount,
          questionTypes: trainingConfig.questionTypes,
          minPassScore: trainingConfig.minPassScore,
          maxPoints: trainingConfig.maxPoints,
        });

    // Create training in database
    const training = await db.createTraining(organizationId, {
      title: generatedTraining.trainingTitle,
      description: generatedTraining.description,
      areaId: trainingConfig.areaId,
      difficulty: trainingConfig.difficulty,
      learningObjectives: generatedTraining.learningObjectives,
      contentSummary: generatedTraining.contentSummary,
      estimatedDurationMinutes: generatedTraining.estimatedDurationMinutes,
      minPassScore: generatedTraining.suggestedMinPassScore,
      maxPoints: generatedTraining.suggestedMaxPoints,
      maxAttempts: trainingConfig.maxAttempts,
      timeLimitMinutes: trainingConfig.timeLimitMinutes,
      isMandatory: false,
      authorId: session.user.id,
      contentIds,
    });

    // Create questions in database
    const questions = await db.bulkCreateTrainingQuestions(
      training.id,
      generatedTraining.questions.map((q, idx) => ({
        type: q.type,
        statement: q.statement,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        points: q.points,
        sourceReference: q.sourceReference,
        position: idx,
      }))
    );

    return NextResponse.json(
      {
        training,
        questions,
        generationDetails: {
          contentSourcesUsed: contentIds.length,
          questionsGenerated: questions.length,
          estimatedDuration: generatedTraining.estimatedDurationMinutes,
          aiModel: process.env.OPENAI_API_KEY ? 'gpt-4-turbo' : 'mock',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error generating training with AI:', error);

    if (error instanceof Error) {
      if (error.message.includes('Invalid response structure')) {
        return NextResponse.json(
          {
            error: 'IA gerou resposta inválida. Tente novamente com parâmetros diferentes.',
            details: error.message,
          },
          { status: 400 }
        );
      }

      if (error.message.includes('OpenAI API error')) {
        return NextResponse.json(
          {
            error: 'Erro na API OpenAI. Verifique sua chave de API.',
            details: error.message,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate training with AI' },
      { status: 500 }
    );
  }
}
