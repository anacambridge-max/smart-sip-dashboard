# Smart SIP Allocation Dashboard

A production-style Next.js + Tailwind + Recharts dashboard for the fixed 19-fund universe.

## What it does

- Fetches historical NAV from MFAPI server-side.
- Loads all 19 funds in parallel instead of making 19 sequential browser requests.
- Uses a 24-hour cache window with manual refresh support.
- Calculates 14-day RSI, 52-week high/low distance, 1W/1M/3M/6M returns, moving averages, Opportunity Score, Discount Score and Total Score.
- Ranks recent weakness and relative strength across the available fund universe.
- Generates a monthly SIP allocation with configurable Opportunity/Discount weighting, 3% floor and 20% cap.
- Supports an annual SIP step-up assumption.
- Provides NAV history charts for 1M, 6M and 1Y.
- Stores manual investment logs in browser localStorage for this zero-configuration build.

## Data integrity

The dashboard does **not** fabricate demo NAV values. If MFAPI is unavailable, the UI shows a data error/partial-data state rather than presenting synthetic numbers as live data.

## Run locally

```bash
npm install
npm run dev
```

## Important disclaimer

Opportunity Score is a rule-based heuristic using historical NAV patterns. It does not predict future performance and is not investment advice. Mutual fund investments are subject to market risk. Past NAV trends do not guarantee future rallies or lowest-price entry points.
