import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimitMiddleware } from '@/lib/rateLimit';
import { cache } from '@/lib/redis';


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

function calculateStarLevel(totalOrders: number): number {
  if (totalOrders >= 5) return 5;
  if (totalOrders >= 4) return 4;
  if (totalOrders >= 3) return 3;
  if (totalOrders >= 2) return 2;
  if (totalOrders >= 1) return 1;
  return 0;
}

// Cache customer data for 5 minutes
const CUSTOMER_CACHE_TTL = 300;

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request, "customer");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "عدد الطلبات تجاوز الحد المسموح به",
          retryAfter: rateLimitResult.reset,
        },
        { status: 429 }
      );
    }

    const { phone, name } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "رقم الهاتف مطلوب" },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `customer:${phone}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // 1. Fetch customer by phone
    let { data: customerData, error: customerError } = await getSupabaseAdmin()
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    // If not found, create automatically (Auto-Registration)
    if (!customerData) {
       const { data: newCustomer, error: createError } = await getSupabaseAdmin()
         .from('customers')
         .insert({
           phone: phone,
           name: name || "زبون جديد",
           total_orders: 0,
           total_spent: 0
         })
         .select()
         .single();
       
       if (createError) throw createError;
       customerData = newCustomer;
    }

    // 2. Fetch their past orders — by phone (reliable) since orders may not always have customer_id
    const { data: ordersData } = await getSupabaseAdmin()
      .from('orders')
      .select('*')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false });

    // 2b. Link any orphaned orders to this customer (background, non-blocking)
    if (ordersData && ordersData.length > 0 && customerData.id) {
      const orphanedIds = ordersData
        .filter((o: any) => !o.customer_id)
        .map((o: any) => o.id);
      if (orphanedIds.length > 0) {
        (async () => {
          try {
            await getSupabaseAdmin()
              .from('orders')
              .update({ customer_id: customerData.id })
              .in('id', orphanedIds);
          } catch { /* non-blocking */ }
        })();
      }
    }

    // 3. Fetch all active VIP offers and filter by customer eligibility
    const { data: allOffers } = await getSupabaseAdmin()
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

    const starLevel = calculateStarLevel(customerData.total_orders || 0);

    // 4. Fetch Discount Settings
    const { data: discountSettings } = await getSupabaseAdmin()
      .from('settings')
      .select('value')
      .eq('key', 'discounts')
      .single();

    const responseData = {
      customer: {
        ...customerData,
        star_level: starLevel,
      },
      orders: ordersData || [],
      vipOffers: eligibleOffers,
      discountConfig: discountSettings?.value || null
    };

    // Cache the response
    await cache.set(cacheKey, responseData, CUSTOMER_CACHE_TTL);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Customer API Error:", error);
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
