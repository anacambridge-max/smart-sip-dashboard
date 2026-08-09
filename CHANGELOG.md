# Changelog

## 1.1.0 — Fix & Upgrade Pass

### Priority 0 — fixes
- Added a Postgres-backed NAV cache so dashboard and NAV-history reads no longer call `mfapi.in` on every page load.
- Added a nightly Vercel Cron at 22:00 IST (16:30 UTC) to refresh NAV history and record `nav_last_refreshed_at`.
- Added visible NAV freshness indicators.
- Fixed the Nifty Next 50 Yahoo Finance ticker to `^NSMIDCP`.
- Nifty Smallcap 250 is explicitly treated as **Index not tracked** rather than presenting a fake score when the underlying Yahoo index series is unavailable.
- Centralized scoring remains in the existing `rankMetrics` / `rawMetrics` pipeline; all views consume the same computed score object.
- Added environment-backed Basic Authentication. Configure `DASHBOARD_PASSWORD`; set `DATABASE_URL` for persistence and `CRON_SECRET` for manual cron invocation.

### Priority 1 — added
- Added protected Portfolio Tracker workspace at `/portfolio`.
- Added Mark as Invested log with date, fund, amount, units and purchase NAV.
- Added individual and blended XIRR based on dated investment cash flows plus current cached value.
- Added CSV import/export for investment history.
- Added editable allocation plan with proportional redistribution, plan confirmation and separate plan-of-record storage.
- Added weekly/monthly cadence view and investment calendar.
- Added step-up history and manual trigger controls.
- Added multi-fund NAV comparison chart for up to five funds over 3M/6M/1Y/3Y ranges.

### Priority 2 — UX / polish
- Mutual Funds table now supports search, category filtering and click-to-sort numeric columns.
- Added sticky table header and frozen first column for narrow screens.
- Added cached 30-day NAV sparklines to fund rows.
- Added per-fund Advanced Metrics expansion so composite All Score stays primary.
- Improved WATCH badge contrast to a darker accessible amber treatment.
- Added responsive mobile rules for Top-5 cards, sector heatmap and fund table.
- Added a Portfolio link to the primary navigation and shared design/status styling.

### Scope preserved
- Existing All Score weights are unchanged: 35% Quality, 25% Opportunity, 15% Discount, 15% Momentum, 10% Risk.
- No broker integration or trade execution.
- No predictive/ML scoring.
- Existing historical decision-support disclaimer is retained on score/allocation views and repeated in the private portfolio workspace.
