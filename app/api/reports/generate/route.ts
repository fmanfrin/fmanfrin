import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateReport, exportToCSV } from '@/lib/services/reporting';
import { logDataExport } from '@/lib/security/audit-log';
import * as db from '@/lib/db';

/**
 * POST /api/reports/generate
 * Generate and export report
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
        { error: 'Only admins can generate reports' },
        { status: 403 }
      );
    }

    // ✅ Try-catch for JSON parsing
    let body;
    try {
      body = await request.json();
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const {
      reportType,
      departmentId,
      startDate,
      endDate,
    } = body;

    if (!reportType) {
      return NextResponse.json({ error: 'Report type is required' }, { status: 400 });
    }

    // Generate report data
    const data = await generateReport({
      reportType,
      organizationId: employee.organization_id,
      departmentId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    // ✅ Log data export for audit trail (LGPD compliance)
    await logDataExport(
      employee.organization_id,
      session.user.id,
      reportType,
      data.length,
      request.headers.get('x-forwarded-for') || undefined
    );

    // Export to CSV
    const csvContent = exportToCSV(data, reportType);

    // Return as downloadable CSV
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
