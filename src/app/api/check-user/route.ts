import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone) return NextResponse.json({ exists: false });

    // Format phone to match what's stored (trimming spaces)
    const formattedPhone = phone.trim();
    
    // Instead of listing ALL auth users (which requires service_role and is slow),
    // we check the 'customers' table which is automatically updated on every order.
    const { data: customer, error } = await supabaseAdmin
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
