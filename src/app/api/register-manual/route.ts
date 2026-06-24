import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export async function POST(request: Request) {
  try {
    const { phone, name, password } = await request.json();

    if (!phone || !password || !name) {
      return NextResponse.json({ error: 'يرجى إدخال جميع البيانات' }, { status: 400 });
    }

    const email = `${phone.replace(/\s+/g, '')}@serigraphie.dz`;

    // 1. Check if auth user already exists
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existing = users.find(u => u.email === email);

    if (existing) {
       return NextResponse.json({ error: 'هذا الرقم مسجل مسبقاً، يرجى تسجيل الدخول' }, { status: 400 });
    }

    // 2. Create new Supabase Auth user
    const { error: createError, data: authData } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { phone, name },
    });
    if (createError) throw createError;

    // 3. Ensure the customer exists in the customers table
    const { error: customerError } = await supabaseAdmin.from('customers').upsert({
      phone,
      name,
      total_orders: 0,
      total_spent: 0
    }, { onConflict: 'phone' });
    
    if (customerError) console.error("Error creating customer record:", customerError);

    return NextResponse.json({ success: true, userId: authData.user?.id });

  } catch (error) {
    console.error('Manual Registration Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الحساب' }, { status: 500 });
  }
}
