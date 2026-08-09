import { NextResponse } from 'next/server';
import { etfs, sectors, type MarketInstrument } from '../../../lib/market';

export const dynamic = 'force-dynamic';

function pct(a: number, b: number) { return b ? ((a - b) / b) * 100 : 0; }
function clamp(x: number, a = 0, b = 100) { return Math.max(a, Math.min(b, x)); }

async function fetchYahoo(item: MarketInstrument) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.ticker)}?range=1y&interval=1d&events=history`;
    const res = await fetch(url, { signal: controller.signal, headers: { accept: 'application/json', 'user-agent': 'Mozilla/5.0' }, next: { revalidate: 900 } });
    if (!res.ok) throw new Error(`Yahoo ${res.status}`);
    const json = await res.json();
    const r = json?.chart?.result?.[0];
    if (!r) throw new Error('No market data');
    const timestamps: number[] = r.timestamp || [];
    const closes: Array<number | null> = r.indicators?.quote?.[0]?.close || [];
    const points = timestamps.map((ts, i) => ({ date: new Date(ts * 1000).toISOString().slice(0, 10), close: Number(closes[i]) })).filter(x => Number.isFinite(x.close) && x.close > 0);
    if (points.length < 35) throw new Error('Insufficient history');
    const values = points.map(x => x.close);
    const current = values.at(-1)!;
    const high52 = Math.max(...values.slice(-252));
    const low52 = Math.min(...values.slice(-252));
    const weekly = pct(current, values.at(-8) ?? values[0]);
    const monthly = pct(current, values.at(-31) ?? values[0]);
    const threeMonth = pct(current, values.at(-64) ?? values[0]);
    const sixMonth = pct(current, values.at(-127) ?? values[0]);
    const drawdown = pct(current, high52);
    const rsi = (() => {
      const n = 14; if (values.length <= n) return 50;
      let g = 0, l = 0; for (let i = values.length - n; i < values.length; i++) { const d = values[i] - values[i - 1]; if (d >= 0) g += d; else l -= d; }
      if (l === 0) return 100; const rs = (g / n) / (l / n); return 100 - 100 / (1 + rs);
    })();
    const ma20 = values.slice(-20).reduce((a,b)=>a+b,0) / Math.min(20, values.length);
    const ma50 = values.slice(-50).reduce((a,b)=>a+b,0) / Math.min(50, values.length);
    const trend = (current > ma20 ? 35 : 15) + (ma20 > ma50 ? 35 : 10) + clamp((threeMonth + 20) * 0.75, 0, 30);
    const valueScore = clamp((-drawdown) * 2.2 + (50 - rsi) * 0.6, 0, 100);
    const momentumScore = clamp((weekly + 5) * 6 + (monthly + 10) * 2.5 + (threeMonth + 15) * 0.8, 0, 100);
    const setup = clamp(trend * 0.55 + momentumScore * 0.25 + valueScore * 0.20);
    const state = setup >= 72 ? 'STRONG' : setup >= 58 ? 'POSITIVE' : setup >= 42 ? 'WATCH' : 'WEAK';
    return { ...item, current, date: points.at(-1)!.date, weekly, monthly, threeMonth, sixMonth, drawdown, high52, low52, rsi, ma20, ma50, trend: clamp(trend), valueScore, momentumScore, setup, state, points: points.slice(-252), error: null };
  } finally { clearTimeout(timer); }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fresh = url.searchParams.get('refresh') === '1';
  const all = [...etfs, ...sectors];
  const data = await Promise.all(all.map(async item => {
    try {
      const result = await fetchYahoo(item);
      return result;
    } catch (e) {
      return { ...item, current: null, date: null, weekly: 0, monthly: 0, threeMonth: 0, sixMonth: 0, drawdown: 0, high52: 0, low52: 0, rsi: 50, ma20: 0, ma50: 0, trend: 0, valueScore: 0, momentumScore: 0, setup: 0, state: 'UNAVAILABLE', points: [], error: e instanceof Error ? e.message : 'Unavailable' };
    }
  }));
  return NextResponse.json({ generatedAt: new Date().toISOString(), status: data.filter(x => x.current !== null).length === data.length ? 'LIVE' : data.some(x => x.current !== null) ? 'PARTIAL' : 'ERROR', etfs: data.filter(x => x.category === 'ETF'), sectors: data.filter(x => x.category === 'SECTOR'), fresh }, { headers: { 'Cache-Control': fresh ? 'no-store' : 'public, s-maxage=900, stale-while-revalidate=1800' } });
}
