import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Hash data for Facebook CAPI (SHA-256)
const hashData = (data: string) => {
  if (!data) return '';
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
};

export async function POST(req: Request) {
  try {
    const { eventName, order } = await req.json();

    if (!eventName || !order) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Fetch settings from Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, error: 'Supabase credentials missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: settingsData } = await supabase.from('settings').select('key, value').eq('key', 'marketing');
    
    const marketingSettings = settingsData?.[0]?.value;
    if (!marketingSettings || !marketingSettings.fbPixelId || !marketingSettings.fbAccessToken) {
      return NextResponse.json({ success: false, message: 'CAPI not configured (missing Pixel ID or Access Token)' });
    }

    const PIXEL_ID = marketingSettings.fbPixelId;
    const ACCESS_TOKEN = marketingSettings.fbAccessToken;

    // 2. Prepare customer data (hashed)
    // Extract phone number, ensure it has country code
    let phone = order.customer_phone?.replace(/\D/g, '') || '';
    if (phone.startsWith('0')) phone = '213' + phone.substring(1);

    const customerData = {
      ph: [hashData(phone)],
      fn: order.customer_name ? [hashData(order.customer_name.split(' ')[0])] : undefined,
    };

    // 3. Prepare payload for Facebook
    const timestamp = Math.floor(Date.now() / 1000);
    const eventId = `order_${order.id}_${eventName}`; // Unique event_id for deduplication if needed

    const payload = {
      data: [
        {
          event_name: eventName, // 'Lead', 'Purchase', etc.
          event_time: timestamp,
          action_source: 'system_generated', // Indicates it came from the CRM/Admin dashboard
          event_id: eventId,
          user_data: customerData,
          custom_data: {
            value: order.total_price || 0,
            currency: 'DZD',
            order_id: order.order_number,
            status: order.status
          }
        }
      ],
      // test_event_code: 'TEST20227' // For testing in FB Events Manager
    };

    // 4. Send to Facebook Graph API
    const fbUrl = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
    
    const fbResponse = await fetch(fbUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const fbData = await fbResponse.json();

    if (!fbResponse.ok) {
      console.error('Facebook CAPI Error:', fbData);
      
      // Update order metadata with failure
      try {
        const metadata = order.metadata || {};
        await supabase.from('orders').update({
          metadata: { ...metadata, capi_sync_status: 'failed', capi_last_error: fbData.error?.message || 'Unknown error' }
        }).eq('id', order.id);
      } catch (e) {}

      return NextResponse.json({ success: false, error: fbData }, { status: 400 });
    }

    // Update order metadata with success
    try {
      const metadata = order.metadata || {};
      await supabase.from('orders').update({
        metadata: { ...metadata, capi_sync_status: 'success', capi_event_id: eventId, capi_sent_at: new Date().toISOString() }
      }).eq('id', order.id);
    } catch (e) {}

    return NextResponse.json({ success: true, message: `Event ${eventName} sent to Facebook`, data: fbData });

  } catch (error: any) {
    console.error('CAPI API Route Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
