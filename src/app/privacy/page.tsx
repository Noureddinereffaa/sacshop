

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-transparent pt-12">
      <div className="container mx-auto px-4 py-24 max-w-4xl text-right">
        <h1 className="text-4xl font-black text-gray-900 mb-12">سياسة الخصوصية</h1>
        
        <div className="space-y-8 text-gray-600 leading-relaxed text-lg">
          <section>
             <h2 className="text-2xl font-bold text-gray-900 mb-4">1. مقدمة</h2>
             <p>نحن في Service Serigraphie نولي أهمية كبرى لخصوصية بياناتكم. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتكم عند استخدام موقعنا.</p>
          </section>

          <section>
             <h2 className="text-2xl font-bold text-gray-900 mb-4">2. المعلومات التي نجمعها</h2>
             <p>نجمع المعلومات الضرورية فقط لإتمام عملية الطلب والتوصيل، والتي تشمل: الاسم الكامل، رقم الهاتف، العنوان، والبريد الإلكتروني.</p>
          </section>

          <section>
             <h2 className="text-2xl font-bold text-gray-900 mb-4">3. استخدام المعلومات</h2>
             <p>تستخدم معلوماتكم حصرياً للأغراض التالية:</p>
             <ul className="list-disc pr-6 mt-4 space-y-2">
                <li>تأكيد وشحن الطلبات.</li>
                <li>توفير تحديثات حول حالة الطلب.</li>
                <li>تحسين تجربة المستخدم على الموقع.</li>
                <li>التواصل معكم في حال وجود استفسارات حول طلبكم.</li>
             </ul>
          </section>

          <section>
             <h2 className="text-2xl font-bold text-gray-900 mb-4">4. حماية البيانات</h2>
             <p>نلتزم بحماية بياناتكم من الوصول غير المصرح به باستخدام بروتوكولات حماية متطورة. لا نقوم ببيع أو مشاركة بياناتكم مع أي أطراف ثالثة إلا لغرض التوصيل.</p>
          </section>

          <section>
             <h2 className="text-2xl font-bold text-gray-900 mb-4">5. التوافق القانوني</h2>
             <p>تخضع هذه السياسة للقوانين الجزائرية المتعلقة بالتجارة الإلكترونية وحماية المعطيات ذات الطابع الشخصي.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
