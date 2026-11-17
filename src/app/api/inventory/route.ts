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

// Cache TTL for inventory data (1 minute)
const INVENTORY_CACHE_TTL = 60;

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
    const lowStockOnly = searchParams.get("low_stock") === "true";

    const sb = getAdminSupabase();
    if (!sb) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    // Cache key
    const cacheKey = `inventory:${productId || "all"}:${lowStockOnly}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    let query = sb.from("products").select(
      "id, name, stock, reserved_stock, low_stock_threshold, category"
    );

    if (productId) {
      query = query.eq("id", productId);
    } else if (lowStockOnly) {
      query = query.lte("stock", sb.rpc("coalesce", [sb.rpc("col", ["low_stock_threshold"]), 10]));
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Inventory API] Error:", error);
      return NextResponse.json(
        { error: "Failed to fetch inventory data" },
        { status: 500 }
      );
    }

    const responseData = {
      products: data || [],
      alerts: data?.filter((p: any) => p.stock <= (p.low_stock_threshold || 10)) || [],
      totalLowStock: data?.filter((p: any) => p.stock <= (p.low_stock_threshold || 10)).length || 0,
    };

    // Cache the response
    await cache.set(cacheKey, responseData, INVENTORY_CACHE_TTL);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[Inventory API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { product_id, quantity, movement_type, notes, reference_type, reference_id } = body;

    if (!product_id || quantity === undefined || !movement_type) {
      return NextResponse.json(
        { error: "Missing required fields: product_id, quantity, movement_type" },
        { status: 400 }
      );
    }

    const sb = getAdminSupabase();
    if (!sb) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    // Get current product stock
    const { data: product, error: productError } = await sb
      .from("products")
      .select("stock, reserved_stock, low_stock_threshold")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    let newStock = product.stock;
    let newReservedStock = product.reserved_stock || 0;

    // Calculate new stock based on movement type
    switch (movement_type) {
      case "in":
        newStock += quantity;
        break;
      case "out":
        // Check if stock is available
        const availableStock = product.stock - (product.reserved_stock || 0);
        if (quantity > availableStock) {
          return NextResponse.json(
            {
              error: `Not enough stock available. Current: ${availableStock}, Requested: ${quantity}`,
              available_stock: availableStock,
            },
            { status: 400 }
          );
        }
        newStock -= quantity;
        newReservedStock += quantity;
        break;
      case "adjustment":
        newStock += quantity;
        break;
      case "return":
        // Return from reserved stock
        if (quantity > newReservedStock) {
          return NextResponse.json(
            {
              error: `Cannot return more than reserved stock. Reserved: ${newReservedStock}, Requested: ${quantity}`,
            },
            { status: 400 }
          );
        }
        newStock += quantity;
        newReservedStock -= quantity;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid movement type" },
          { status: 400 }
        );
    }

    // Update product stock
    const { error: updateError } = await sb
      .from("products")
      .update({
        stock: newStock,
        reserved_stock: newReservedStock,
        stock_updated_at: new Date().toISOString(),
      })
      .eq("id", product_id);

    if (updateError) {
      console.error("[Inventory API] Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update stock" },
        { status: 500 }
      );
    }

    // Record stock movement
    const { error: movementError } = await sb.from("stock_movements").insert({
      product_id,
      movement_type,
      quantity,
      previous_stock: product.stock,
      new_stock: newStock,
      reference_type,
      reference_id,
      notes,
    });

    if (movementError) {
      console.error("[Inventory API] Movement recording error:", movementError);
      // Stock was updated but movement wasn't recorded - log this
    }

    // Invalidate cache
    await cache.delete(`inventory:${product_id}:false`);
    await cache.delete(`inventory:${product_id}:true`);
    await cache.delete("inventory:all:false");
    await cache.delete("inventory:all:true");

    return NextResponse.json({
      success: true,
      product_id,
      previous_stock: product.stock,
      new_stock: newStock,
      reserved_stock: newReservedStock,
      movement_type,
      quantity,
    });
  } catch (error) {
    console.error("[Inventory API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
