"use client";

import { useState, useRef, useEffect } from "react";

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
 * High-performance image component that bypasses Next.js Image Optimizer
 * for external Supabase Storage images. Uses native lazy loading,
 * CSS object-fit, and a smooth fade-in animation for a premium feel.
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
  quality,
  style,
  onClick,
  onError,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // If the image is already cached by the browser, mark as loaded immediately
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  const handleLoad = () => setLoaded(true);
  const handleError = () => {
    setError(true);
    onError?.();
  };

  // Build the direct URL (bypass Next.js optimizer)
  // For Supabase storage URLs, ensure we use the URL as-is
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
    : { width, height, ...style };

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
      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes}
        className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{
          objectFit: "cover",
          width: fill ? "100%" : undefined,
          height: fill ? "100%" : undefined,
          position: fill ? "absolute" : undefined,
          inset: fill ? 0 : undefined,
        }}
      />
    </div>
  );
}
