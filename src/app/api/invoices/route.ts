import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { serverError, sanitizeBody } from '@/lib/admin/response';

export async function GET() {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const { data, error } = await supabase
    .from('invoices')
    .select('*, clients(id, company_name)')
    .order('created_at', { ascending: false });

  if (error) return serverError();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const body = sanitizeBody(await request.json());

  // Handle invoice_items if present
  const { invoice_items, ...invoiceData } = body as Record<string, unknown>;

  const { data, error } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select('*, clients(id, company_name)')
    .single();

  if (error) return serverError();

  // Insert invoice items if present
  if (invoice_items && Array.isArray(invoice_items) && invoice_items.length > 0) {
    const items = invoice_items.map((item: Record<string, unknown>, i: number) => ({
      invoice_id: data.id,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
      sort_order: i,
    }));

    const { error: itemError } = await supabase
      .from('invoice_items')
      .insert(items);

    if (itemError) return serverError();
  }

  return NextResponse.json(data, { status: 201 });
}
