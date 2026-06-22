import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { rankingFilterSchema } from '@/lib/validations/ranking';
import {
  calculateGeneralRanking,
  calculateDepartmentRanking,
  getTopThree,
} from '@/lib/services/ranking';
import * as db from '@/lib/db';

/**
 * Get rankings
 * Supports filtering by type, period, department, etc
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get employee to determine organization
    const employee = await db.getEmployeeByUserId(session.user.id);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'general';
    const departmentId = searchParams.get('departmentId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const offset = (page - 1) * limit;

    // Validate input
    const validated = rankingFilterSchema.parse({
      type,
      departmentId,
      page,
      limit,
    });

    let ranking;

    if (validated.type === 'department' && validated.departmentId) {
      ranking = await calculateDepartmentRanking(
        employee.organization_id,
        validated.departmentId,
        limit,
        offset
      );
    } else {
      ranking = await calculateGeneralRanking(employee.organization_id, limit, offset);
    }

    // Get top 3 for medals
    let topThree;
    if (validated.type === 'department' && validated.departmentId) {
      topThree = await getTopThree(employee.organization_id, 'department', validated.departmentId);
    } else {
      topThree = await getTopThree(employee.organization_id, 'general');
    }

    // Find current user position
    const userPosition = ranking.find((r) => r.employeeId === employee.id);

    return NextResponse.json({
      success: true,
      ranking,
      topThree,
      userPosition,
      pagination: {
        page: validated.page,
        limit: validated.limit,
        total: ranking.length,
      },
    });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rankings' },
      { status: 500 }
    );
  }
}
