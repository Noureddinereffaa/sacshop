"use client";

import { useEffect, useState, useRef } from "react";
import { Globe, ArrowRight, Smartphone, ExternalLink } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";

interface GoToSiteProps {
  slug: string;
  productName: string;
  productImage: string | null;
  destination: string;
}

export default function GoToSiteClient({
  slug,
  productName,
  productImage,
  destination,
}: GoToSiteProps) {
  const { branding } = useSettingsStore();
  const [isFacebook, setIsFacebook] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [breakoutAttempted, setBreakoutAttempted] = useState(false);
  const hasAutoBroken = useRef(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const fb = /FBAN|FBAV|Instagram|Mobile\/FB/i.test(ua);
    const android = /Android/i.test(ua);
    const ios = /iPhone|iPad|iPod/i.test(ua);

    setIsFacebook(fb);
    setIsAndroid(android);
    setIsIOS(ios);

    // Auto breakout on Android when in Facebook
    if (fb && android && !hasAutoBroken.current) {
      hasAutoBroken.current = true;
      // Try to open in external browser
      const cleanUrl = destination.replace(/^https?:\/\//, "");
      const intentUrl = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
      
      // Attempt breakout, show instructions if it fails
      try {
        window.location.href = intentUrl;
      } catch {
        setShowInstructions(true);
      }
      
      // If still on page after 3s, show fallback
      setTimeout(() => {
        setBreakoutAttempted(true);
        setShowInstructions(true);
      }, 3000);
    }

    // iOS: show instructions immediately
    if (fb && ios) {
      setShowInstructions(true);
    }
  }, [destination]);

  // Handle "Go to Website" click - try to break out of WebView
  function handleGoToSite(e: React.MouseEvent) {
    e.preventDefault();

    if (isAndroid) {
      // Android: try Chrome intent first
      const cleanUrl = destination.replace(/^https?:\/\//, "");
      try {
        window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(destination)};end`;
      } catch {
        // Fallback: open in new window
        window.open(destination, "_blank");
      }
    } else if (isFacebook) {
      // iOS/other FB: try window.open which may break out
      window.open(destination, "_blank", "noopener,noreferrer");
    } else {
      // Normal browser: just navigate
      window.location.href = destination;
    }
  }

  // Handle "Return to Facebook"
  function handleReturnToFacebook() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback: go to Facebook mobile
      window.location.href = "https://m.facebook.com";
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 30%, #f0fdf4 70%, #fefce8 100%)",
      }}
    >
      {/* Decorative background circles */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/5 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-black/5 border border-white/60 overflow-hidden">
          {/* Logo Header */}
          <div className="flex flex-col items-center pt-8 pb-4 px-6">
            {branding?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={branding.logo}
                alt={branding.storeName}
                className="h-16 w-auto object-contain mb-2"
              />
            ) : (
              <div className="flex flex-col items-center mb-2">
                <span className="text-2xl font-black text-primary tracking-tight">
                  {branding?.storeName || "SERVICE"}
                </span>
                <span className="text-sm font-bold text-gray-400 -mt-1 tracking-widest">
                  SERIGRAPHIE
                </span>
              </div>
            )}
          </div>

          {/* Product Image */}
          <div className="px-6">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100">
              {productImage && !imageError ? (
                <>
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={productImage}
                    alt={productName}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-3">
                  <Smartphone size={48} strokeWidth={1.5} />
                  <span className="text-sm font-bold text-gray-400">{productName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Name */}
          <div className="px-6 pt-5 pb-2 text-center">
            <h1 className="text-xl font-black text-gray-900 leading-snug line-clamp-2">
              {productName}
            </h1>
          </div>

          {/* Buttons */}
          <div className="px-6 pb-6 pt-2 space-y-3">
            {/* Primary: Go to Website */}
            <button
              onClick={handleGoToSite}
              className="flex items-center justify-center gap-3 w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black text-lg transition-all active:scale-[0.97] shadow-lg shadow-primary/25"
            >
              <Globe size={22} />
              <span>الذهاب إلى الموقع</span>
              <ExternalLink size={18} />
            </button>

            {/* Secondary: Return to Facebook */}
            <button
              onClick={handleReturnToFacebook}
              className="flex items-center justify-center gap-3 w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-black text-base transition-all active:scale-[0.97]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>العودة إلى فيسبوك</span>
            </button>

            {/* Instructions for Facebook users */}
            {isFacebook && showInstructions && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2">
                <p className="text-amber-800 text-sm font-bold text-center leading-relaxed mb-3">
                  للمتابعة في المتصفح الأساسي:
                </p>
                <ol className="text-amber-800 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-amber-200 text-amber-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">1</span>
                    <span>اضغط على النقاط الثلاث
                      <span className="inline-block mx-1 bg-amber-200/60 px-2 py-0.5 rounded-md font-black">•••</span>
                      في الأعلى
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-amber-200 text-amber-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">2</span>
                    <span>اختر <strong className="text-amber-900">&quot;فتح في المتصفح&quot;</strong></span>
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6 font-bold">
          {branding?.storeName || "Service Serigraphie"} &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
