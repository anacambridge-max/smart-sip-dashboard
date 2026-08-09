# Smart SIP Allocation Dashboard

A Next.js + Tailwind + Recharts decision-support dashboard for the fixed 19-fund universe in the project specification.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Data

The server route `/api/nav?code=SCHEME_CODE` fetches historical NAV from MFAPI and uses Next.js revalidation for a 24-hour cache window. If the upstream is temporarily unavailable, the UI uses deterministic demo data so the interface remains usable; demo data is never presented as live NAV.

## Scoring

Implemented in `lib/scoring.ts`:
- % below 52-week high
- % above 52-week low
- 20/50-day SMA inputs
- 14-day RSI
- 3M/6M relative ranks
- weekly/monthly change
- Discount Score
- Opportunity Score
- Total Score

## Portfolio persistence

For this zero-configuration build, manual investment logs are stored in browser localStorage. This means they persist on the same browser/device but are not synchronized across devices. A Supabase-backed persistence layer can be added by supplying database credentials.

## Deployment

Import this repository into Vercel/Netlify. The app requires no secret API key for MFAPI. A custom domain is optional; the platform URL remains shareable after deployment.

## Important

This is a rule-based historical analytics tool. It does not predict returns, execute trades, or provide personalized investment advice.