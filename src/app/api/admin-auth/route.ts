import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Server-side only — never exposed to the browser
    const adminPassword = process.env.ADMIN_PASSWORD || "sacshopadmin";

    if (password === adminPassword) {
      // Generate a simple session token
      const token = Buffer.from(`admin_${Date.now()}_${Math.random().toString(36).slice(2)}`).toString("base64");
      
      const response = NextResponse.json({ success: true });
      
      // Set httpOnly cookie (not accessible by JS)
      response.cookies.set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/admin",
      });

      return response;
    }

    return NextResponse.json({ success: false, error: "كلمة المرور غير صحيحة" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: "خطأ في الخادم" }, { status: 500 });
  }
}

// Verify session endpoint
export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session");
  if (sessionCookie?.value) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

// Logout endpoint
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
