"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";

const FACEBOOK_PAGE = "https://www.facebook.com/serviceserigraphie16";

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
  const [showPage, setShowPage] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isFacebook, setIsFacebook] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const fb = /FBAN|FBAV|Instagram|Mobile\/FB/i.test(ua);
    const android = /Android/i.test(ua);

    setIsFacebook(fb);
    setIsAndroid(android);

    if (fb && android) {
      const cleanUrl = destination.replace(/^https?:\/\//, "");
      const intentUrl = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(destination)};end`;
      try { window.location.href = intentUrl; } catch {}
      const timer = setTimeout(() => setShowPage(true), 2500);
      return () => clearTimeout(timer);
    }

    setShowPage(true);
  }, [destination]);

  if (!showPage && isFacebook && isAndroid) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: "linear-gradient(160deg, #00b4d8 0%, #0096c7 30%, #e6007e 70%, #ff6b6b 100%)" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white font-bold text-lg">جاري الفتح في المتصفح...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: "linear-gradient(160deg, #00b4d8 0%, #0096c7 20%, #e6007e 65%, #ff6b6b 100%)" }}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
      <div className="absolute top-10 right-10 w-20 h-20 bg-pink-400/20 rounded-full" />
      <div className="absolute top-20 right-32 w-3 h-3 bg-white/30 rounded-full" />
      <div className="absolute top-32 right-16 w-2 h-2 bg-yellow-300/40 rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full translate-y-1/3 -translate-x-1/3" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="text-center mb-6">
            {branding?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={branding.logo} alt={branding.storeName} className="h-20 w-auto mx-auto" />
            ) : (
              <>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-3xl font-black text-white tracking-tight">SERVICE</span>
                </div>
                <span className="text-sm font-bold text-white/70 tracking-[0.3em]">SERIGRAPHIE</span>
              </>
            )}
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

            {/* Product Image */}
            {productImage && !imgError && (
              <div className="relative w-full aspect-square bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={productImage.replace(/^http:\/\//, "https://")}
                  alt={productName}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                />
                {!imgLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>
            )}

            {/* Welcome */}
            <div className="pt-6 pb-2 px-6 text-center">
              <div className="text-4xl mb-2">👋</div>
              <h1 className="text-2xl font-black text-gray-900 mb-1">مرحباً بك!</h1>
              <div className="w-20 h-1 mx-auto bg-gradient-to-r from-yellow-400 via-primary to-pink-500 rounded-full mt-2" />
            </div>

            {/* Description */}
            <div className="px-6 py-3 text-center">
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                متصفح فيسبوك لا يدعم بعض الميزات.
                <br />
                لتجربة تسوق أفضل وأسرع، يرجى فتح الصفحة في متصفح هاتفك الأساسي.
              </p>
            </div>

            {/* Instructions */}
            <div className="mx-5 mb-5 bg-blue-50/80 rounded-2xl p-4 border border-blue-100/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span>
                <span className="text-blue-600 font-black text-sm">خطوة بسيطة:</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</span>
                  <span className="text-gray-700 text-sm font-medium">
                    اضغط على النقاط الثلاث
                    <span className="inline-block mx-1 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-black text-xs">•••</span>
                    في الأعلى.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">2</span>
                  <span className="text-gray-700 text-sm font-medium">
                    اختر <strong className="text-gray-900">&quot;فتح في المتصفح&quot;</strong>
                    <br />
                    <span className="text-gray-400 text-xs">(Open in Browser أو)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="px-5 pb-6 flex gap-3">
              {/* Return to Facebook Page */}
              <a
                href={FACEBOOK_PAGE}
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-4 px-3 rounded-2xl font-black text-sm transition-all active:scale-[0.97] shadow-lg shadow-blue-700/30 flex flex-col items-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="leading-tight">العودة إلى فيسبوك</span>
                <span className="text-blue-200 text-[10px] font-bold">متابعة صفحتنا</span>
              </a>

              {/* Go to Website */}
              <button
                onClick={() => {
                  if (isAndroid) {
                    const cleanUrl = destination.replace(/^https?:\/\//, "");
                    try {
                      window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(destination)};end`;
                    } catch {
                      window.open(destination, "_blank");
                    }
                  } else {
                    window.open(destination, "_blank", "noopener,noreferrer");
                  }
                }}
                className="flex-1 bg-gradient-to-b from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white py-4 px-3 rounded-2xl font-black text-sm transition-all active:scale-[0.97] shadow-lg shadow-cyan-500/30 flex flex-col items-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span className="leading-tight">الذهاب إلى الموقع</span>
                <span className="text-cyan-100 text-[10px] font-bold">فتح في المتصفح الآن</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
