import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';


export async function POST(request: Request) {
  try {
    const { id, name, phone, email, address } = await request.json();

    if (!id || !phone) {
      return NextResponse.json({ error: "البيانات غير مكتملة" }, { status: 400 });
    }

    // Update customer record
    const { error } = await getSupabaseAdmin()
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
