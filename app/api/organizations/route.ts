import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import * as db from '@/lib/db';
import { createOrganizationSchema } from '@/lib/validations/organization';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
    const status = request.nextUrl.searchParams.get('status') || undefined;

    const result = await db.listOrganizations({
      status,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
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
    createOrganizationSchema.parse(body);

    const organization = await db.createOrganization({
      name: body.name,
      cnpj: body.cnpj,
      plan: body.plan,
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
