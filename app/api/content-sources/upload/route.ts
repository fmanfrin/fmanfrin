import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import * as db from '@/lib/db';
import { supabase } from '@/lib/supabase';
import {
  extractTextFromFile,
  validateFile,
  cleanExtractedText,
  getTextStats,
} from '@/lib/services/text-extraction';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const organizationId = formData.get('organizationId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const tags = formData.get('tags') as string;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Extract text
    const extractionResult = await extractTextFromFile(file);
    if (!extractionResult.success) {
      return NextResponse.json(
        {
          error: extractionResult.error,
          warning: extractionResult.warning,
        },
        { status: 400 }
      );
    }

    const extractedText = extractionResult.text || '';
    const cleanedText = cleanExtractedText(extractedText);
    const stats = getTextStats(cleanedText);

    // Upload file to Supabase Storage
    const fileName = `${organizationId}/${Date.now()}-${file.name}`;
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('content-files')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

    // Create content source record
    const content = await db.createContentSource(organizationId, {
      title,
      description,
      category,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      type: file.name.toLowerCase().endsWith('.pdf')
        ? 'pdf'
        : file.name.toLowerCase().endsWith('.docx')
          ? 'docx'
          : file.name.toLowerCase().endsWith('.pptx')
            ? 'pptx'
            : 'text',
      contentText: cleanedText,
      fileStoragePath: fileName,
      authorId: session.user.id,
    });

    return NextResponse.json(
      {
        content,
        extraction: {
          success: true,
          stats,
          textPreview: cleanedText.substring(0, 200),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading content:', error);
    return NextResponse.json(
      { error: 'Failed to upload content' },
      { status: 500 }
    );
  }
}
