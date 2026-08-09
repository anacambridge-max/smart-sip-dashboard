import { NextResponse } from 'next/server';
import { funds } from '../../../../lib/funds';
import { refreshNavHistory } from '../../../../lib/mfapi';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  const cron = req.headers.get('x-vercel-cron');
  const expected = process.env.CRON_SECRET;
  if (cron !== '1' && (!expected || auth !== `Bearer ${expected}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = await Promise.allSettled(funds.map(fund => refreshNavHistory(fund.code)));
  const errors = results.map((r, i) => r.status === 'rejected' ? { code: funds[i].code, name: funds[i].name, error: String(r.reason?.message ?? r.reason) } : null).filter(Boolean);
  const successful = results.filter(r => r.status === 'fulfilled').length;
  return NextResponse.json({ status: errors.length ? 'PARTIAL' : 'LIVE', refreshedAt: new Date().toISOString(), funds: funds.length, successful, errors });
}
