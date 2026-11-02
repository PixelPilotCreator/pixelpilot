# PixelPilot V12 — Sandbox rollout

1. Back up your current working GitHub repository and keep your existing `config.js` containing only the PUBLIC Supabase URL and anon key. Do not upload `.env` or secrets.
2. Run `supabase-v12-migration.sql` in Supabase SQL Editor.
3. Deploy all V12 files to GitHub/Netlify, retaining existing Netlify environment variables.
4. **Existing Creator test subscription:** The new `current_period_start` is populated when Stripe sends a subscription event. In Stripe Sandbox open your subscription and make a change (e.g. toggle cancel-at-period-end and undo), then verify the `stripe-webhook` log and `pixelpilot_subscriptions` row. Alternatively create a new test subscription. Until start/end are populated, the backend fails closed and treats that subscription as Free.
5. Sign in; top-right should show your account and Sign out. Check generation remaining and plan; test quotas carefully.
6. **Still Sandbox only.** Global AI cap (`MAX_GLOBAL_DAILY_GENERATIONS`, default 60) applies to all accounts, including paid. Requests are counted before Gemini completes, so failed generations can consume quota. Free anonymous users still have 3/day/IP. Paid users have monthly per-account atomic Redis counters keyed to Stripe billing period start, and Pro/Studio unlock server-returned SEO. Other premium dashboard controls remain previews; do not launch live billing yet.
7. **Before production:** implement stronger event ordering and idempotency, upgrade/downgrade subscription reconciliation, refunds and failed-payment tests, concurrency tests, recover failed generations, robust paid capacity and pricing, and server enforcement of every promised premium feature. Existing browser-local projects do not sync.
