import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimitMiddleware } from "@/lib/rateLimit";
import { cache } from "@/lib/redis";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/['"]/g, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/['"]/g, "");
  if (!url || !key) return null;
  return createClient(url, key);
}

// Cache TTL for stock movements (5 minutes)
const MOVEMENTS_CACHE_TTL = 300;

export async function GET(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request, "general");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "عدد الطلبات تجاوز الحد المسموح به",
          retryAfter: rateLimitResult.reset,
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");
    const limit = parseInt(searchParams.get("limit") || "50");

    const sb = getAdminSupabase();
    if (!sb) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { error: "product_id is required" },
        { status: 400 }
      );
    }

    // Cache key
    const cacheKey = `stock_movements:${productId}:${limit}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Fetch stock movements
    const { data, error } = await sb
      .from("stock_movements")
      .select(`
        id, 
        product_id, 
        movement_type, 
        quantity, 
        previous_stock, 
        new_stock, 
        reference_type, 
        reference_id, 
        notes, 
        created_at
      `)
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Stock Movements API] Error:", error);
      return NextResponse.json(
        { error: "Failed to fetch stock movements" },
        { status: 500 }
      );
    }

    // Fetch product name for display
    const { data: product } = await sb
      .from("products")
      .select("name")
      .eq("id", productId)
      .single();

    const responseData = {
      movements: data?.map((m) => ({
        ...m,
        product_name: product?.name || "Unknown",
      })) || [],
    };

    // Cache the response
    await cache.set(cacheKey, responseData, MOVEMENTS_CACHE_TTL);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[Stock Movements API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
