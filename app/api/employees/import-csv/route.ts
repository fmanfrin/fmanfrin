import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import * as db from '@/lib/db';
import { createEmployeeSchema } from '@/lib/validations/employee';

/**
 * CSV Import Handler
 * Expected CSV format:
 * fullName,email,cpf,departmentId,jobTitle,managerId,admissionDate,phone,city,state,unit
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const organizationId = formData.get('organizationId') as string;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV file' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());

    const errors: Array<{ row: number; error: string }> = [];
    const employees: Array<any> = [];

    // Parse CSV data
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',').map((v) => v.trim());
      const row = i + 1;

      const data: any = {};
      headers.forEach((header, index) => {
        data[header] = values[index] || undefined;
      });

      try {
        // Validate row
        const validated = createEmployeeSchema.parse({
          fullName: data.fullName,
          email: data.email,
          cpf: data.cpf,
          departmentId: data.departmentId,
          jobTitle: data.jobTitle,
          managerId: data.managerId,
          admissionDate: data.admissionDate ? new Date(data.admissionDate) : undefined,
          phone: data.phone,
          city: data.city,
          state: data.state,
          unit: data.unit,
        });

        employees.push(validated);
      } catch (error: any) {
        errors.push({
          row,
          error: error.errors?.[0]?.message || 'Invalid data',
        });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Some rows have validation errors',
          errors,
          validCount: employees.length,
        },
        { status: 400 }
      );
    }

    // Bulk create employees
    const created = await db.bulkCreateEmployees(organizationId, employees);

    return NextResponse.json({
      success: true,
      imported: created.length,
      employees: created,
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    return NextResponse.json(
      { error: 'Failed to import CSV' },
      { status: 500 }
    );
  }
}
