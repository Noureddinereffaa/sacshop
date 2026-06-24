
const { createClient } = require('@supabase/supabase-js');
const env = process.env;

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'http://supabasekong-x11r5k1z2xfuwwrv4ez3mjcl.195.201.119.89.sslip.io';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3OTgzOTg4MCwiZXhwIjo0OTM1NTEzNDgwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.fjXyj4T4deGlG5sjmSSw3SZzMMy8MdriyUa3vIdCfKY';

const supabase = createClient(supabaseUrl, supabaseKey);

const OLD_URL = 'https://rzttwmqdwhczsrwdonrl.supabase.co';
const NEW_URL = supabaseUrl;

async function run() {
  console.log('Fetching products...');
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  for (const product of products) {
    let changed = false;
    const updates = {};

    if (product.image_url && product.image_url.includes(OLD_URL)) {
      updates.image_url = product.image_url.replace(OLD_URL, NEW_URL);
      changed = true;
    }

    if (product.gallery && Array.isArray(product.gallery)) {
      const newGallery = product.gallery.map(url => url.replace(OLD_URL, NEW_URL));
      if (JSON.stringify(newGallery) !== JSON.stringify(product.gallery)) {
        updates.gallery = newGallery;
        changed = true;
      }
    }

    if (product.variant_images && Array.isArray(product.variant_images)) {
        const newVariants = product.variant_images.map(v => {
            if(v.image_url) {
                return {...v, image_url: v.image_url.replace(OLD_URL, NEW_URL)};
            }
            return v;
        });
        if (JSON.stringify(newVariants) !== JSON.stringify(product.variant_images)) {
          updates.variant_images = newVariants;
          changed = true;
        }
    }

    if (changed) {
      console.log('Updating product: ' + product.id);
      await supabase.from('products').update(updates).eq('id', product.id);
    }
  }

  console.log('Fetching settings...');
  const { data: settings } = await supabase.from('settings').select('*');
  for (const setting of settings || []) {
      if(setting.value && typeof setting.value === 'string' && setting.value.includes(OLD_URL)) {
          const newVal = setting.value.replace(OLD_URL, NEW_URL);
          console.log('Updating setting: ' + setting.key);
          await supabase.from('settings').update({ value: newVal }).eq('key', setting.key);
      }
  }

  console.log('All image URLs updated successfully!');
}

run();

