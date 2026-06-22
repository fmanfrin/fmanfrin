import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import * as db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attempt = await db.getTrainingAttempt(params.id);
    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    return NextResponse.json(attempt);
  } catch (error) {
    console.error('Error fetching attempt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attempt' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    // Submit training and calculate score
    const result = await db.submitTrainingAttempt(params.id, answers);

    // Get full result with training data
    const fullResult = await db.getTrainingResult(params.id);

    return NextResponse.json({
      attempt: result,
      training: fullResult.training,
      answers: fullResult.answers,
      score: result.score,
      maxScore: result.max_score,
      percentageScore: result.percentage_score,
      status: result.percentage_score >= (fullResult.training.min_pass_score || 70)
        ? 'approved'
        : 'rejected',
    });
  } catch (error) {
    console.error('Error submitting attempt:', error);
    return NextResponse.json(
      { error: 'Failed to submit attempt' },
      { status: 500 }
    );
  }
}
