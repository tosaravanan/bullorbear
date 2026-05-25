export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 1. FRONTEND ONLY READS DATA (GET)
export async function GET() {
  try {
    const cachedData = await redis.get('nifty_live_feed');
    if (!cachedData) {
      return NextResponse.json({ price: 23700.00, change: 0.00 });
    }
    const parsedData = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;

    // This returns the numbers to your screen safely without hitting RapidAPI
    return NextResponse.json({ price: parsedData.price, change: parsedData.change });
  } catch (error) {
    return NextResponse.json({ price: 23700.00, change: 0.00 }, { status: 500 });
  }
}

// 2. CRON-JOB.ORG ONLY UPDATES DATA (POST)
export async function POST() {
  try {
    const response = await fetch('https://india-stock-market-moneycontrol-live-api.p.rapidapi.com/index_details?indexId=9', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
        'X-RapidAPI-Host': 'india-stock-market-moneycontrol-live-api.p.rapidapi.com'
      }
    });
    const result = await response.json();
    const dataObj = result.data || result;
    
    const payload = {
      price: parseFloat(dataObj.currentValue || dataObj.lastPrice || 23700),
      change: parseFloat(dataObj.change || 0),
      timestamp: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour12: true })
    };

    // This updates the database
    await redis.set('nifty_live_feed', JSON.stringify(payload));
    return NextResponse.json({ success: true, updated: payload });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal pipeline error' }, { status: 500 });
  }
}