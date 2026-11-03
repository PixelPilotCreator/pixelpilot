# PixelPilot V13 — Creator Dashboard & Profiles

1. In Supabase SQL Editor run `supabase-v13-profiles.sql` (do NOT delete older tables).
2. Back up your current repository and local project exports.
3. Upload extracted V13 files to GitHub, but **keep your current working config.js**. Never upload secrets.
4. Wait for Netlify Published. Hard refresh.
5. Sign in, open My Account, set unique username and display name, Save profile.
6. Check the left sidebar card and Overview for the profile and verified subscription badge. Generate once and check AI usage. Admin unlimited testing remains unchanged.

Notes: This release does NOT cloud-sync projects (V14), nor change paid feature enforcement (future phase). Subscription badges are populated from the authenticated subscription-status endpoint; temporary Free display can appear before it loads. Existing users choose handles on My Account. New registrations supply preferred names, which are reserved only after email verification and profile save (not at signup). Username uniqueness is enforced when saving. Mobile layout retains bottom navigation and hides the sidebar profile card.
