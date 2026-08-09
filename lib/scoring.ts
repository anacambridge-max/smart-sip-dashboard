export type Point = { date: string; nav: number };
export type Metrics = {
  id: number;
  belowHigh: number; aboveLow: number; rsi: number; weekly: number; monthly: number;
  ret3m: number; ret6m: number; ma20: number; ma50: number;
  weeklyRank: number; monthlyRank: number; blendedRank: number;
  discount: number; opportunity: number; total: number;
};

const clamp = (x: number, a = 0, b = 100) => Math.max(a, Math.min(b, x));
const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);

function sma(values: number[], n: number) {
  return values.length < n ? NaN : values.slice(-n).reduce((s, v) => s + v, 0) / n;
}

export function rsi(values: number[], n = 14) {
  if (values.length <= n) return 50;
  let gains = 0, losses = 0;
  for (let i = values.length - n; i < values.length; i++) {
    const delta = values[i] - values[i - 1];
    if (delta >= 0) gains += delta; else losses -= delta;
  }
  if (losses === 0) return 100;
  const rs = (gains / n) / (losses / n);
  return 100 - 100 / (1 + rs);
}

function trailing(values: number[], days: number) {
  return values.length > days ? pct(values.at(-1)!, values[values.length - 1 - days]) : 0;
}

export function rawMetrics(points: Point[]) {
  const values = points.map((p) => p.nav).filter(Number.isFinite);
  const current = values.at(-1) ?? 0;
  const window = values.slice(-252);
  const high = Math.max(...window);
  const low = Math.min(...window);
  return {
    belowHigh: high > 0 ? ((high - current) / high) * 100 : 0,
    aboveLow: low > 0 ? ((current - low) / low) * 100 : 0,
    rsi: rsi(values),
    weekly: trailing(values, 7),
    monthly: trailing(values, 30),
    ret3m: trailing(values, 63),
    ret6m: trailing(values, 126),
    ma20: sma(values, 20),
    ma50: sma(values, 50),
  };
}

export function rankMetrics(all: { id: number; raw: ReturnType<typeof rawMetrics> }[]): Metrics[] {
  const n = all.length || 1;
  const rank = (key: keyof ReturnType<typeof rawMetrics>, ascending = false) => {
    const sorted = [...all].sort((a, b) => {
      const av = Number(a.raw[key]); const bv = Number(b.raw[key]);
      return ascending ? av - bv : bv - av;
    });
    const map = new Map<number, number>();
    sorted.forEach((x, i) => map.set(x.id, i + 1));
    return map;
  };

  const weeklyRank = rank('weekly', true);   // biggest decline = rank 1 = highest discount
  const monthlyRank = rank('monthly', true);
  const r3 = rank('ret3m');
  const r6 = rank('ret6m');

  return all.map((x) => {
    const wr = weeklyRank.get(x.id)!;
    const mr = monthlyRank.get(x.id)!;
    const blendedRank = ((r3.get(x.id)! + r6.get(x.id)!) / 2);
    const rankScore = (rankValue: number) => (n - rankValue + 1) / n;
    const discount = 100 * (0.5 * rankScore(wr) + 0.5 * rankScore(mr));
    const belowNorm = clamp(x.raw.belowHigh / 50);
    const rsiSignal = clamp((50 - x.raw.rsi) / 20);
    const relativeStrength = clamp(rankScore(blendedRank));
    const opportunity = 100 * (0.4 * belowNorm + 0.3 * rsiSignal + 0.3 * relativeStrength);
    const total = 0.6 * opportunity + 0.4 * discount;
    return { id: x.id, ...x.raw, weeklyRank: wr, monthlyRank: mr, blendedRank, discount, opportunity, total };
  });
}
