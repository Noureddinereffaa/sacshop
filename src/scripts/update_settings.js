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

async function updateBranding() {
  const branding = {
    storeName: "Service Serigraphie",
    logo: "/logo.jpg",
    primaryColor: "#00aeef",
    secondaryColor: "#f4f4f4",
    whatsappNumber: "213557585066" 
  };

  const navigation = [
    { label: "أكياس تسوق", href: "/products?category=bags" },
    { label: "بطاقة معلومات", href: "/products?category=cards" },
    { label: "مطبوعات", href: "/products?category=prints" },
    { label: "ملصقات", href: "/products?category=stickers" }
  ];

  console.log("Updating branding to exact Cyan...");
  await supabase.from('settings').upsert({ key: 'branding', value: branding });
  await supabase.from('settings').upsert({ key: 'navigation', value: navigation });

  console.log("Final Settings updated successfully!");
}

updateBranding();
