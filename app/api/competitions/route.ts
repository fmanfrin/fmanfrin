import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createCompetitionSchema, competitionFilterSchema } from '@/lib/validations/competition';
import {
  createCompetition,
  listCompetitions,
} from '@/lib/services/competition';
import * as db from '@/lib/db';

/**
 * GET /api/competitions
 * List competitions for organization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employee = await db.getEmployeeByUserId(session.user.id);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const validated = competitionFilterSchema.parse({
      status: searchParams.get('status'),
      areaId: searchParams.get('areaId'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    });

    const offset = (validated.page - 1) * validated.limit;

    const competitions = await listCompetitions(
      employee.organization_id,
      {
        status: validated.status,
        areaId: validated.areaId,
      },
      validated.limit,
      offset
    );

    return NextResponse.json({
      success: true,
      competitions,
      pagination: {
        page: validated.page,
        limit: validated.limit,
      },
    });
  } catch (error) {
    console.error('Error fetching competitions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/competitions
 * Create competition (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employee = await db.getEmployeeByUserId(session.user.id);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Check if admin
    const isAdmin = await db.hasRole(session.user.id, 'admin_company');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can create competitions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = createCompetitionSchema.parse(body);

    const competition = await createCompetition(employee.organization_id, validated);

    return NextResponse.json({
      success: true,
      competition,
    });
  } catch (error) {
    console.error('Error creating competition:', error);
    return NextResponse.json(
      { error: 'Failed to create competition' },
      { status: 500 }
    );
  }
}
