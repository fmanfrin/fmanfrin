import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getCompetition,
  getCompetitionRanking,
  getPrizes,
} from '@/lib/services/competition';
import * as db from '@/lib/db';

/**
 * GET /api/competitions/[id]/ranking
 * Get real-time ranking for competition
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employee = await db.getEmployeeByUserId(session.user.id);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const competition = await getCompetition(params.id);
    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    const ranking = await getCompetitionRanking(params.id);
    const prizes = await getPrizes(params.id);

    // Find user position
    const userPosition = ranking.find((r) => r.employeeId === employee.id);

    return NextResponse.json({
      success: true,
      competition,
      ranking,
      prizes,
      userPosition,
    });
  } catch (error) {
    console.error('Error fetching competition ranking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ranking' },
      { status: 500 }
    );
  }
}
