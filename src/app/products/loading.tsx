"use client";

export default function ProductsLoading() {
  return (
    <main className="min-h-screen bg-gray-50/50 pt-8 animate-pulse">
      <div className="container mx-auto px-4 py-10">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <div className="h-10 bg-gray-200 rounded-xl w-48 mb-4" />
            <div className="h-6 bg-gray-200 rounded-xl w-72" />
          </div>
        </div>
        
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] p-5">
              <div className="aspect-[4/5] bg-gray-100 rounded-[2rem] mb-6" />
              <div className="px-2 pt-2">
                <div className="h-6 bg-gray-100 rounded-xl w-3/4 mb-4" />
                <div className="h-14 bg-gray-100 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
