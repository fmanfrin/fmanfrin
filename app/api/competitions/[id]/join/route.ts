import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { joinCompetition } from '@/lib/services/competition';
import * as db from '@/lib/db';

/**
 * POST /api/competitions/[id]/join
 * Join competition
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employee = await db.getEmployeeByUserId(session.user.id);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const participant = await joinCompetition(id, employee.id);

    return NextResponse.json({
      success: true,
      participant,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Already a participant') {
      return NextResponse.json(
        { error: 'Already a participant in this competition' },
        { status: 400 }
      );
    }

    console.error('Error joining competition:', error);
    return NextResponse.json(
      { error: 'Failed to join competition' },
      { status: 500 }
    );
  }
}
