import { NextResponse } from 'next/server';
import { funds } from '../../../lib/funds';
import { rawMetrics, rankMetrics } from '../../../lib/scoring';

export const dynamic = 'force-dynamic';

async function fetchHistory(code: string, fresh: boolean) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(`https://api.mfapi.in/mf/${encodeURIComponent(code)}`, {
      signal: controller.signal,
      ...(fresh ? { cache: 'no-store' as const } : { next: { revalidate: 86400 } }),
      headers: { accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`MFAPI ${response.status}`);
    const json = await response.json();
    const data = (json.data ?? [])
      .map((x: any) => ({ date: String(x.date), nav: Number(x.nav) }))
      .filter((x: any) => Number.isFinite(x.nav) && x.nav > 0)
      .reverse();
    if (!data.length) throw new Error('No NAV history');
    return { data, meta: json.meta ?? null };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fresh = url.searchParams.get('refresh') === '1';
  const results = await Promise.all(
    funds.map(async (fund) => {
      try {
        const result = await fetchHistory(fund.code, fresh);
        return { fund, points: result.data, meta: result.meta, error: null };
      } catch (error) {
        return { fund, points: [], meta: null, error: error instanceof Error ? error.message : 'NAV unavailable' };
      }
    })
  );

  const usable = results.filter((x) => x.points.length >= 20);
  const ranked = rankMetrics(usable.map((x) => ({ id: x.fund.id, raw: rawMetrics(x.points) })));
  const rows = ranked.map((metric) => {
    const source = usable.find((x) => x.fund.id === metric.id)!;
    return { ...source.fund, ...metric, nav: source.points.at(-1)?.nav ?? null, navDate: source.points.at(-1)?.date ?? null, dataPoints: source.points.length };
  });

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalFunds: funds.length,
    availableFunds: usable.length,
    status: usable.length === funds.length ? 'LIVE' : usable.length ? 'PARTIAL' : 'ERROR',
    errors: results.filter((x) => x.error).map((x) => ({ code: x.fund.code, name: x.fund.name, error: x.error })),
    rows,
  }, { headers: { 'Cache-Control': fresh ? 'no-store' : 'public, s-maxage=86400, stale-while-revalidate=3600' } });
}
