import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import * as db from '@/lib/db';
import { startTrainingAttemptSchema } from '@/lib/validations/attempt';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { trainingId, employeeId } = body;

    startTrainingAttemptSchema.parse({ trainingId, employeeId });

    // TODO: Verify employee belongs to same organization as training
    // TODO: Verify employee has access to this training

    const attempt = await db.startTrainingAttempt(trainingId, employeeId);

    // Get training with questions
    const training = await db.getTrainingWithQuestions(trainingId);

    return NextResponse.json(
      {
        attempt,
        training: {
          id: training.id,
          title: training.title,
          description: training.description,
          estimatedDurationMinutes: training.estimated_duration_minutes,
          timeLimitMinutes: training.time_limit_minutes,
          maxPoints: training.max_points,
          questions: training.questions.map((q: any) => ({
            id: q.id,
            type: q.type,
            statement: q.statement,
            options: q.options,
            difficulty: q.difficulty,
            points: q.points,
            position: q.position,
          })),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error starting training attempt:', error);

    if (error instanceof Error && error.message === 'Maximum attempts exceeded') {
      return NextResponse.json(
        { error: 'Maximum attempts exceeded for this training' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to start training attempt' },
      { status: 500 }
    );
  }
}
