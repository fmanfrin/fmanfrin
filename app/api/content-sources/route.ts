import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import * as db from '@/lib/db';
import { createContentSourceSchema, contentFilterSchema } from '@/lib/validations/content';

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
      category: request.nextUrl.searchParams.get('category') || undefined,
      status: request.nextUrl.searchParams.get('status') || undefined,
      type: request.nextUrl.searchParams.get('type') || undefined,
      page: parseInt(request.nextUrl.searchParams.get('page') || '1'),
      limit: parseInt(request.nextUrl.searchParams.get('limit') || '20'),
    };

    contentFilterSchema.parse(filters);

    const result = await db.listContentSources(organizationId, filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching content sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content sources' },
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
    const { organizationId, ...contentData } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    createContentSourceSchema.parse(contentData);

    const content = await db.createContentSource(organizationId, {
      title: contentData.title,
      description: contentData.description,
      category: contentData.category,
      tags: contentData.tags,
      type: contentData.type,
      contentText: contentData.contentText,
      authorId: session.user.id,
    });

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Error creating content source:', error);
    return NextResponse.json(
      { error: 'Failed to create content source' },
      { status: 500 }
    );
  }
}
