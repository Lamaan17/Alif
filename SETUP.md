# Build Together — Supabase setup

Five things, in order. Should take about ten minutes total (skip Google OAuth and it's three).

---

## 1 · Create a Supabase project

1. Go to <https://supabase.com> and sign up (free tier is fine).
2. Click **New project**. Pick any name, set a strong **DB password** (you won't need it for this app, but Supabase requires one), and choose the region nearest to your users.
3. Wait ~1 minute for it to provision.

## 2 · Get your URL + anon key

1. In the Supabase dashboard: **Project Settings → API**.
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. In this repo, create `.env.local` (copy from `.env.local.example`) and paste them in.

```bash
cp .env.local.example .env.local
# then edit .env.local with your values
```

> **Anon key is safe to expose in the browser** — RLS policies (next step) enforce access control.

## 3 · Run the SQL

Two files, in order. Both are idempotent — safe to re-run.

**3a · Profiles schema**
1. Supabase dashboard → **SQL Editor → + New query**
2. Paste the contents of `supabase/schema.sql`, click **Run**.

Creates: `profiles` table (18 fields), enums, `updated_at` trigger, RLS policies (any authed user can read profiles, only owner can write), `avatars` storage bucket with per-user folder policies.

**3b · Discovery migration**
1. New query → paste the contents of `supabase/discovery.sql`, click **Run**.

Adds:
- `verified` boolean column on `profiles` (default false; flip manually for now)
- `interests` table — one row per "X is interested in Y", with RLS so users only see interests they sent or received
- `matches` view — derived mutual interests (uses `security_invoker` so RLS is respected)
- `invitations` table — stub for the "Invite to Mini Project" action; full sprint flow lands later

> To **verify a user** for the "Verified only" filter: in SQL Editor, run `update profiles set verified = true where id = 'USER-UUID';`. You can find UUIDs under **Authentication → Users**.

## 4 · Configure auth (magic link)

Magic link works out of the box. Two small things worth doing:

1. **Auth → URL Configuration**:
   - **Site URL**: `http://localhost:3000` (for local dev — change to your real domain when you deploy)
   - **Redirect URLs**: add `http://localhost:3000/auth/callback`
2. **Auth → Email Templates → Magic Link** (optional): rewrite the email copy to feel like ALIF rather than the default Supabase template.

By default Supabase's email service has a low rate limit (great for development, bad for production). For real traffic, connect your own SMTP under **Auth → SMTP Settings**.

## 5 · (Optional) Enable Google OAuth

Skip this if you don't need it right now — magic link alone is enough to launch.

1. Go to <https://console.cloud.google.com>, create a project.
2. **APIs & Services → OAuth consent screen** → External → fill in app name, support email, etc.
3. **Credentials → Create credentials → OAuth client ID** → Web application.
   - **Authorized redirect URI**: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
   - (Get the exact URL from Supabase → Authentication → Providers → Google.)
4. Copy the **Client ID** and **Client Secret** into Supabase → **Authentication → Providers → Google**, then toggle it on.

That's it. The "Continue with Google" button on `/login` will work.

---

## Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

- Landing page CTAs route to `/login`
- Sign in via magic link → opens email → clicks link → `/auth/callback` → `/onboarding`
- Finish the 3-step wizard → `/dashboard`
- Edit anytime at `/dashboard/edit`
- Browse other builders at `/builders`, view public profiles at `/builders/{user-id}`

---

## Notes

- **Middleware redirects** (`middleware.ts`):
  - No session + visiting `/dashboard` or `/onboarding` → `/login`
  - Session + no profile + visiting `/dashboard` → `/onboarding`
  - Session + profile + visiting `/onboarding` or `/login` → `/dashboard`
- **Re-running SQL** is safe — DDL uses `if not exists` / `do $$` guards, and policies are dropped+recreated.
- **Email rate limit during testing**: Supabase free tier sends ~4 emails/hour. If you hit it, wait or use a different email.
- **Avatar storage**: files go to `avatars/{user_id}/avatar-{timestamp}.{ext}`. Old uploads are replaced when a user re-uploads.

## What's not here yet (future steps)

- Sprints feature (creating + applying; invitations table is already set up to receive them)
- Real verification logic — the `verified` flag exists but you flip it manually
- More trust badges (Sprint Finisher, Event Attendee, Mentor Endorsed all need their source features)
- Verified circles
- Notifications when someone is interested or invites you
