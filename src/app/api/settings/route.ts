import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { serverError, sanitizeBody } from '@/lib/admin/response';

export async function GET() {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value, updated_at');

  if (error) return serverError();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const body = sanitizeBody(await request.json());

  const { data, error } = await supabase
    .from('site_settings')
    .upsert(body, { onConflict: 'key' })
    .select('key, value, updated_at')
    .single();

  if (error) return serverError();
  return NextResponse.json(data);
}
