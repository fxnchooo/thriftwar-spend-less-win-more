# Launch-readiness plan

Three buckets: data durability, auth, and launch polish. Done in order so each step is verifiable.

## 1. Move personal expenses to the database (blocker)

Currently personal expenses live in `localStorage` only — users lose everything across devices, browsers, or incognito sessions.

- New table `personal_expenses` with: `user_id`, `amount`, `currency`, `description`, `category`, `date`, `notes`, `payment_method`, plus standard timestamps.
- RLS: users can only read/insert/update/delete their own rows. Grants for `authenticated` + `service_role`. No `anon`.
- Rewrite `usePersonalExpenses.tsx` to use Supabase + React Query (mirror the `useExpenses` pattern, including realtime invalidation).
- One-time migration on first load: if local rows exist for the user, upload them to the DB, then clear localStorage.
- No UI changes — `Personal.tsx`, `QuickAddBar`, and `PersonalExpenseModal` keep their existing API.

## 2. Add Google sign-in (recommended default)

- Run the managed social-auth configuration to enable Google (keeps email/password enabled).
- Add a "Continue with Google" button on `Auth.tsx` above the email form, using the Lovable Cloud OAuth client (`lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`).
- Handle the `result.error` / `result.redirected` branches and surface errors via toast.

## 3. Verify auth redirect for the published domain

- The signup flow uses `window.location.origin` as `emailRedirectTo`, which is correct, but the published URL must be allowlisted.
- Action: confirm `https://thrift-champions-club.lovable.app` (and any custom domain) is in the Cloud auth Site URL / Redirect URLs list. If not, add it. No code change.

## 4. Launch polish

- **SEO in `index.html`**: real `<title>`, meta description, Open Graph + Twitter card tags, canonical URL.
- **Error boundary**: wrap the routes in `App.tsx` with a friendly fallback so a render error doesn't whiteout the app.
- **Loading states**: replace the full-screen pulsing pig with lightweight skeletons on Dashboard, Leaderboard, and Personal while initial data loads.
- **Empty states audit**: quick pass on brand-new account flows (no group, no expenses, no notifications) to make sure copy and CTAs read well.

## Out of scope (call out, don't build)

- Push notifications, payments, deeper analytics, account deletion UI. Mention as next-step candidates but not part of this launch.

## Technical notes

- Migration follows the standard 4-step pattern (CREATE TABLE → GRANT → ENABLE RLS → CREATE POLICY), with `service_role` grants included.
- React Query keys: `["personal_expenses", userId]` to keep cache scoped.
- Realtime channel filtered by `user_id=eq.${user.id}` so each session only listens to its own rows.
- Google OAuth uses the managed Lovable Cloud client — no external credentials needed unless the user later wants their own branding.

## Verification before sign-off

- Log in fresh, add a personal expense, hard-refresh, confirm it persists.
- Log in on a second browser, confirm the same expense appears.
- Sign in with Google end-to-end on the published URL.
- Open the published site in an incognito tab and confirm the email verification link redirects back successfully.
- Lighthouse pass on the published URL for basic SEO/perf sanity.