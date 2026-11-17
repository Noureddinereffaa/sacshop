import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

interface RedeemBody {
  coupon_id?: string;
  order_id?: string;
}

// POST: atomically record one coupon use after a successful order.
// Uses the redeem_coupon() Postgres function so concurrent orders
// can never exceed max_uses.
export async function POST(request: NextRequest) {
  try {
    const body: RedeemBody = await request.json();

    if (!body.coupon_id || !body.order_id) {
      return NextResponse.json({ redeemed: false, error: "بيانات ناقصة" }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .rpc("redeem_coupon", { p_coupon_id: body.coupon_id });

    if (error) {
      return NextResponse.json({ redeemed: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ redeemed: data === true });
  } catch (err) {
    return NextResponse.json({ redeemed: false, error: "صيغة الطلب غير صالحة" }, { status: 400 });
  }
}
