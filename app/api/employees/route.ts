import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as db from '@/lib/db';
import { createEmployeeSchema, employeeFilterSchema } from '@/lib/validations/employee';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = request.nextUrl.searchParams.get('organizationId');
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    const filters = {
      departmentId: request.nextUrl.searchParams.get('departmentId') || undefined,
      status: request.nextUrl.searchParams.get('status') || undefined,
      search: request.nextUrl.searchParams.get('search') || undefined,
      page: parseInt(request.nextUrl.searchParams.get('page') || '1'),
      limit: parseInt(request.nextUrl.searchParams.get('limit') || '20'),
    };

    employeeFilterSchema.parse(filters);

    const result = await db.listEmployees(organizationId, filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, ...employeeData } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    createEmployeeSchema.parse(employeeData);

    const employee = await db.createEmployee(organizationId, {
      fullName: employeeData.fullName,
      email: employeeData.email,
      cpf: employeeData.cpf,
      departmentId: employeeData.departmentId,
      jobTitle: employeeData.jobTitle,
      managerId: employeeData.managerId,
      admissionDate: employeeData.admissionDate ? new Date(employeeData.admissionDate) : undefined,
      phone: employeeData.phone,
      city: employeeData.city,
      state: employeeData.state,
      unit: employeeData.unit,
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
