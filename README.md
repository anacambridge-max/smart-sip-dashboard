# Smart SIP Allocation Dashboard

A production-style Next.js + Tailwind + Recharts mutual-fund decision-support dashboard for the configured 23-fund universe.

## What it does

- Fetches historical NAV from MFAPI server-side.
- Uses Vercel Data Cache with a 24-hour per-fund revalidation window.
- Nightly Vercel Cron invalidates and refreshes NAV cache at 22:00 IST.
- Calculates RSI, 52-week high/low distance, 1W/1M/3M/6M/1Y returns, moving averages, Opportunity Score, Discount Score and Total Score.
- Ranks recent weakness and relative strength across the available fund universe.
- Includes Top-5 equity radar, weekly/monthly genuine losers, Gold/Silver mutual-fund modules, market-cap regime and sector heatmap.
- Shows latest NAV and NAV date for available funds plus 30-day sparklines.
- Portfolio Tracker works without a database: investment log, allocation plans and step-up history are stored in browser localStorage, with CSV import/export for backup.
- No broker or AMC order execution.

## Data integrity

The dashboard does **not** fabricate demo NAV values. If MFAPI or market data is unavailable, the UI shows an error/partial-data state rather than presenting synthetic numbers as live data. Unavailable market data is never converted into a score of zero.

## Zero-setup deployment

Connect the repository to Vercel and deploy the `main` branch. No Supabase/Postgres account and no environment variables are required for the standard dashboard.

## Run locally

```bash
npm install
npm run dev
```

## Important disclaimer

Opportunity Score and Total Score are rule-based heuristics using historical NAV/market patterns. They do not predict future performance and are not investment advice. Mutual fund investments are subject to market risk. Past NAV trends do not guarantee future rallies, lowest-price entries or maximum profit.
