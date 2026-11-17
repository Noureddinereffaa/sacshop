# **تحقق من التحديثات**

## **📋 قائمة التحقق**

### **1. ملفات جديدة تم إنشاؤها**

- [ ] `src/lib/rateLimit.ts` - نظام تقييد الطلبات
- [ ] `src/lib/redis.ts` - عميل Redis للتخزين المؤقت
- [ ] `src/lib/inventory.ts` - مكتبات إدارة المخزون
- [ ] `src/app/api/inventory/route.ts` - API لإدارة المخزون
- [ ] `src/app/api/inventory/movements/route.ts` - API لحركات المخزون
- [ ] `src/app/admin/inventory/page.tsx` - صفحة إدارة المخزون
- [ ] `supabase/migrations/04_performance_indexes.sql` - هجرة قاعدة البيانات
- [ ] `CHANGES_SUMMARY.md` - ملخص التغييرات
- [ ] `VERIFICATION.md` - هذه الوثيقة

**الأمر للتحقق:**
```bash
ls -la src/lib/rateLimit.ts src/lib/redis.ts src/lib/inventory.ts \
  src/app/api/inventory/route.ts src/app/api/inventory/movements/route.ts \
  src/app/admin/inventory/page.tsx \
  supabase/migrations/04_performance_indexes.sql
```

---

### **2. ملفات معدلة**

- [ ] `src/app/api/admin-auth/route.ts` - تحسين حماية الكوكيز
- [ ] `src/app/api/customer/route.ts` - إضافة التخزين المؤقت
- [ ] `src/app/admin/layout.tsx` - إضافة رابط إدارة المخزون
- [ ] `src/types/index.ts` - إضافة أنواع المخزون
- [ ] `package.json` - إضافة التبعيات الجديدة

**الأمر للتحقق:**
```bash
git status --short
```

---

### **3. التبعيات الجديدة**

- [ ] `@upstash/ratelimit` - لتقييد الطلبات
- [ ] `@upstash/redis` - للتخزين المؤقت

**الأمر للتحقق:**
```bash
npm list @upstash/ratelimit @upstash/redis
```

---

## **🧪 اختبارات الوظائف**

### **1. اختبار تقييد الطلبات**

**اختبار تسجيل دخول الإدارة:**
```bash
# حاول تسجيل دخول أكثر من 5 مرات في الدقيقة
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/admin-auth \
    -H "Content-Type: application/json" \
    -d '{"password": "wrong"}'
done
```

**النتيجة المتوقعة:**
- أول 5 محاولات: رسالة خطأ "كلمة المرور غير صحيحة"
- المحاولة السادسة: رسالة خطأ "عدد محاولات تسجيل الدخول تجاوز الحد المسموح به" مع كود 429

---

### **2. اختبار التخزين المؤقت**

**اختبار تخزين بيانات العميل:**
```bash
# أول طلب (بدون تخزين مؤقت)
curl -X POST http://localhost:3000/api/customer \
  -H "Content-Type: application/json" \
  -d '{"phone": "213123456789"}'

# ثاني طلب (مع تخزين مؤقت)
curl -X POST http://localhost:3000/api/customer \
  -H "Content-Type: application/json" \
  -d '{"phone": "213123456789"}'
```

**النتيجة المتوقعة:**
- الأول: استجابة كاملة من قاعدة البيانات
- الثاني: استجابة أسرع (من التخزين المؤقت)

---

### **3. اختبار إدارة المخزون**

**اختبار استرجاع المخزون:**
```bash
curl http://localhost:3000/api/inventory?low_stock=true
```

**النتيجة المتوقعة:**
- قائمة المنتجات ذات المخزون المنخفض

**اختبار تعديل المخزون:**
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "your-product-id",
    "quantity": 10,
    "movement_type": "adjustment",
    "notes": "Test adjustment"
  }'
```

**النتيجة المتوقعة:**
- تأكيد تعديل المخزون

---

### **4. اختبار واجهة إدارة المخزون**

1. قم بتسجيل الدخول إلى لوحة التحكم (`/admin`)
2. انتقل إلى "إدارة المخزون" من القائمة الجانبية
3. تحقق من:
   - [ ] عرض إحصائيات المخزون
   - [ ] عرض قائمة المنتجات
   - [ ] تصفية المنتجات
   - [ ] البحث عن المنتجات
   - [ ] عرض حركات المخزون
   - [ ] إضافة/خصم الكمية يدويًا

---

## **🔍 التحقق من قاعدة البيانات**

### **1. التحقق من الفهارس**

**الاستعلام:**
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('products', 'orders', 'customers', 'vip_offers', 'short_links')
ORDER BY tablename, indexname;
```

**النتيجة المتوقعة:**
- يجب أن ترى جميع الفهارس المضافة في `04_performance_indexes.sql`

---

### **2. التحقق من الأعمدة الجديدة**

**الاستعلام:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('low_stock_threshold', 'reserved_stock', 'stock_updated_at', 'stock_history')
ORDER BY column_name;
```

**النتيجة المتوقعة:**
- يجب أن ترى جميع الأعمدة الجديدة

---

### **3. التحقق من جدول حركات المخزون**

**الاستعلام:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'stock_movements';
```

**النتيجة المتوقعة:**
- يجب أن يرى جدول `stock_movements`

**الاستعلام:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stock_movements'
ORDER BY ordinal_position;
```

**النتيجة المتوقعة:**
- يجب أن ترى جميع أعمدة جدول `stock_movements`

---

## **📊 التحقق من الأداء**

### **1. اختبار سرعة الاستجابة**

**قبل التحديث:**
```bash
# قياس وقت استجابة API
curl -o /dev/null -s -w "Time: %{time_total}s\n" \
  -X POST http://localhost:3000/api/customer \
  -H "Content-Type: application/json" \
  -d '{"phone": "213123456789"}'
```

**بعد التحديث:**
```bash
# قياس وقت استجابة API (مع التخزين المؤقت)
curl -o /dev/null -s -w "Time: %{time_total}s\n" \
  -X POST http://localhost:3000/api/customer \
  -H "Content-Type: application/json" \
  -d '{"phone": "213123456789"}'
```

**النتيجة المتوقعة:**
- وقت الاستجابة الثاني يجب أن يكون أسرع بنسبة 50-80%

---

## **🎯 قائمة الفحوصات النهائية**

| **الفحص** | **الحالة** | **ملاحظات** |
|-----------|-----------|-------------|
| جميع الملفات الجديدة موجودة | ☐ | |
| جميع الملفات المعدلة صحيحة | ☐ | |
| التبعيات الجديدة مثبتة | ☐ | |
| تقييد الطلبات يعمل | ☐ | |
| التخزين المؤقت يعمل | ☐ | |
| إدارة المخزون تعمل | ☐ | |
| الفهارس مضافة لقاعدة البيانات | ☐ | |
| الأعمدة الجديدة مضافة | ☐ | |
| جدول حركات المخزون موجود | ☐ | |
| واجهة إدارة المخزون تعمل | ☐ | |
| الأداء محسن | ☐ | |

---

## **📝 ملاحظات**

إذا واجهت أي مشكلات أثناء التحقق:

1. **مشكلات في التبعيات:**
   ```bash
   npm install
   ```

2. **مشكلات في قاعدة البيانات:**
   - تأكد من تطبيق جميع الهجرات
   - تأكد من اتصال Supabase

3. **مشكلات في التخزين المؤقت:**
   - تأكد من تعيين متغيرات البيئة
   - في التطوير، سيتم استخدام ذاكرة مؤقتة داخلية

4. **مشكلات في تقييد الطلبات:**
   - تأكد من تثبيت `@upstash/ratelimit`
   - في التطوير، سيتم استخدام ذاكرة مؤقتة داخلية

---

## **✅ تأكيد الانتهاء**

بعد إكمال جميع الفحوصات، يمكنك تأكيد أن:

- [ ] جميع التحديثات قد تم تطبيقها بنجاح
- [ ] النظام يعمل بشكل صحيح
- [ ] الأداء قد تحسن
- [ ] الأمن قد تعزز
- [ ] ميزة إدارة المخزون تعمل

**النظام جاهز للإنتاج!** 🎉
