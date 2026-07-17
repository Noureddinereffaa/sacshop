import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET: fetch all vip_offers
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('vip_offers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: create new vip_offer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      discount_type,
      discount_value,
      min_orders,
      min_spent,
      is_active,
      starts_at,
      expires_at,
      max_uses,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('vip_offers')
      .insert([{
        title,
        description: description || '',
        discount_type: discount_type || 'percentage',
        discount_value: discount_value || 10,
        min_orders: min_orders ?? 0,
        min_spent: min_spent ?? 0,
        is_active: is_active ?? true,
        starts_at: starts_at || new Date().toISOString().split('T')[0],
        expires_at: expires_at || null,
        max_uses: max_uses || null,
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// PATCH: update existing vip_offer
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, uses_count, ...rest } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('vip_offers')
      .update(rest)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE: delete a vip_offer by id (passed as query param)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('vip_offers')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
