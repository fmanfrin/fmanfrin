/**
 * Text Extraction Service
 * Supports: PDF, DOCX, PPTX, TXT, Markdown, plain text
 */

export interface ExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
  warning?: string;
}

/**
 * Extract text from different file formats
 * For production, you'd use proper libraries:
 * - PDF: pdf-parse or pdfjs-dist
 * - DOCX: docx-parser or mammoth
 * - PPTX: pptxjs or node-pptx
 */
export async function extractTextFromFile(
  file: File
): Promise<ExtractionResult> {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type;

  try {
    // Text and Markdown files
    if (
      fileName.endsWith('.txt') ||
      fileName.endsWith('.md') ||
      fileName.endsWith('.markdown')
    ) {
      const text = await file.text();
      return { success: true, text };
    }

    // PDF files
    if (fileName.endsWith('.pdf') || mimeType === 'application/pdf') {
      return {
        success: false,
        error: 'PDF requer biblioteca pdfjs-dist. Implemente com: npm install pdfjs-dist',
        warning:
          'Para agora, exporte PDF como texto ou use formato alternativo (DOCX, TXT)',
      };
    }

    // DOCX files
    if (
      fileName.endsWith('.docx') ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return {
        success: false,
        error: 'DOCX requer biblioteca mammoth ou docx-parser. Implemente com: npm install mammoth',
        warning: 'Para agora, copie o conteúdo como texto ou use TXT',
      };
    }

    // PPTX files
    if (
      fileName.endsWith('.pptx') ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      return {
        success: false,
        error: 'PPTX requer biblioteca pptxjs. Implemente com: npm install pptxjs',
        warning:
          'Para agora, exporte slides como texto ou copie o conteúdo manualmente',
      };
    }

    // Text-like files
    if (
      mimeType.startsWith('text/') ||
      mimeType === 'application/json'
    ) {
      const text = await file.text();
      return { success: true, text };
    }

    return {
      success: false,
      error: `Tipo de arquivo não suportado: ${mimeType || fileName}`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro ao extrair texto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

/**
 * Validate file before extraction
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (file.size > maxSize) {
    return { valid: false, error: 'Arquivo excede 10MB' };
  }

  const allowed = [
    'text/plain',
    'text/markdown',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  const fileName = file.name.toLowerCase();
  const isValidExt =
    fileName.endsWith('.txt') ||
    fileName.endsWith('.md') ||
    fileName.endsWith('.pdf') ||
    fileName.endsWith('.docx') ||
    fileName.endsWith('.pptx') ||
    fileName.endsWith('.markdown');

  const isValidMime = allowed.includes(file.type) || file.type.startsWith('text/');

  if (!isValidExt && !isValidMime) {
    return {
      valid: false,
      error: 'Formato de arquivo não permitido. Use: TXT, MD, PDF, DOCX, PPTX',
    };
  }

  return { valid: true };
}

/**
 * Extract and clean text
 */
export function cleanExtractedText(text: string): string {
  return text
    .trim()
    // Remove excessive whitespace
    .replace(/\n{3,}/g, '\n\n')
    // Clean up whitespace around punctuation
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/\s+\n/g, '\n')
    .trim();
}

/**
 * Summarize text length
 */
export function getTextStats(text: string) {
  const words = text.split(/\s+/).length;
  const chars = text.length;
  const lines = text.split('\n').length;
  const paragraphs = text.split('\n\n').length;

  return { words, chars, lines, paragraphs };
}
