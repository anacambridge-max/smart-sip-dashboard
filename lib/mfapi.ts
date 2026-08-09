import { unstable_cache } from 'next/cache';

export type NavPoint = { date: string; nav: number };

function parseDate(s: string) {
  const [d, m, y] = s.split('-');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

async function fetchMfapi(code: string): Promise<NavPoint[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`https://api.mfapi.in/mf/${encodeURIComponent(code)}`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`MFAPI ${res.status}`);
    const json = await res.json();
    return (json.data ?? [])
      .map((x: any) => ({ date: parseDate(String(x.date)), nav: Number(x.nav) }))
      .filter((x: NavPoint) => Number.isFinite(x.nav) && x.nav > 0)
      .sort((a: NavPoint, b: NavPoint) => a.date.localeCompare(b.date));
  } finally {
    clearTimeout(timeout);
  }
}

export function getNavHistory(code: string) {
  return unstable_cache(
    () => fetchMfapi(code),
    ['mfapi-nav', code],
    { revalidate: 86400, tags: [`mfapi-nav-${code}`] },
  )();
}

export async function refreshNavHistory(code: string) {
  return fetchMfapi(code);
}
