import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) console.error("Error:", error);
  else {
    if (data.length > 0) {
      console.log("Product keys:", Object.keys(data[0]));
      console.log("Has packages column in API?", Object.keys(data[0]).includes("packages"));
    } else {
      console.log("No products found.");
    }
  }
}
check();
