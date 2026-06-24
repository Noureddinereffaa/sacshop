"use client";

import { useState } from "react";
import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  style?: React.CSSProperties;
  onClick?: () => void;
  onError?: () => void;
}

/**
 * High-performance image component powered by Next.js Image Optimizer.
 * Uses native WebP/AVIF generation, edge caching, and a smooth fade-in animation.
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  fill = false,
  sizes,
  priority = false,
  quality = 80,
  style,
  onClick,
  onError,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Build the direct URL
  let imgSrc = src || "";

  // Fallback placeholder for broken images
  if (error || !imgSrc) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center text-gray-400 ${className}`}
        style={{
          width: fill ? "100%" : width,
          height: fill ? "100%" : height,
          ...(fill ? { position: "absolute", inset: 0 } : {}),
          ...style,
        }}
        onClick={onClick}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  const containerStyle: React.CSSProperties = fill
    ? { position: "absolute", inset: 0, ...style }
    : { width, height, position: "relative", ...style };

  // Next.js Image requires width/height if fill is false
  const imgWidth = fill ? undefined : (width || 800);
  const imgHeight = fill ? undefined : (height || 800);

  return (
    <div
      className={`overflow-hidden ${fill ? "" : "relative inline-block"} ${className}`}
      style={containerStyle}
      onClick={onClick}
    >
      {/* Skeleton placeholder (shown until image loads) */}
      {!loaded && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse"
          style={{ zIndex: 1 }}
        />
      )}

      {/* Actual image */}
      <Image
        src={imgSrc}
        alt={alt || ""}
        width={imgWidth}
        height={imgHeight}
        fill={fill}
        sizes={sizes || (fill ? "100vw" : undefined)}
        priority={priority}
        quality={quality}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          onError?.();
        }}
        className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{
          objectFit: "cover",
          ...(fill ? {} : { width: "100%", height: "100%" })
        }}
      />
    </div>
  );
}
