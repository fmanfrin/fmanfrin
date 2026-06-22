import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getEmployeeDashboardData } from '@/lib/services/dashboard';
import * as db from '@/lib/db';

/**
 * GET /api/dashboard/employee
 * Get employee dashboard data
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

    const dashboardData = await getEmployeeDashboardData(employee.id);

    return NextResponse.json({
      success: true,
      ...dashboardData,
    });
  } catch (error) {
    console.error('Error fetching employee dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
