# PixelPilot V13.1 dashboard polish

- Adjusts welcome heading typography to prevent tight overlapping letters.
- Refreshes the AI allowance after sign-in/sign-out, not just on initial page load.
- Keeps subscription plan badge sourced from subscription-status rather than downgrading the badge when generate reports Free.
- Displays an explicit verification warning when Stripe says Creator/Pro/Studio but generate reports the Free quota. It does NOT invent or grant paid credits.

## Important: Paid quota discrepancy
If you still see `Check subscription`, the backend `generate` function is rejecting paid entitlement while `subscription-status` reports an active plan. Inspect the Supabase `pixelpilot_subscriptions` row for `current_period_start` and `current_period_end` and verify both are populated with valid dates covering the present. Do not edit billing records blindly. Check Stripe webhook sync and Netlify function logs. The V13.1 UI does not alter payment enforcement.

No SQL migration needed. Keep existing config.js and Netlify environment variables.
