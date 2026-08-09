# Production deployment

This edition is intentionally **zero-setup**: no Supabase, Postgres, database password, or dashboard password is required.

## NAV data architecture

- Mutual-fund NAV history comes from MFAPI.
- Server-side NAV data is cached in Vercel's Data Cache for 24 hours per fund.
- The normal dashboard does not call MFAPI directly from the browser.
- `vercel.json` runs `/api/cron/nav` nightly at 22:00 IST to invalidate and refresh the cached NAV histories.
- The dashboard displays the latest NAV date and a data-check timestamp.

## Portfolio storage

The portfolio tracker is a browser-local workspace in this no-database edition. Investment logs, allocation plans and step-up history are stored in `localStorage` on the user's device. Use CSV export for backup. No broker or AMC connection exists.

## Vercel setup

1. Connect the GitHub repository to Vercel.
2. Use the default Next.js build settings.
3. No environment variables are required for the dashboard.
4. Deploy the `main` branch.
5. Confirm the deployment is `Ready`.
6. Open the production URL and click **Refresh** once to verify the NAV/market feeds.

`CRON_SECRET` is optional if you want to manually call the cron endpoint; Vercel Cron requests are accepted automatically.

## Important

This architecture deliberately trades server-side persistence for zero configuration. Portfolio data is not shared across devices or browsers. The dashboard remains rule-based and does not execute trades, predict returns, or provide personalized financial advice.
