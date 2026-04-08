import Link from "next/link";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-right">
        {/* Info */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              SacShop <span className="text-primary">.dz</span>
            </span>
          </Link>
          <p className="text-gray-400 leading-relaxed max-w-xs">
            أفضل وجهة للأكياس الورقية والقماشية في الجزائر. نؤمن بالجودة، السرعة، والتحول الرقمي للتجارة. 
          </p>
          <div className="flex items-center gap-4">
             <a href="#" className="p-2 bg-gray-900 hover:bg-primary transition-colors rounded-lg"><Facebook size={20} /></a>
             <a href="#" className="p-2 bg-gray-900 hover:bg-primary transition-colors rounded-lg"><Instagram size={20} /></a>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-6">
          <h3 className="font-bold text-white text-lg">روابط سريعة</h3>
          <ul className="space-y-3">
             <li><Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link></li>
             <li><Link href="/products" className="hover:text-primary transition-colors">المنتجات</Link></li>
             <li><Link href="/track" className="hover:text-primary transition-colors">تتبع الطلب</Link></li>
             <li><Link href="/about" className="hover:text-primary transition-colors">من نحن</Link></li>
          </ul>
        </div>

        {/* Policy */}
        <div className="space-y-6">
          <h3 className="font-bold text-white text-lg">الشروط والقوانين</h3>
          <ul className="space-y-3">
             <li><Link href="/terms" className="hover:text-primary transition-colors">شروط الاستخدام</Link></li>
             <li><Link href="/privacy" className="hover:text-primary transition-colors">سياسة الخصوصية</Link></li>
             <li><Link href="/shipping" className="hover:text-primary transition-colors">سياسة التوصيل</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-6">
          <h3 className="font-bold text-white text-lg">تواصل معنا</h3>
          <ul className="space-y-4">
             <li className="flex items-start gap-3 justify-end group cursor-pointer">
                <span className="text-gray-400 group-hover:text-primary text-sm">الجزائر العاصمة، بئر مراد رايس</span>
                <MapPin className="text-primary" size={20} />
             </li>
             <li className="flex items-center gap-3 justify-end group cursor-pointer">
                <span className="text-gray-400 group-hover:text-primary text-sm">+213 (0) 5XX XX XX XX</span>
                <Phone className="text-primary" size={20} />
             </li>
             <li className="flex items-center gap-3 justify-end group cursor-pointer">
                <span className="text-gray-400 group-hover:text-primary text-sm">support@sacshop.dz</span>
                <Mail className="text-primary" size={20} />
             </li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-gray-900 text-center text-sm text-gray-500">
         <p>© {new Date().getFullYear()} SacShop الجزائر. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}
