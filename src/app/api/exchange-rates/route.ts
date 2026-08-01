import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

const EXTERNAL_API = "https://api.exchangerate.host/latest";
const BASE = "GBP";
const CACHE_TTL = Number(process.env.EXCHANGE_RATE_TTL_SECONDS || 600); // default 10 minutes

let lastFetch = 0;
let lastPayload: any = null;

export async function GET(req: Request) {
  const now = Date.now() / 1000;
  if (lastPayload && now - lastFetch < CACHE_TTL) {
    return NextResponse.json({ data: lastPayload, cached: true, fetched_at: lastFetch });
  }

  const url = `${EXTERNAL_API}?base=${BASE}`;
  const res = await fetch(url);
  if (!res.ok) return NextResponse.json({ error: 'failed to fetch rates' }, { status: 502 });
  const json = await res.json();

  // update currencies table for any auto_update entries
  try {
    const supabase = await createServerSupabase();
    const supabaseAny = supabase as any;
    const { data: autoCurrencies } = await supabaseAny.from('currencies').select('code').eq('auto_update', true);
    if (autoCurrencies?.length) {
      const updates = autoCurrencies
        .map((r: any) => ({ code: r.code, rate_to_base: json.rates?.[r.code] ?? 1 }))
        .filter(Boolean);
      if (updates.length) {
        for (const u of updates) {
          await supabaseAny.from('currencies').upsert(u, { onConflict: ['code'] });
        }
      }
    }
  } catch (err) {
    // don't fail the whole request if DB update fails
    console.error('exchange-rate db update failed', err);
  }

  lastFetch = Date.now() / 1000;
  lastPayload = json;
  return NextResponse.json({ data: json, cached: false, fetched_at: lastFetch });
}
