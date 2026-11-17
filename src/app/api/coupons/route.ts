import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

interface CouponPayload {
  code?: string;
  description?: string;
  discount_type?: "percentage" | "fixed";
  discount_value?: number;
  min_order_total?: number;
  max_discount_amount?: number | null;
  scope?: "store" | "products";
  starts_at?: string;
  expires_at?: string | null;
  max_uses?: number | null;
  is_active?: boolean;
  product_ids?: string[];
}

function validatePayload(body: CouponPayload): string | null {
  if (!body.code || !body.code.trim()) return "كود الكوبون مطلوب";
  if (!body.discount_type || !["percentage", "fixed"].includes(body.discount_type))
    return "نوع الخصم غير صالح";
  if (body.discount_value === undefined || body.discount_value === null || body.discount_value <= 0)
    return "قيمة الخصم يجب أن تكون أكبر من صفر";
  if (body.discount_type === "percentage" && body.discount_value > 100)
    return "نسبة الخصم لا يمكن أن تتجاوز 100%";
  if (body.scope === "products" && (!body.product_ids || body.product_ids.length === 0))
    return "يجب اختيار منتج واحد على الأقل لكوبون المنتجات";
  return null;
}

async function attachProductIds(couponIds: string[]) {
  if (couponIds.length === 0) return new Map<string, string[]>();
  const { data: links, error } = await getSupabaseAdmin()
    .from("coupon_products")
    .select("coupon_id, product_id")
    .in("coupon_id", couponIds);
  if (error) throw new Error(error.message);
  const map = new Map<string, string[]>();
  for (const link of links || []) {
    const list = map.get(link.coupon_id) || [];
    list.push(link.product_id);
    map.set(link.coupon_id, list);
  }
  return map;
}

// GET: list all coupons with their linked product ids (admin only)
export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const productMap = await attachProductIds((data || []).map((c) => c.id));
    const coupons = (data || []).map((coupon) => ({
      ...coupon,
      product_ids: productMap.get(coupon.id) || [],
    }));

    return NextResponse.json(coupons);
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطأ في الخادم";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: create a new coupon (admin only)
export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body: CouponPayload = await request.json();

    const validationError = validatePayload(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from("coupons")
      .insert({
        code: body.code!.trim(),
        description: body.description || null,
        discount_type: body.discount_type,
        discount_value: body.discount_value,
        min_order_total: body.min_order_total ?? 0,
        max_discount_amount: body.max_discount_amount ?? null,
        scope: body.scope || "store",
        starts_at: body.starts_at || new Date().toISOString(),
        expires_at: body.expires_at || null,
        max_uses: body.max_uses ?? null,
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "هذا الكود مستخدم بالفعل" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (body.scope === "products" && body.product_ids && body.product_ids.length > 0) {
      const { error: linkError } = await getSupabaseAdmin()
        .from("coupon_products")
        .insert(body.product_ids.map((product_id) => ({ coupon_id: data.id, product_id })));
      if (linkError) {
        return NextResponse.json({ error: linkError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ...data, product_ids: body.product_ids || [] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "صيغة الطلب غير صالحة" }, { status: 400 });
  }
}
