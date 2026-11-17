import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

interface CouponUpdatePayload {
  code?: string;
  description?: string | null;
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

// PATCH: update a coupon (fields and/or linked products) — admin only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body: CouponUpdatePayload = await request.json();

    if (!id) {
      return NextResponse.json({ error: "معرف الكوبون مطلوب" }, { status: 400 });
    }

    if (
      body.discount_type === "percentage" &&
      body.discount_value !== undefined &&
      body.discount_value > 100
    ) {
      return NextResponse.json({ error: "نسبة الخصم لا يمكن أن تتجاوز 100%" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (body.code !== undefined) updates.code = body.code.trim();
    if (body.description !== undefined) updates.description = body.description;
    if (body.discount_type !== undefined) updates.discount_type = body.discount_type;
    if (body.discount_value !== undefined) updates.discount_value = body.discount_value;
    if (body.min_order_total !== undefined) updates.min_order_total = body.min_order_total;
    if (body.max_discount_amount !== undefined) updates.max_discount_amount = body.max_discount_amount;
    if (body.scope !== undefined) updates.scope = body.scope;
    if (body.starts_at !== undefined) updates.starts_at = body.starts_at;
    if (body.expires_at !== undefined) updates.expires_at = body.expires_at;
    if (body.max_uses !== undefined) updates.max_uses = body.max_uses;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    if (Object.keys(updates).length > 0) {
      const { error } = await getSupabaseAdmin()
        .from("coupons")
        .update(updates)
        .eq("id", id);

      if (error) {
        if (error.code === "23505") {
          return NextResponse.json({ error: "هذا الكود مستخدم بالفعل" }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    if (body.product_ids !== undefined) {
      const { error: deleteError } = await getSupabaseAdmin()
        .from("coupon_products")
        .delete()
        .eq("coupon_id", id);
      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      if (body.product_ids.length > 0) {
        const { error: linkError } = await getSupabaseAdmin()
          .from("coupon_products")
          .insert(body.product_ids.map((product_id) => ({ coupon_id: id, product_id })));
        if (linkError) {
          return NextResponse.json({ error: linkError.message }, { status: 500 });
        }
      }
    }

    const { data: coupon, error: fetchError } = await getSupabaseAdmin()
      .from("coupons")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

    const { data: links } = await getSupabaseAdmin()
      .from("coupon_products")
      .select("product_id")
      .eq("coupon_id", id);

    return NextResponse.json({
      ...coupon,
      product_ids: (links || []).map((l) => l.product_id),
    });
  } catch (err) {
    return NextResponse.json({ error: "صيغة الطلب غير صالحة" }, { status: 400 });
  }
}

// DELETE: remove a coupon (coupon_products rows cascade) — admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "معرف الكوبون مطلوب" }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin()
      .from("coupons")
      .delete()
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
