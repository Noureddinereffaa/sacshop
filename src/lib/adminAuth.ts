import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const SESSION_SECRET = process.env.ADMIN_PASSWORD || "sacshopadmin";

export function createSessionToken(): string {
  const payload = `admin_${Date.now()}_${createHmac("sha256", SESSION_SECRET)
    .update(String(Date.now()))
    .digest("hex")
    .slice(0, 16)}`;
  const signature = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64")}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  let payload: string;
  try {
    payload = Buffer.from(encodedPayload, "base64").toString("utf8");
  } catch {
    return false;
  }
  if (!payload.startsWith("admin_")) return false;

  const expected = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Returns a 401 response when the request has no valid admin session,
// otherwise null (meaning the handler may proceed).
export function requireAdmin(request: NextRequest): NextResponse | null {
  const session = request.cookies.get("admin_session");
  if (!verifySessionToken(session?.value)) {
    return NextResponse.json({ error: "غير مصرح — جلسة الإدارة غير صالحة" }, { status: 401 });
  }
  return null;
}
