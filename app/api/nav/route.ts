import { NextResponse } from 'next/server';
import { getNavHistory } from '../../../lib/mfapi';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });
  try {
    const data = await getNavHistory(code);
    return NextResponse.json({ data, status: data.length ? 'LIVE-CACHED' : 'UNAVAILABLE' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'NAV unavailable', status: 'ERROR', data: [] }, { status: 503 });
  }
}
