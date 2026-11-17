import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone) return NextResponse.json({ exists: false });

    // Format phone to match what's stored (trimming spaces)
    const formattedPhone = phone.trim();
    
    // Instead of listing ALL auth users (which requires service_role and is slow),
    // we check the 'customers' table which is automatically updated on every order.
    const { data: customer, error } = await getSupabaseAdmin()
      .from('customers')
      .select('id')
      .eq('phone', formattedPhone)
      .maybeSingle();

    if (error) {
      console.error('Check user error:', error);
      return NextResponse.json({ exists: false, error: 'Database error' });
    }

    return NextResponse.json({ exists: !!customer });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ exists: false });
  }
}
