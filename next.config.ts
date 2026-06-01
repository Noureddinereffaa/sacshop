import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gzip compression for all responses
  compress: true,
  // Remove X-Powered-By header (security + smaller response)
  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    // Optimized for Algerian mobile users (most traffic is mobile)
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Cache optimized images for 1 year (they have unique URLs)
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
      {
        protocol: "http",
        hostname: "195.201.119.89",
      },
      {
        protocol: "http",
        hostname: "**.sslip.io",
      },
      {
        protocol: "https",
        hostname: "**.sslip.io",
      },
      {
        protocol: "https",
        hostname: "195.201.119.89",
      },
      {
        protocol: "http",
        hostname: "**.serviceserigraphie.com",
      },
      {
        protocol: "https",
        hostname: "**.serviceserigraphie.com",
      },
    ],
  },

  // Security & caching headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Cache static assets aggressively (JS, CSS, fonts, images)
        source: '/:path(.+\\.(?:js|css|woff2?|png|jpg|jpeg|gif|svg|ico|webp|avif)$)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  allowedDevOrigins: ["192.168.1.2"],
};

export default nextConfig;

