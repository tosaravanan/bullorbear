export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: Request) {
  // Guard the route from external spam
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Call the free RapidAPI endpoint instead of Zerodha
    const response = await fetch('https://india-stock-market-moneycontrol-live-api.p.rapidapi.com/index_details?indexId=9', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
        'X-RapidAPI-Host': 'india-stock-market-moneycontrol-live-api.p.rapidapi.com'
      }
    });

    const result = await response.json();
    
    // Parse the live price directly out of the data payload
    // Adjust key naming based on the exact JSON schema provided in the RapidAPI playground
    const livePrice = parseFloat(result.currentValue || result.price);
    const pointChange = parseFloat(result.change || 0);

    const payload = {
      price: livePrice,
      change: pointChange,
      timestamp: new Date().toISOString()
    };

    // Push straight to your Upstash Redis cache
    await redis.set('nifty_live_feed', JSON.stringify(payload));

    return NextResponse.json({ success: true, updated: payload });
  } catch (error) {
    console.error('RapidAPI Fetch Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to poll market feed' }, { status: 500 });
  }
}