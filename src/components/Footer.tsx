"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import Image from "next/image";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const { branding } = useSettingsStore();

  if (pathname?.startsWith("/admin")) return null;

  const footerLogoSrc = branding.footerLogo || branding.logo || "/brand/logo-mark.png";
  const waNumber = branding.whatsappNumber?.replace(/[^0-9]/g, "") || "213";

  return (
    <footer className="bg-gray-950 text-gray-300 py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-right">

        {/* Brand Info */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-36 h-10 overflow-hidden">
              <Image
                src={footerLogoSrc}
                alt={branding.storeName}
                fill
                className="object-contain object-right"
                sizes="144px"
              />
            </div>
          </Link>
          <p className="text-gray-400 leading-relaxed max-w-xs text-sm">
            {branding.storeName} — شريككم الموثوق في خدمات الطباعة والسرغرافية الاحترافية في الجزائر.
          </p>
          <div className="flex items-center gap-3">
            <a
              href={branding.facebookUrl && branding.facebookUrl !== "#" ? branding.facebookUrl : "#"}
              target="_blank"
              rel="noopener"
              className="p-2 bg-gray-900 hover:bg-primary transition-colors rounded-lg"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href={branding.instagramUrl && branding.instagramUrl !== "#" ? branding.instagramUrl : "#"}
              target="_blank"
              rel="noopener"
              className="p-2 bg-gray-900 hover:bg-primary transition-colors rounded-lg"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h3 className="font-bold text-white text-lg">روابط سريعة</h3>
          <ul className="space-y-3">
            <li><Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link></li>
            <li><Link href="/products" className="hover:text-primary transition-colors">كل الخدمات</Link></li>
            <li><Link href="/track" className="hover:text-primary transition-colors">تتبع حالة طلبي</Link></li>
            <li><Link href="/about" className="hover:text-primary transition-colors">من نحن</Link></li>
            <li><Link href="/account" className="hover:text-primary transition-colors">حسابي</Link></li>
          </ul>
        </div>

        {/* Policy */}
        <div className="space-y-6">
          <h3 className="font-bold text-white text-lg">الشروط والقوانين</h3>
          <ul className="space-y-3">
            <li><Link href="/terms" className="hover:text-primary transition-colors">شروط الاستخدام</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors">سياسة الخصوصية</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-6">
          <h3 className="font-bold text-white text-lg">تواصل معنا</h3>
          <ul className="space-y-4">
            {branding.address && (
              <li className="flex items-start gap-3 justify-end group">
                <span className="text-gray-400 group-hover:text-primary text-sm transition-colors">{branding.address}</span>
                <MapPin className="text-primary shrink-0" size={20} />
              </li>
            )}
            <li className="flex items-center gap-3 justify-end group">
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener"
                className="text-gray-400 group-hover:text-primary text-sm transition-colors"
                dir="ltr"
              >
                {branding.whatsappNumber}
              </a>
              <Phone className="text-primary shrink-0" size={20} />
            </li>
            {branding.contactEmail && (
              <li className="flex items-center gap-3 justify-end group">
                <span className="text-gray-400 group-hover:text-primary text-sm break-all transition-colors">
                  {branding.contactEmail}
                </span>
                <Mail className="text-primary shrink-0" size={20} />
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-gray-900 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} {branding.storeName} الجزائر. جميع الحقوق محفوظة.</p>
        <p className="mt-3 text-[10px] text-gray-700 font-bold tracking-widest uppercase">
           by <a href="https://wa.me/213557585066" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">noureddine reffaa</a>
        </p>
      </div>
    </footer>
  );
}
