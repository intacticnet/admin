import { NextResponse } from 'next/server';

/**
 * Returns a generic error response for client-facing errors.
 * Logs the real error server-side for debugging.
 *
 * S12 FIX: Never leak Supabase error messages (table names, column names, constraint names).
 */
export function serverError(message: string = 'An internal error occurred', status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function notFound(message: string = 'Resource not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * S8 FIX: Strips protected fields from a request body before passing to Supabase.
 * Prevents mass assignment of id, created_at, updated_at, and other system-managed fields.
 */
const PROTECTED_FIELDS = new Set([
  'id',
  'created_at',
  'createdAt',
  'updated_at',
  'updatedAt',
]);

export function sanitizeBody<T extends Record<string, any>>(body: T): T {
  const sanitized = { ...body };
  for (const field of PROTECTED_FIELDS) {
    delete (sanitized as any)[field];
  }
  return sanitized;
}
