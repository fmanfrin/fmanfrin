/**
 * Input Sanitization
 * Prevents XSS, injection, and other input-based attacks
 */

/**
 * Sanitize HTML input to prevent XSS
 */
export function sanitizeHTML(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove iframe, embed, object tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');

  return sanitized;
}

/**
 * Escape HTML entities
 */
export function escapeHTML(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return input.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 simplified regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL
 */
export function isValidURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    // Only allow http and https
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'file';
  }

  // Remove path characters
  filename = filename.replace(/[/\\]/g, '');

  // Remove potentially dangerous characters
  filename = filename.replace(/[<>:"|?*\x00-\x1f]/g, '');

  // Remove leading/trailing dots and spaces
  filename = filename.replace(/^[\s.]+|[\s.]+$/g, '');

  // Limit length
  if (filename.length > 255) {
    filename = filename.substring(0, 255);
  }

  return filename || 'file';
}

/**
 * Truncate string safely
 */
export function truncate(input: string, length: number = 100): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  if (input.length <= length) {
    return input;
  }

  return input.substring(0, length) + '...';
}

/**
 * Remove null bytes
 */
export function removeNullBytes(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input.replace(/\0/g, '');
}

/**
 * Validate that input contains only allowed characters
 */
export function isAlphanumeric(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  return /^[a-zA-Z0-9_-]+$/.test(input);
}

/**
 * Deep sanitize object (recursive)
 */
const MAX_SANITIZE_DEPTH = 10;

export function sanitizeObject(obj: any, depth = 0): any {
  // ✅ Prevent stack overflow
  if (depth > MAX_SANITIZE_DEPTH) {
    console.warn(`sanitizeObject: max depth (${MAX_SANITIZE_DEPTH}) exceeded`);
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeHTML(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1));
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip potentially dangerous keys
      if (key.startsWith('__') || key.toLowerCase().includes('script')) {
        continue;
      }
      sanitized[key] = sanitizeObject(value, depth + 1);
    }
    return sanitized;
  }

  return obj;
}
