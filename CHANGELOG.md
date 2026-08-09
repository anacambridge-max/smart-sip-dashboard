# Changelog

## 1.2.0 — Zero-Setup Stabilization

### Deployment simplification
- Removed the mandatory Postgres/Supabase dependency.
- Removed the mandatory dashboard password gate so the public dashboard no longer fails when Vercel environment variables are absent.
- Removed database-backed portfolio/plans APIs.
- Portfolio Tracker now stores investment logs, allocation plans and step-up history locally in the browser and supports CSV backup/import.

### NAV architecture
- Added a server-side Vercel Data Cache wrapper for MFAPI NAV histories with a 24-hour revalidation window per fund.
- Dashboard and NAV-history routes read from the server cache rather than calling MFAPI directly from the browser.
- Nightly Vercel Cron at 22:00 IST invalidates and refreshes the cached NAV histories.
- NAV history remains live-source data; no synthetic/demo NAV fallback is used.

### Preserved
- Existing All Score weights remain unchanged: 35% Quality, 25% Opportunity, 15% Discount, 15% Momentum, 10% Risk.
- Daily/Weekly/Monthly horizons, 23-fund universe, Gold/Silver MF module, market-cap section and sector heatmap remain intact.
- No broker integration, trade execution, predictive/ML scoring, guaranteed-return claims or personalized financial advice.

## 1.1.0 — Fix & Upgrade Pass

- Added the professional dashboard, Top-5 radar, loser filters, Gold/Silver module, market-cap regime, sector heatmap, fund table UX, NAV sparklines and long-term scoring layers.
- Added portfolio tracker, investment log, allocation planner, step-up controls and NAV comparison features in the first implementation.
