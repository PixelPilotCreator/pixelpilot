# PixelPilot V11 — Stripe Sandbox Checkout Preview

**IMPORTANT:** This is an intermediate checkout integration, NOT production billing. Paid AI allowances and premium feature access are **NOT** enabled or enforced yet. Do not turn on live payments. The existing free/admin generator remains unchanged.

## Setup
1. Keep existing environment variables. Netlify Functions must have `STRIPE_SECRET_KEY` (sk_test_), `STRIPE_PRICE_CREATOR`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_STUDIO`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
2. In Supabase SQL Editor run `supabase-setup.sql`.
3. In Netlify Functions environment add **secret** `SUPABASE_SERVICE_ROLE_KEY` from Supabase Project Settings > API keys (server-side only). NEVER commit it, expose it in config.js, or exclude it from secret scanning.
4. Deploy all files, preserving your working `config.js` with PUBLIC Supabase URL and anon key. Do not replace existing config with an empty one.
5. In Stripe **Sandbox** > Developers > Webhooks / Workbench > Event destinations, add endpoint `https://pixelpilot2026.netlify.app/.netlify/functions/stripe-webhook`, subscribe to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy signing secret to Netlify Functions environment as `STRIPE_WEBHOOK_SECRET` (whsec_...). Redeploy.
6. In Stripe Sandbox configure Customer Portal; enable cancellation and payment-method management. Portal URL is generated server-side.
7. Sign in to PixelPilot and use the new bottom-page **Subscription Billing — Sandbox** buttons. Use Stripe test cards (e.g. 4242 4242 4242 4242, any future expiration, any CVC). After checkout, click **Check Subscription**; expect plan and active status. Use **Manage Billing** to test cancellation.
8. Stripe webhooks can retry; the handler upserts subscription rows. Check Netlify Function logs and Stripe event delivery if status is not updated. Ensure Supabase table was created and service-role key was configured.

## Security and limits
- Stripe API and Supabase service-role keys are server-side only. Browser authenticates with Supabase access token, verified server-side. Checkout price is mapped from environment variables, never accepted from client.
- Stripe signature is verified over raw body with 5-minute tolerance.
- Webhook subscription metadata links Stripe to Supabase user. Checkout redirect does not grant access.
- **No live launch**: before live payments, add robust monthly generation metering, premium feature authorization, cancellation-period behavior, Stripe idempotency/event replay protection, and concurrency testing. Audit duplicate subscriptions and failed payment behavior. Consider reducing `MAX_GLOBAL_DAILY_GENERATIONS` cap impacts before enabling paid plans.
- `config.js` includes a public Supabase anon key and URL; those are not secret. Keep secret scanning enabled for all private credentials.
- Project files remain browser-local and are not synced to user accounts.
