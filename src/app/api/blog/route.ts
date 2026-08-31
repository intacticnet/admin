import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { serverError, sanitizeBody } from '@/lib/admin/response';

export async function GET() {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, authors(name, slug, avatar_url), blog_categories(name, slug)')
    .order('created_at', { ascending: false });

  if (error) return serverError();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const body = sanitizeBody(await request.json());

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(body)
    .select('*, authors(name, slug, avatar_url), blog_categories(name, slug)')
    .single();

  if (error) return serverError();
  return NextResponse.json(data, { status: 201 });
}
