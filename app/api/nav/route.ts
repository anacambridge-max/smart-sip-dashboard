import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const fresh = url.searchParams.get('refresh') === '1';
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });

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
    if (!data.length) throw new Error('No NAV data');
    return NextResponse.json({ meta: json.meta ?? null, data, status: 'LIVE' }, {
      headers: { 'Cache-Control': fresh ? 'no-store' : 'public, s-maxage=86400, stale-while-revalidate=3600' },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'NAV unavailable', status: 'ERROR' }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
