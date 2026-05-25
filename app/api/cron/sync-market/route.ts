export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  try {
    // Hit RapidAPI MoneyControl Pipeline directly with no prior authentication checks
    const response = await fetch('https://india-stock-market-moneycontrol-live-api.p.rapidapi.com/index_details?indexId=9', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
        'X-RapidAPI-Host': 'india-stock-market-moneycontrol-live-api.p.rapidapi.com'
      }
    });

    const result = await response.json();
    
    // Safety check matching the inner payload structure
    const dataObj = result.data || result;
    const livePrice = parseFloat(dataObj.currentValue || dataObj.lastPrice || 23700);
    const pointChange = parseFloat(dataObj.change || 0);

    const payload = {
      price: livePrice,
      change: pointChange,
      timestamp: new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: true
      })
    };

    // Save straight to your Upstash Cache Storage
    await redis.set('nifty_live_feed', JSON.stringify(payload));

    return NextResponse.json({ success: true, updated: payload });
  } catch (error) {
    console.error('API Sync System Fault:', error);
    return NextResponse.json({ success: false, error: 'Internal pipeline error' }, { status: 500 });
  }
}