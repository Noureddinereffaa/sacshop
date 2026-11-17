import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

interface ValidateBody {
  code?: string;
  cart?: { productId: string; price: number; quantity: number }[];
}

// POST: validate a coupon against the current cart (server-side only).
// The coupons table is not publicly readable, so this API is the only
// way for clients to check a code. Discount is computed here.
export async function POST(request: NextRequest) {
  try {
    const body: ValidateBody = await request.json();
    const code = body.code?.trim().toUpperCase();
    const cart = Array.isArray(body.cart) ? body.cart : [];

    if (!code) {
      return NextResponse.json({ valid: false, error: "أدخل كود الكوبون" }, { status: 400 });
    }
    if (cart.length === 0) {
      return NextResponse.json({ valid: false, error: "السلة فارغة" }, { status: 400 });
    }

    const { data: coupon, error } = await getSupabaseAdmin()
      .from("coupons")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (error) return NextResponse.json({ valid: false, error: "خطأ في الخادم" }, { status: 500 });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "كود الكوبون غير صحيح" });
    }
    if (!coupon.is_active) {
      return NextResponse.json({ valid: false, error: "هذا الكوبون معطل حاليًا" });
    }
    if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
      return NextResponse.json({ valid: false, error: "هذا الكوبون لم يبدأ بعد" });
    }
    if (coupon.expires_at && new Date(coupon.expires_at) <= new Date()) {
      return NextResponse.json({ valid: false, error: "انتهت صلاحية هذا الكوبون" });
    }
    if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
      return NextResponse.json({ valid: false, error: "تم استنفاد هذا الكوبون بالكامل" });
    }

    // Determine which cart lines the coupon applies to
    let eligibleItems = cart;
    if (coupon.scope === "products") {
      const { data: links, error: linksError } = await getSupabaseAdmin()
        .from("coupon_products")
        .select("product_id")
        .eq("coupon_id", coupon.id);

      if (linksError) {
        return NextResponse.json({ valid: false, error: "خطأ في الخادم" }, { status: 500 });
      }

      const eligibleProductIds = new Set((links || []).map((l) => l.product_id));
      eligibleItems = cart.filter((item) => eligibleProductIds.has(item.productId));

      if (eligibleItems.length === 0) {
        return NextResponse.json({
          valid: false,
          error: "هذا الكوبون لا ينطبق على المنتجات الموجودة في سلتك",
        });
      }
    }

    const baseTotal = eligibleItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );

    if (coupon.min_order_total > 0 && baseTotal < coupon.min_order_total) {
      return NextResponse.json({
        valid: false,
        error: `الحد الأدنى للطلب لهذا الكوبون هو ${coupon.min_order_total.toLocaleString()} د.ج`,
      });
    }

    let discountAmount =
      coupon.discount_type === "percentage"
        ? Math.round(baseTotal * (coupon.discount_value / 100))
        : coupon.discount_value;

    if (coupon.max_discount_amount !== null && coupon.max_discount_amount !== undefined) {
      discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
    }
    discountAmount = Math.min(discountAmount, baseTotal);

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        max_discount_amount: coupon.max_discount_amount,
        discount_amount: discountAmount,
      },
    });
  } catch (err) {
    return NextResponse.json({ valid: false, error: "صيغة الطلب غير صالحة" }, { status: 400 });
  }
}
