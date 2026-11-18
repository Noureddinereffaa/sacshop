# Sacshop — متجر الدفع عند الاستلام

متجر إلكتروني (COD) للطباعة والأكياس المخصصة، مبني على Next.js 16 (App Router) و Supabase و Tailwind CSS v4 و TypeScript.

## البنية

```
src/
  app/                صفحات App Router + API Routes
    api/              نقاط النهاية (طلب خارجي: /api/customer, /api/short-links/[slug] — إدارية: /api/products, /api/coupons ...)
    admin/            لوحة التحكم (/admin/*)
  components/
    layout/           مكونات الهيكل العام (Header, Footer, GlobalNavigation, OfferPopup ...)
    home/             مكونات الصفحة الرئيسية
    product/          بطاقة المنتج والإضافة السريعة
    checkout/         سلة المشتريات ونموذج الطلب
    (الجذر)           OptimizedImage, Reveal, SettingsProvider, ImageUploader
  hooks/              React hooks (useReveal)
  lib/                عملاء Supabase، المصادقة الإدارية، rate limiting، أدوات مشتركة
  store/              Zustand stores مع persist (سلة، إعدادات)
supabase/migrations/  مخططات قاعدة البيانات (تُضاف يدوياً: git add -f *.sql)
scripts/              سكربتات الاختبار والصيانة
```

## المتغيرات البيئية

| المتغير | الوصف |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | رابط مشروع Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | مفتاح anon (الواجهة العامة) |
| `SUPABASE_SERVICE_ROLE_KEY` | مفتاح الخدمة (API الإدارية فقط — لا يُكشف للعميل) |
| `NEXT_PUBLIC_SITE_URL` | نطاق الموقع (افتراضي: serviceserigraphie.com) — استخدم `SITE_URL` من `@/lib/siteUrl` |
| `ADMIN_SESSION_SECRET` | سر توقيع جلسة الإدارة (HMAC) |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | تحديد معدل الطلبات |

## التشغيل

```bash
npm install
npm run dev        # التطوير
npm run build      # بناء الإنتاج
npx tsc --noEmit   # فحص الأنواع
npm run test:coupons   # اختبارات الكوبونات (بعد ضبط env حية)
```

## قواعد المشروع

- لا تنشئ عملاء Supabase على مستوى الوحدة (module-level `createClient`) — استخدم `getSupabaseAdmin()` / `getSupabaseAdminSafe()` من `@/lib/supabaseAdmin`.
- الوصول الإداري لقاعدة البيانات يتم عبر API Routes مع `requireAdmin()` (كوكي `admin_session` موقّع بـ HMAC) — وليس عبر عميل anon من المتصفح.
- نطاق الموقع دائماً من `@/lib/siteUrl` — لا تكرّر النطاق المضمّن.
- مضيفات الصور الخارجية يجب إضافتها يدوياً إلى قائمة السماح في `next.config.ts`.
- نصوص الواجهة بالعربية، والعملة `د.ج`.
