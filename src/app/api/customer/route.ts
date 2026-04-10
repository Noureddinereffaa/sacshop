import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

interface VipOffer {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_orders: number;
  min_spent: number;
  is_active: boolean;
  expires_at: string | null;
  max_uses: number | null;
  uses_count: number;
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // 1. Fetch customer by phone
    const { data: customerData, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single();

    if (customerError || !customerData) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // 2. Fetch their past orders
    const { data: ordersData } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('customer_id', customerData.id)
      .order('created_at', { ascending: false });

    // 3. Fetch all active VIP offers and filter by customer eligibility
    const { data: allOffers } = await supabaseAdmin
      .from('vip_offers')
      .select('*')
      .eq('is_active', true);

    const eligibleOffers = (allOffers || []).filter((offer: VipOffer) => {
      const meetsOrders = (offer.min_orders ?? 0) <= (customerData.total_orders || 0);
      const meetsSpent  = (offer.min_spent  ?? 0) <= (customerData.total_spent  || 0);
      const notExpired  = !offer.expires_at || new Date(offer.expires_at) > new Date();
      const hasUses     = !offer.max_uses   || (offer.uses_count || 0) < offer.max_uses;
      return meetsOrders && meetsSpent && notExpired && hasUses;
    });

    return NextResponse.json({
      customer: customerData,
      orders: ordersData || [],
      vipOffers: eligibleOffers,
    });

  } catch (error) {
    console.error("Track API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
