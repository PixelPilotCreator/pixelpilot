# PixelPilot V12.2 — owner-only unlimited testing

1. In Netlify environment variables add `PIXELPILOT_UNLIMITED_ADMIN_TESTING` with value `true`, scope Functions.
2. Keep `ADMIN_TEST_TOKEN` private and at least 32 characters. Never commit it or share it.
3. Deploy this V12.2 project to GitHub. Preserve the existing configured `config.js` from the live repository.
4. In AI Studio expand **Site owner? Enable Admin Testing Mode**, enter the existing private admin token, click Verify admin access.
5. The usage meter should show **Developer Testing Mode — Unlimited ∞**. This is owner-only; public free and paid limits remain enforced.
6. To disable: change the environment variable to `false` (or delete it), redeploy, and click Disable admin mode.

**Important:** Unlimited testing bypasses PixelPilot's per-admin and global daily request caps *for verified admin requests only*. Provider API quotas and potential Gemini charges still apply. Do not publish your token. Avoid testing with large batches. No SQL migration is required.
