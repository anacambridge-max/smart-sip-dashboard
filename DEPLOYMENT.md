# Production deployment

The dashboard now requires persistent storage and a password gate.

## Required Vercel environment variables

- `DATABASE_URL` — Postgres connection string used for NAV cache, investment log, allocation plans and step-up history.
- `DASHBOARD_PASSWORD` — shared password used by the Basic Authentication gate. Do not commit this value.
- `CRON_SECRET` — optional for manual authenticated calls to `/api/cron/nav`; Vercel Cron requests are also accepted via `x-vercel-cron: 1`.

## Nightly NAV refresh

`vercel.json` schedules `/api/cron/nav` for `30 16 * * *`, which is 22:00 IST. The job pulls the configured mutual-fund histories from MFAPI, stores them in Postgres, and writes `nav_last_refreshed_at` to `app_meta`.

The normal dashboard and NAV routes never call MFAPI. They read only from the Postgres cache.

## First deployment after this pass

1. Add `DATABASE_URL` and `DASHBOARD_PASSWORD` in Vercel Project Settings → Environment Variables.
2. Redeploy production.
3. Open the dashboard; Basic Authentication will prompt for any username and the configured password.
4. Verify the header shows the last NAV refresh after the first successful cron run.
5. Verify `/portfolio` and record a test investment only after confirming the Postgres tables were created.

## Important

Without `DATABASE_URL`, persistent routes intentionally fail closed rather than falling back to live MFAPI calls on page load. Without `DASHBOARD_PASSWORD`, the public site returns a configuration error rather than exposing personal portfolio data.
