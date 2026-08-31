import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const { key } = await params;

  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value, updated_at')
    .eq('key', key)
    .single();

  if (error) return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const { key } = await params;
  const body = await request.json();

  const { value } = body;
  if (typeof value !== 'string') {
    return NextResponse.json({ error: 'Value must be a string' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ key, value }, { onConflict: 'key' })
    .select('key, value, updated_at')
    .single();

  if (error) return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const { key } = await params;

  const { error } = await supabase
    .from('site_settings')
    .delete()
    .eq('key', key);

  if (error) return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 });
  return NextResponse.json({ success: true });
}
