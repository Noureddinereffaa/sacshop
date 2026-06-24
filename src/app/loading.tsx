"use client";

// Instant skeleton screen - shows immediately while page loads
export default function Loading() {
  return (
    <main className="min-h-screen animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[560px] md:h-[680px] bg-gray-200" />
      
      {/* Features skeleton */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-8 rounded-3xl bg-gray-100 h-48" />
            ))}
          </div>
        </div>
      </div>

      {/* Products skeleton */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="h-10 bg-gray-200 rounded-xl w-64 mb-16 mr-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] p-5 h-96">
                <div className="aspect-[4/5] bg-gray-100 rounded-[2rem] mb-6" />
                <div className="h-6 bg-gray-100 rounded-xl w-3/4 mb-4" />
                <div className="h-12 bg-gray-100 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
