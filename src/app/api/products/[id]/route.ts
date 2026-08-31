import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { serverError, notFound, sanitizeBody } from '@/lib/admin/response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const { id } = await params;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return notFound();
  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const { id } = await params;
  const body = sanitizeBody(await request.json());

  const { data, error } = await supabase
    .from('products')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return serverError();
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const { id } = await params;

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) return serverError();
  return NextResponse.json({ success: true });
}
