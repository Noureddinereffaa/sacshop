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

async function initDiscounts() {
  const discountConfig = {
    newCustomerDiscountEnabled: true,
    newCustomerDiscountPercent: 10,
    newCustomerMinItems: 2
  };

  console.log("Initializing discount settings...");
  const { error } = await supabase.from('settings').upsert({ 
    key: 'discounts', 
    value: discountConfig 
  });

  if (error) console.error("Error:", error);
  else console.log("Discount settings initialized!");
}

initDiscounts();
