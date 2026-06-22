import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getCompetition,
  getPrizes,
  isParticipant,
  joinCompetition,
  getCompetitionRanking,
  updateCompetitionStatus,
} from '@/lib/services/competition';
import * as db from '@/lib/db';

/**
 * GET /api/competitions/[id]
 * Get competition details
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

    const prizes = await getPrizes(params.id);
    const isUserParticipant = await isParticipant(params.id, employee.id);

    return NextResponse.json({
      success: true,
      competition,
      prizes,
      isParticipant: isUserParticipant,
    });
  } catch (error) {
    console.error('Error fetching competition:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competition' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/competitions/[id]
 * Update competition (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await db.hasRole(session.user.id, 'admin_company');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can update competitions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (status) {
      const competition = await updateCompetitionStatus(params.id, status);
      return NextResponse.json({
        success: true,
        competition,
      });
    }

    return NextResponse.json({ error: 'No update provided' }, { status: 400 });
  } catch (error) {
    console.error('Error updating competition:', error);
    return NextResponse.json(
      { error: 'Failed to update competition' },
      { status: 500 }
    );
  }
}
