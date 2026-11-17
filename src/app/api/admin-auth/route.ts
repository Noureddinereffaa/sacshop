import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, verifySessionToken } from "@/lib/adminAuth";
import { rateLimitMiddleware } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for admin auth
    const rateLimitResult = await rateLimitMiddleware(request, "adminAuth");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "عدد محاولات تسجيل الدخول تجاوز الحد المسموح به",
          retryAfter: rateLimitResult.reset,
        },
        { status: 429 }
      );
    }

    const { password } = await request.json();

    // Server-side only — never exposed to the browser
    const adminPassword = process.env.ADMIN_PASSWORD || "sacshopadmin";

    if (password === adminPassword) {
      // Generate a signed session token (HMAC) — cannot be forged without the secret
      const token = createSessionToken();

      const response = NextResponse.json({ success: true });

      // Set httpOnly cookie with enhanced security
      response.cookies.set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
        priority: "high",
      });

      // Set additional security headers
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("X-Frame-Options", "DENY");
      response.headers.set("X-XSS-Protection", "1; mode=block");
      response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

      return response;
    }

    return NextResponse.json(
      { success: false, error: "كلمة المرور غير صحيحة" },
      { status: 401 }
    );
  } catch (error) {
    console.error("[Admin Auth] Error:", error);
    return NextResponse.json(
      { success: false, error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}

// Verify session endpoint
export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session");
  if (verifySessionToken(sessionCookie?.value)) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

// Logout endpoint
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete({
    name: "admin_session",
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
