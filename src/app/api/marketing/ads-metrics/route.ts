import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const datePreset = searchParams.get('date_preset') || 'last_30d'; // today, yesterday, last_7d, last_30d
    
    // Fetch settings from Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, error: 'Supabase credentials missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: settingsData } = await supabase.from('settings').select('key, value').eq('key', 'marketing');
    
    const marketingSettings = settingsData?.[0]?.value;
    if (!marketingSettings || !marketingSettings.fbAdAccountId || !marketingSettings.fbAccessToken) {
      return NextResponse.json({ success: false, message: 'Facebook Ads API not configured.' });
    }

    const AD_ACCOUNT_ID = marketingSettings.fbAdAccountId.startsWith('act_') ? marketingSettings.fbAdAccountId : `act_${marketingSettings.fbAdAccountId}`;
    const ACCESS_TOKEN = marketingSettings.fbAccessToken;

    const fbUrl = `https://graph.facebook.com/v19.0/${AD_ACCOUNT_ID}/insights?date_preset=${datePreset}&fields=spend,impressions,clicks,cpc,cpm,actions&access_token=${ACCESS_TOKEN}`;
    
    const fbResponse = await fetch(fbUrl);
    const fbData = await fbResponse.json();

    if (!fbResponse.ok) {
      return NextResponse.json({ success: false, error: fbData }, { status: 400 });
    }

    // Process FB Data
    const insights = fbData.data && fbData.data.length > 0 ? fbData.data[0] : null;
    let purchaseCount = 0;
    let leadCount = 0;

    if (insights && insights.actions) {
      const purchases = insights.actions.find((a: any) => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase');
      const leads = insights.actions.find((a: any) => a.action_type === 'lead' || a.action_type === 'offsite_conversion.fb_pixel_lead');
      purchaseCount = purchases ? parseInt(purchases.value) : 0;
      leadCount = leads ? parseInt(leads.value) : 0;
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        spend: insights ? parseFloat(insights.spend) : 0,
        impressions: insights ? parseInt(insights.impressions) : 0,
        clicks: insights ? parseInt(insights.clicks) : 0,
        cpc: insights ? parseFloat(insights.cpc || "0") : 0,
        cpm: insights ? parseFloat(insights.cpm || "0") : 0,
        fb_purchases: purchaseCount,
        fb_leads: leadCount
      } 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
