import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import * as db from '@/lib/db';
import { createDepartmentSchema, departmentFilterSchema } from '@/lib/validations/organization';

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
      search: request.nextUrl.searchParams.get('search') || undefined,
      page: parseInt(request.nextUrl.searchParams.get('page') || '1'),
      limit: parseInt(request.nextUrl.searchParams.get('limit') || '20'),
    };

    departmentFilterSchema.parse(filters);

    const result = await db.listDepartments(organizationId, filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
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
    const { organizationId, ...deptData } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    createDepartmentSchema.parse(deptData);

    const department = await db.createDepartment(organizationId, deptData);

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
}
