"use client";

export default function ReceiptActions() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:-translate-y-1 hover:shadow-lg transition-all"
    >
      🖨️ طباعة الوصل
    </button>
  );
}
