import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: Request) {
  try {
    const { id, name, phone, email, address } = await request.json();

    if (!id || !phone) {
      return NextResponse.json({ error: "البيانات غير مكتملة" }, { status: 400 });
    }

    // Update customer record
    const { error } = await supabaseAdmin
      .from('customers')
      .update({
        name,
        phone,
        email,
        address,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Update profile error:', error);
      return NextResponse.json({ error: "فشل تحديث البيانات" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}
