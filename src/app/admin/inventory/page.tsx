"use client";

import { useState, useEffect } from "react";
import { Package, AlertTriangle, Plus, Minus, RefreshCcw, Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductInventory {
  id: string;
  name: string;
  category: string;
  stock: number;
  reserved_stock: number;
  low_stock_threshold: number;
}

interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  movement_type: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_type: string;
  reference_id: string;
  notes: string;
  created_at: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductInventory | null>(null);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [adjustmentModal, setAdjustmentModal] = useState<{ product: ProductInventory; type: 'add' | 'remove' } | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(1);
  const [adjustmentNotes, setAdjustmentNotes] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = new URL("/api/inventory", window.location.origin);
      if (lowStockOnly) {
        url.searchParams.append("low_stock", "true");
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error("Failed to fetch inventory data");
      }
      
      const data = await response.json();
      setInventory(data.products || []);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stock movements for a product
  const fetchStockMovements = async (productId: string) => {
    try {
      setMovementsLoading(true);
      const response = await fetch(`/api/inventory/movements?product_id=${productId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch stock movements");
      }
      
      const data = await response.json();
      setStockMovements(data.movements || []);
    } catch (err) {
      console.error("Error fetching stock movements:", err);
    } finally {
      setMovementsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [lowStockOnly]);

  useEffect(() => {
    if (selectedProduct) {
      fetchStockMovements(selectedProduct.id);
    }
  }, [selectedProduct]);

  // Filter inventory based on search query
  const filteredInventory = inventory.filter((product) => {
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Calculate statistics
  const totalProducts = inventory.length;
  const totalStock = inventory.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = inventory.filter((p) => p.stock <= (p.low_stock_threshold || 10)).length;
  const outOfStockCount = inventory.filter((p) => p.stock <= 0).length;

  // Handle stock adjustment
  const handleAdjustStock = async () => {
    if (!adjustmentModal || !adjustmentQuantity) return;
    
    setIsAdjusting(true);
    
    try {
      const { product, type } = adjustmentModal;
      const quantity = type === 'add' ? adjustmentQuantity : -adjustmentQuantity;
      
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity,
          movement_type: "adjustment",
          notes: adjustmentNotes || `Manual adjustment: ${type === 'add' ? 'Added' : 'Removed'} ${adjustmentQuantity} units`,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to adjust stock");
      }
      
      // Refresh inventory
      await fetchInventory();
      
      // Close modal
      setAdjustmentModal(null);
      setAdjustmentQuantity(1);
      setAdjustmentNotes("");
      
    } catch (err) {
      console.error("Error adjusting stock:", err);
      alert("Failed to adjust stock. Please try again.");
    } finally {
      setIsAdjusting(false);
    }
  };

  // Toggle expanded row
  const toggleRow = (productId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
      // If expanding, set as selected product to show movements
      const product = inventory.find((p) => p.id === productId);
      if (product) {
        setSelectedProduct(product);
      }
    }
    setExpandedRows(newExpanded);
  };

  // Get available stock (stock - reserved)
  const getAvailableStock = (product: ProductInventory) => {
    return product.stock - (product.reserved_stock || 0);
  };

  // Get stock status
  const getStockStatus = (product: ProductInventory) => {
    const available = getAvailableStock(product);
    const threshold = product.low_stock_threshold || 10;
    
    if (available <= 0) {
      return { label: "نفذت الكمية", color: "bg-red-500" };
    }
    if (product.stock <= threshold) {
      return { label: `كمية قليلة (${available})`, color: "bg-yellow-500" };
    }
    return { label: `متوفر (${available})`, color: "bg-green-500" };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Package size={28} />
            إدارة المخزون
          </h1>
          <p className="text-gray-500 mt-1">
            تتبع كميات المنتجات وإدارة المخزون
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
          >
            <RefreshCcw size={18} className="animate-spin" />
            تحديث
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
              <Package size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">{totalProducts}</p>
          <p className="text-gray-500 text-sm">إجمالي المنتجات</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white">
              <Package size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">{totalStock}</p>
          <p className="text-gray-500 text-sm">إجمالي الكمية</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-yellow-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-white">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-yellow-600">{lowStockCount}</p>
          <p className="text-yellow-600 text-sm">كمية قليلة</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-red-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-red-500">{outOfStockCount}</p>
          <p className="text-red-500 text-sm">نفذت الكمية</p>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="بحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 outline-none font-bold"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-sm font-bold text-gray-700">
                عرض المنتجات ذات الكمية القليله فقط
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-500" />
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={24} className="text-primary" />
            </div>
            <p className="text-gray-500 font-bold">جاري تحميل البيانات...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-bold">لا توجد منتجات</p>
          </div>
        ) : (
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black tracking-widest uppercase border-b border-gray-100">
                <th className="px-6 py-5 rounded-tr-2xl">المنتج</th>
                <th className="px-6 py-5">الفئة</th>
                <th className="px-6 py-5">الكمية المتاحة</th>
                <th className="px-6 py-5">المحجوزة</th>
                <th className="px-6 py-5">إجمالي الكمية</th>
                <th className="px-6 py-5">الحالة</th>
                <th className="px-6 py-5 rounded-tl-2xl">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInventory.map((product, index) => {
                const available = getAvailableStock(product);
                const status = getStockStatus(product);
                const isExpanded = expandedRows.has(product.id);

                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{product.name}</div>
                      <div className="text-gray-400 text-xs mt-1">{product.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-bold">{product.category}</td>
                    <td className="px-6 py-4 font-black text-gray-900">{available}</td>
                    <td className="px-6 py-4 text-gray-500 font-bold">{product.reserved_stock || 0}</td>
                    <td className="px-6 py-4 font-black text-gray-900">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm ${status.color} text-white`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRow(product.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="عرض حركات المخزون"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <button
                          onClick={() => setAdjustmentModal({ product, type: 'add' })}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="إضافة كمية"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => setAdjustmentModal({ product, type: 'remove' })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="خصم كمية"
                        >
                          <Minus size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Stock Movements Section (for selected product) */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronUp size={20} />
                </button>
                <h2 className="text-xl font-black text-gray-900">
                  حركات مخزون: {selectedProduct.name}
                </h2>
              </div>

              {movementsLoading ? (
                <div className="p-8 text-center text-gray-400">
                  <div className="animate-spin w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <RefreshCcw size={16} className="text-primary" />
                  </div>
                  <p className="text-sm">جاري تحميل حركات المخزون...</p>
                </div>
              ) : stockMovements.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p className="text-sm">لا توجد حركات مخزون مسجلة</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead>
                      <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black tracking-widest uppercase border-b border-gray-100">
                        <th className="px-4 py-3">النوع</th>
                        <th className="px-4 py-3">الكمية</th>
                        <th className="px-4 py-3">من</th>
                        <th className="px-4 py-3">إلى</th>
                        <th className="px-4 py-3">المرجع</th>
                        <th className="px-4 py-3">الملاحظات</th>
                        <th className="px-4 py-3">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {stockMovements.map((movement, index) => (
                        <motion.tr
                          key={movement.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                        >
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black ${
                              movement.movement_type === 'in' ? 'bg-green-100 text-green-700' :
                              movement.movement_type === 'out' ? 'bg-red-100 text-red-700' :
                              movement.movement_type === 'adjustment' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {movement.movement_type === 'in' && 'إضافة'}
                              {movement.movement_type === 'out' && 'خصم'}
                              {movement.movement_type === 'adjustment' && 'تعديل'}
                              {movement.movement_type === 'return' && 'إرجاع'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-black text-gray-900">
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{movement.previous_stock}</td>
                          <td className="px-4 py-3 font-bold text-gray-900">{movement.new_stock}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {movement.reference_type}: {movement.reference_id?.slice(0, 8)}...
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-[200px]">
                            {movement.notes || '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {new Date(movement.created_at).toLocaleDateString('ar-DZ', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Adjustment Modal */}
      <AnimatePresence>
        {adjustmentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">
                  {adjustmentModal.type === 'add' ? 'إضافة كمية' : 'خصم كمية'}
                </h2>
                <button
                  onClick={() => {
                    setAdjustmentModal(null);
                    setAdjustmentQuantity(1);
                    setAdjustmentNotes("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <span className="text-2xl text-gray-400">&times;</span>
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    المنتج
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="font-bold text-gray-900">{adjustmentModal.product.name}</p>
                    <p className="text-gray-500 text-sm">
                      الكمية الحالية: {adjustmentModal.product.stock}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الكمية
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdjustmentQuantity(Math.max(1, adjustmentQuantity - 1))}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <input
                      type="number"
                      value={adjustmentQuantity}
                      onChange={(e) => setAdjustmentQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-center font-black text-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <button
                      onClick={() => setAdjustmentQuantity(adjustmentQuantity + 1)}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ملاحظات (اختياري)
                  </label>
                  <textarea
                    value={adjustmentNotes}
                    onChange={(e) => setAdjustmentNotes(e.target.value)}
                    placeholder="أضف ملاحظة حول هذا التعديل..."
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    setAdjustmentModal(null);
                    setAdjustmentQuantity(1);
                    setAdjustmentNotes("");
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAdjustStock}
                  disabled={isAdjusting}
                  className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isAdjusting ? (
                    <>
                      <div className="animate-spin w-5 h-5 bg-white/30 rounded-full" />
                      جاري المعالجة...
                    </>
                  ) : (
                    `تأكيد ${adjustmentModal.type === 'add' ? 'الإضافة' : 'الخصم'}`
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
