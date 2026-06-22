import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getOrganizationDashboardKPIs,
  getTrainingPerformance,
  getLevelDistribution,
} from '@/lib/services/dashboard';
import * as db from '@/lib/db';

/**
 * GET /api/dashboard
 * Get admin dashboard data
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

    // Check if admin
    const isAdmin = await db.hasRole(session.user.id, 'admin_company');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can view dashboard' },
        { status: 403 }
      );
    }

    const kpis = await getOrganizationDashboardKPIs(employee.organization_id);
    const trainingPerformance = await getTrainingPerformance(employee.organization_id);
    const levelDistribution = await getLevelDistribution(employee.organization_id);

    return NextResponse.json({
      success: true,
      kpis,
      trainingPerformance,
      levelDistribution,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
