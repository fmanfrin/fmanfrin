/**
 * Rate Limiter
 * Prevents abuse of APIs with intelligent rate limiting
 * ✅ Uses Supabase for persistence (works in Vercel serverless)
 */

import { supabase } from '../supabase';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // milliseconds
  message?: string;
}

/**
 * Rate limiting configurations for different endpoints
 */
export const rateLimitConfigs = {
  auth: {
    login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
    signup: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
    resetPassword: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  },
  api: {
    default: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
    ai: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 AI requests per hour
    upload: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 uploads per minute
  },
};

/**
 * Check if request exceeds rate limit
 * ✅ Uses Supabase for persistence (works in serverless)
 */
export async function isRateLimited(
  key: string,
  config: RateLimitConfig
): Promise<boolean> {
  try {
    const now = Date.now();

    const { data: record } = await supabase
      .from('rate_limit_records')
      .select('*')
      .eq('key', key)
      .maybeSingle();

    // No record yet, create new one
    if (!record) {
      await supabase.from('rate_limit_records').insert({
        key,
        count: 1,
        reset_time: now + config.windowMs,
      });
      return false;
    }

    // Window has expired, reset
    if (now >= record.reset_time) {
      await supabase
        .from('rate_limit_records')
        .update({
          count: 1,
          reset_time: now + config.windowMs,
        })
        .eq('key', key);
      return false;
    }

    // Check limit
    if (record.count >= config.maxRequests) {
      return true;
    }

    // Increment counter
    await supabase
      .from('rate_limit_records')
      .update({ count: record.count + 1 })
      .eq('key', key);

    return false;
  } catch (err) {
    console.error('Rate limiter error:', err);
    // On error, allow request (fail open for availability)
    return false;
  }
}

/**
 * Get remaining requests
 */
export async function getRemainingRequests(
  key: string,
  config: RateLimitConfig
): Promise<number> {
  try {
    const now = Date.now();

    const { data: record } = await supabase
      .from('rate_limit_records')
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (!record) {
      return config.maxRequests;
    }

    if (now >= record.reset_time) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - record.count);
  } catch (err) {
    console.error('Error getting remaining requests:', err);
    return config.maxRequests;
  }
}

/**
 * Get reset time in seconds
 */
export async function getResetTime(key: string, config: RateLimitConfig): Promise<number> {
  try {
    const now = Date.now();

    const { data: record } = await supabase
      .from('rate_limit_records')
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (!record) {
      return 0;
    }

    if (now >= record.reset_time) {
      return 0;
    }

    return Math.ceil((record.reset_time - now) / 1000);
  } catch (err) {
    console.error('Error getting reset time:', err);
    return 0;
  }
}
