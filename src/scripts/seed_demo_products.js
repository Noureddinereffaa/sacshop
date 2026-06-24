const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    let value = parts.slice(1).join('=').trim();
    if (value.startsWith('"')) value = value.slice(1, -1);
    env[key] = value;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

async function seedProducts() {
  const products = [
    {
      name: "أكياس تسوق ورقية فاخرة",
      description: "أكياس ورقية عالية الجودة قابلة للتخصيص بشعارك الخاص.",
      price: 1500,
      image_url: "https://images.unsplash.com/photo-1544816153-36c74d422149?q=80&w=1000&auto=format&fit=crop",
      category: "bags",
      is_published: true,
      stock: 100
    },
    {
      name: "بطاقة عمل (Business Cards)",
      description: "بطاقات عمل احترافية مع خيارات طباعة فاخرة.",
      price: 2500,
      image_url: "https://images.unsplash.com/photo-1589118949245-7d38baf380d6?q=80&w=1000&auto=format&fit=crop",
      category: "cards",
      is_published: true,
      stock: 500
    },
    {
      name: "مطبوعات دعائية (Flyers)",
      description: "فلايرز ومطويات دعائية بجودة طباعة استثنائية.",
      price: 3500,
      image_url: "https://images.unsplash.com/photo-1533750516457-a7f992034fce?q=80&w=1000&auto=format&fit=crop",
      category: "prints",
      is_published: true,
      stock: 200
    },
    {
      name: "ملصقات لاصقة (Stickers)",
      description: "ستيكرز لاصقة بجميع الأحجام والأشكال لشعارك.",
      price: 1200,
      image_url: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1000&auto=format&fit=crop",
      category: "stickers",
      is_published: true,
      stock: 1000
    }
  ];

  console.log("Seeding demo products...");
  for (const product of products) {
    const { error } = await supabase.from('products').insert(product);
    if (error) console.error(`Error inserting ${product.name}:`, error);
  }
  console.log("Seeding finished!");
}

seedProducts();
