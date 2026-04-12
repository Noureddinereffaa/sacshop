import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export async function POST(request: Request) {
  try {
    const { phone, name, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
    }

    const email = `${phone.replace(/\s+/g, '')}@serigraphie.dz`;

    // Check if auth user already exists
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existing = users.find(u => u.email === email);

    if (existing) {
      // Update existing user's password
      await supabaseAdmin.auth.admin.updateUserById(existing.id, { password });
    } else {
      // Create new Supabase Auth user
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { phone, name },
      });
      if (createError) throw createError;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Setup Account Error:', error);
    return NextResponse.json({ error: 'فشل إنشاء الحساب' }, { status: 500 });
  }
}
