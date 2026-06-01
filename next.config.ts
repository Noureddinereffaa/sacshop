import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
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
  allowedDevOrigins: ["192.168.1.2"],
};

export default nextConfig;
