/**
 * Quick diagnostic script to test if order insertion works
 * Run: node scripts/test-order-insert.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').trim();
    }
  });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('==================================================');
console.log('🔍 SAC SHOP - Order Insert Diagnostic');
console.log('==================================================\n');
console.log(`🔗 Supabase URL: ${url}`);
console.log(`🔑 Anon Key: ${anonKey ? '[PRESENT]' : '[MISSING]'}`);
console.log(`🔑 Service Role Key: ${serviceKey ? '[PRESENT]' : '[MISSING]'}`);

async function testConnection(label, key) {
  console.log(`\n--- Testing with ${label} ---`);
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // Test 1: Can we read products?
  console.log('\n[1] Reading products...');
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, name')
    .limit(1);

  if (prodErr) {
    console.error('   ❌ Products read FAILED:', prodErr.message);
    console.error('   Full error:', JSON.stringify(prodErr, null, 2));
  } else {
    console.log(`   ✅ Products read OK (found ${products.length} product)`);
    if (products.length > 0) console.log(`      First product: ${products[0].name} (${products[0].id})`);
  }

  // Test 2: Can we read orders?
  console.log('\n[2] Reading existing orders...');
  const { data: orders, error: ordErr } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, status')
    .limit(3);

  if (ordErr) {
    console.error('   ❌ Orders read FAILED:', ordErr.message);
    console.error('   Full error:', JSON.stringify(ordErr, null, 2));
  } else {
    console.log(`   ✅ Orders read OK (found ${orders.length} orders)`);
    orders.forEach(o => console.log(`      #${o.order_number} - ${o.customer_name} (${o.status})`));
  }

  // Test 3: Check table columns
  console.log('\n[3] Checking orders table columns...');
  const { data: colData, error: colErr } = await supabase.rpc('get_table_columns', { table_name: 'orders' });
  if (colErr) {
    console.log('   ⚠️ RPC not available, trying raw query via REST...');
    // Try inserting a test order instead
  }

  // Test 4: Try inserting a test order
  console.log('\n[4] Attempting test order insert...');
  const testId = crypto.randomUUID ? crypto.randomUUID() : 'test-' + Date.now();
  
  const insertPayload = {
    id: testId,
    customer_name: 'TEST_DIAGNOSTIC',
    customer_phone: '0000000000',
    customer_address: 'TEST',
    product_id: products?.[0]?.id || null,
    quantity: 1,
    size: null,
    color: null,
    product_price: 100,
    total_price: 100,
    applied_offer_id: null,
    status: 'new',
    cart_items: [],
    admin_notes: 'DIAGNOSTIC_TEST - Safe to delete',
    metadata: { test: true }
  };

  console.log('   Payload:', JSON.stringify(insertPayload, null, 2));
  
  const { data: insertData, error: insertErr } = await supabase
    .from('orders')
    .insert(insertPayload)
    .select();

  if (insertErr) {
    console.error('\n   ❌❌ ORDER INSERT FAILED ❌❌');
    console.error('   Error message:', insertErr.message);
    console.error('   Error code:', insertErr.code);
    console.error('   Error details:', insertErr.details);
    console.error('   Error hint:', insertErr.hint);
    console.error('   Full error:', JSON.stringify(insertErr, null, 2));
    
    // Try without product_price and applied_offer_id (columns that were added later)
    console.log('\n[4b] Retrying without optional columns (product_price, applied_offer_id)...');
    const { id, product_price, applied_offer_id, ...minimalPayload } = insertPayload;
    minimalPayload.id = 'test2-' + Date.now();
    
    const { error: retryErr } = await supabase.from('orders').insert(minimalPayload);
    if (retryErr) {
      console.error('   ❌ Still fails:', retryErr.message);
      console.error('   Full:', JSON.stringify(retryErr, null, 2));
    } else {
      console.log('   ✅ Minimal insert SUCCEEDED! Missing columns: product_price, applied_offer_id');
      console.log('   🔧 FIX: Run add_missing_columns.sql on the database');
      // Clean up
      await supabase.from('orders').delete().eq('id', minimalPayload.id);
    }
  } else {
    console.log('   ✅ ORDER INSERT SUCCEEDED!');
    console.log('   Inserted:', JSON.stringify(insertData, null, 2));
    
    // Clean up test order
    console.log('\n[5] Cleaning up test order...');
    const { error: delErr } = await supabase.from('orders').delete().eq('id', testId);
    if (delErr) {
      console.error('   ⚠️ Failed to clean up test order:', delErr.message);
    } else {
      console.log('   ✅ Test order cleaned up');
    }
  }

  // Test 5: Check if customers table is accessible
  console.log('\n[6] Checking customers table...');
  const { data: customers, error: custErr } = await supabase
    .from('customers')
    .select('id, name, phone')
    .limit(2);

  if (custErr) {
    console.error('   ❌ Customers read FAILED:', custErr.message);
  } else {
    console.log(`   ✅ Customers read OK (found ${customers.length})`);
  }
}

async function main() {
  try {
    // Test with anon key first (this is what the client uses)
    await testConnection('ANON KEY (client-side)', anonKey);
    
    // Then test with service role
    if (serviceKey) {
      await testConnection('SERVICE ROLE KEY (server-side)', serviceKey);
    }
  } catch (e) {
    console.error('\n💥 FATAL ERROR:', e.message);
    console.error(e.stack);
  }
}

main();
