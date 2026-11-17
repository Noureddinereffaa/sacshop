/**
 * Inventory Management Utilities
 * Handles stock checking, validation, and updates
 */

import { cache } from "./redis";

interface ProductStock {
  id: string;
  stock: number;
  reserved_stock: number;
  low_stock_threshold: number;
}

interface StockCheckResult {
  inStock: boolean;
  availableQuantity: number;
  reservedQuantity: number;
  isLowStock: boolean;
  error?: string;
}

interface BulkStockCheckResult {
  allInStock: boolean;
  outOfStockItems: Array<{
    productId: string;
    requestedQuantity: number;
    availableQuantity: number;
  }>;
  lowStockItems: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    threshold: number;
  }>;
}

/**
 * Get product stock information from cache or API
 */
export async function getProductStock(productId: string): Promise<ProductStock | null> {
  try {
    // Try to get from cache first
    const cacheKey = `product_stock:${productId}`;
    const cachedStock = await cache.get(cacheKey);
    if (cachedStock) {
      return cachedStock as ProductStock;
    }

    // Fetch from API
    const response = await fetch(`/api/inventory?product_id=${productId}`);
    if (!response.ok) {
      console.error("Failed to fetch product stock:", productId);
      return null;
    }

    const data = await response.json();
    const product = data.products?.[0];
    
    if (product) {
      // Cache for 1 minute
      await cache.set(cacheKey, product, 60);
      return product as ProductStock;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting product stock:", error);
    return null;
  }
}

/**
 * Check if a product has enough stock
 */
export async function checkStock(
  productId: string,
  requestedQuantity: number = 1
): Promise<StockCheckResult> {
  const stock = await getProductStock(productId);
  
  if (!stock) {
    return {
      inStock: false,
      availableQuantity: 0,
      reservedQuantity: 0,
      isLowStock: false,
      error: "Failed to fetch stock information",
    };
  }

  const availableQuantity = stock.stock - (stock.reserved_stock || 0);
  const isLowStock = stock.stock <= (stock.low_stock_threshold || 10);
  const inStock = availableQuantity >= requestedQuantity;

  return {
    inStock,
    availableQuantity: Math.max(0, availableQuantity),
    reservedQuantity: stock.reserved_stock || 0,
    isLowStock,
  };
}

/**
 * Check stock for multiple items (cart validation)
 */
export async function checkBulkStock(
  items: Array<{ productId: string; quantity: number; name?: string }>
): Promise<BulkStockCheckResult> {
  const results: Array<{
    productId: string;
    requestedQuantity: number;
    availableQuantity: number;
    productName?: string;
  }> = [];

  const lowStockItems: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    threshold: number;
  }> = [];

  let allInStock = true;

  // Check each item's stock
  for (const item of items) {
    const stockCheck = await checkStock(item.productId, item.quantity);
    
    results.push({
      productId: item.productId,
      requestedQuantity: item.quantity,
      availableQuantity: stockCheck.availableQuantity,
      productName: item.name,
    });

    if (!stockCheck.inStock) {
      allInStock = false;
    }

    if (stockCheck.isLowStock) {
      lowStockItems.push({
        productId: item.productId,
        productName: item.name || item.productId,
        currentStock: stockCheck.availableQuantity + stockCheck.reservedQuantity,
        threshold: 10, // Default threshold
      });
    }
  }

  // Filter out items that are in stock
  const outOfStockItems = results.filter(
    (r) => r.availableQuantity < r.requestedQuantity
  );

  return {
    allInStock,
    outOfStockItems: outOfStockItems.map((item) => ({
      productId: item.productId,
      requestedQuantity: item.requestedQuantity,
      availableQuantity: item.availableQuantity,
    })),
    lowStockItems,
  };
}

/**
 * Reserve stock for an order (prevents double-booking)
 */
export async function reserveStock(
  productId: string,
  quantity: number,
  referenceId: string
): Promise<boolean> {
  try {
    const response = await fetch("/api/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
        movement_type: "out",
        reference_type: "order",
        reference_id: referenceId,
        notes: "Stock reserved for order",
      }),
    });

    if (!response.ok) {
      console.error("Failed to reserve stock:", await response.text());
      return false;
    }

    // Invalidate cache
    await cache.delete(`product_stock:${productId}`);
    
    return true;
  } catch (error) {
    console.error("Error reserving stock:", error);
    return false;
  }
}

/**
 * Release reserved stock (when order is cancelled)
 */
export async function releaseStock(
  productId: string,
  quantity: number,
  referenceId: string
): Promise<boolean> {
  try {
    const response = await fetch("/api/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
        movement_type: "return",
        reference_type: "order",
        reference_id: referenceId,
        notes: "Stock released due to order cancellation",
      }),
    });

    if (!response.ok) {
      console.error("Failed to release stock:", await response.text());
      return false;
    }

    // Invalidate cache
    await cache.delete(`product_stock:${productId}`);
    
    return true;
  } catch (error) {
    console.error("Error releasing stock:", error);
    return false;
  }
}

/**
 * Adjust stock manually (admin function)
 */
export async function adjustStock(
  productId: string,
  quantity: number,
  notes: string = ""
): Promise<boolean> {
  try {
    const response = await fetch("/api/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
        movement_type: "adjustment",
        notes: notes,
      }),
    });

    if (!response.ok) {
      console.error("Failed to adjust stock:", await response.text());
      return false;
    }

    // Invalidate cache
    await cache.delete(`product_stock:${productId}`);
    
    return true;
  } catch (error) {
    console.error("Error adjusting stock:", error);
    return false;
  }
}

/**
 * Get low stock alerts
 */
export async function getLowStockAlerts(): Promise<Array<{
  product_id: string;
  product_name: string;
  current_stock: number;
  low_stock_threshold: number;
  category: string;
}>> {
  try {
    const response = await fetch("/api/inventory?low_stock=true");
    if (!response.ok) {
      console.error("Failed to fetch low stock alerts");
      return [];
    }

    const data = await response.json();
    return data.alerts || [];
  } catch (error) {
    console.error("Error getting low stock alerts:", error);
    return [];
  }
}

/**
 * Format stock information for display
 */
export function formatStockStatus(
  stock: number,
  reserved: number = 0,
  threshold: number = 10
): {
  status: "in_stock" | "low_stock" | "out_of_stock";
  label: string;
  color: string;
} {
  const available = stock - reserved;
  
  if (available <= 0) {
    return {
      status: "out_of_stock",
      label: "نفذت الكمية",
      color: "bg-red-500",
    };
  }

  if (stock <= threshold) {
    return {
      status: "low_stock",
      label: `كمية قليلة (${available})`,
      color: "bg-yellow-500",
    };
  }

  return {
    status: "in_stock",
    label: `متوفر (${available})`,
    color: "bg-green-500",
  };
}
