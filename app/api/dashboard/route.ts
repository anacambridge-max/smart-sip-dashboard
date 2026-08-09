import { NextResponse } from 'next/server';
import { funds } from '../../../lib/funds';
import { rawMetrics, rankMetrics } from '../../../lib/scoring';
import { getNavHistory, refreshNavHistory } from '../../../lib/mfapi';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const refresh = new URL(req.url).searchParams.get('refresh') === '1';
    const results = await Promise.all(funds.map(async fund => {
      try {
        const points = refresh ? await refreshNavHistory(fund.code) : await getNavHistory(fund.code);
        return { fund, points, error: null as string | null };
      } catch (e) {
        return { fund, points: [], error: e instanceof Error ? e.message : 'NAV unavailable' };
      }
    }));

    const usable = results.filter(x => x.points.length >= 20);
    const ranked = rankMetrics(usable.map(x => ({ id: x.fund.id, raw: rawMetrics(x.points) })));
    const rows = ranked.map(metric => {
      const source = usable.find(x => x.fund.id === metric.id);
      if (!source) return null;
      const last = source.points.at(-1);
      const prev = source.points.at(-2);
      return {
        ...source.fund,
        ...metric,
        daily: prev && last ? ((last.nav - prev.nav) / prev.nav) * 100 : 0,
        nav: last?.nav ?? null,
        navDate: last?.date ?? null,
        dataPoints: source.points.length,
        sparkline: source.points.slice(-30).map(p => p.nav),
      };
    }).filter(Boolean);

    const latestDates = usable.map(x => x.points.at(-1)?.date).filter(Boolean).sort();
    const latestNavDate = latestDates.at(-1) ?? null;
    const refreshedAt = new Date().toISOString();

    return NextResponse.json({
      generatedAt: refreshedAt,
      lastRefreshedAt: refreshedAt,
      latestNavDate,
      totalFunds: funds.length,
      availableFunds: usable.length,
      status: usable.length === funds.length ? 'LIVE' : usable.length ? 'PARTIAL' : 'ERROR',
      errors: results.filter(x => x.points.length < 20).map(x => ({ code: x.fund.code, name: x.fund.name, error: x.error ?? 'Insufficient NAV history' })),
      rows,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'NAV unavailable', status: 'ERROR', rows: [] }, { status: 503 });
  }
}
