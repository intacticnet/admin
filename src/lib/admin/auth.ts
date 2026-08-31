import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';

interface AdminAuthSuccess {
  user: User;
  supabase: SupabaseClient;
  response: null;
}

interface AdminAuthFailure {
  user: null;
  supabase: null;
  response: NextResponse;
}

/**
 * Creates a service-role Supabase client for admin database operations.
 * The service-role key bypasses RLS, which is safe here because:
 * 1. Auth is verified separately via the anon-key client + getUser().
 * 2. Role is checked via user.app_metadata?.role === 'admin'.
 * 3. The service-role key never leaves the server.
 */
function createServiceRoleClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createSupabaseClient(supabaseUrl, serviceRoleKey);
}

/**
 * Verifies the request is from an authenticated user with the 'admin' role.
 * Returns { user, supabase, response: null } on success.
 * Returns { user: null, supabase: null, response } with appropriate status on failure.
 *
 * The returned `supabase` client uses the SERVICE ROLE key so that admin CRUD
 * operations bypass RLS. Auth verification is done via the anon-key client.
 *
 * Admin role is checked via `user.app_metadata?.role === 'admin'`.
 */
export async function verifyAdmin(): Promise<AdminAuthSuccess | AdminAuthFailure> {
  // Step 1: Verify identity via anon-key client (reads session from cookies)
  const anonClient = await createClient();
  if (!anonClient) {
    return { user: null, supabase: null, response: NextResponse.json({ error: 'Service unavailable' }, { status: 503 }) };
  }

  const { data: { user } } = await anonClient.auth.getUser();
  if (!user) {
    return { user: null, supabase: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const role = user.app_metadata?.role;
  if (role !== 'admin') {
    return { user: null, supabase: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  // Step 2: Return a service-role client for database operations
  const adminClient = createServiceRoleClient();
  if (!adminClient) {
    return { user: null, supabase: null, response: NextResponse.json({ error: 'Service unavailable' }, { status: 503 }) };
  }

  return { user, supabase: adminClient, response: null };
}
