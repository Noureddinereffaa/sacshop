"use client";

export default function ProductDetailLoading() {
  return (
    <main className="min-h-screen bg-transparent animate-pulse">
      <div className="pt-8">
        {/* Breadcrumb skeleton */}
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-3">
            <div className="h-4 bg-gray-100 rounded w-48" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Image skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-[2.5rem]" />
              <div className="flex gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-100 rounded-2xl shrink-0" />
                ))}
              </div>
            </div>

            {/* Info skeleton */}
            <div className="space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 space-y-6">
                <div className="h-5 bg-gray-100 rounded-full w-24" />
                <div className="h-10 bg-gray-100 rounded-xl w-3/4" />
                <div className="h-6 bg-gray-100 rounded-xl w-1/2" />
                <div className="h-14 bg-gray-100 rounded-2xl w-48" />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-xl w-24" />
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 h-48" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
