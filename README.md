# alif·build

The startup formation platform for ALIF builders. Find cofounders, run 7-day build sprints, post projects, earn trust, graduate into the Founder Circle.

Built on Next.js 14 (App Router), Supabase (Postgres + Auth + Storage), Tailwind, React Hook Form, Zod.

---

## Live demo

Deployed on Vercel: *(paste URL here once deployed)*

## Local setup

```bash
npm install
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Open <http://localhost:3000>.

Full setup including the four SQL migrations: see [`SETUP.md`](./SETUP.md).

## Database

Run the four SQL files **in order** in the Supabase SQL editor:

1. `supabase/schema.sql` — profiles, enums, RLS, avatars bucket
2. `supabase/discovery.sql` — interests, matches view, invitations
3. `supabase/platform.sql` — projects, sprints, applications, badges, levels, admin
4. `supabase/admin.sql` — admin policies for cross-user profile edits

Optional demo data:

5. `supabase/seed.sql` — 8 demo profiles
6. `supabase/seed-platform.sql` — 4 more profiles + projects + sprints + applications + sample matches

## Stack

- **Framework**: Next.js 14 (App Router, server actions, middleware)
- **Auth + DB**: Supabase (`@supabase/ssr` for SSR sessions)
- **Forms**: React Hook Form + Zod
- **Styling**: Tailwind, lucide-react for icons
- **Type-safe end-to-end**, RLS-enforced on every table

## Routes

| Path | What |
|---|---|
| `/` | Landing page with live news ticker |
| `/for-alif` | Strategic explainer (public) |
| `/login` | Magic link + email-password + Google OAuth |
| `/onboarding` | 3-step profile wizard |
| `/dashboard` | Personal profile view |
| `/dashboard/edit` | Re-run the wizard with prefilled data |
| `/builders` | Discovery with top-matches algorithm + filters |
| `/builders/[id]` | Public profile |
| `/projects` | Curated project board |
| `/projects/new` | Post a project |
| `/projects/[id]` | Project detail + application reviews |
| `/sprints` | All sprints, grouped by status |
| `/sprints/[id]` | Sprint detail + apply |
| `/circle` | Founder Circle (Level ≥ 3 only) |
| `/admin` | Admin dashboard (admins only) |

## Deploying to Vercel

1. Push this repo to GitHub.
2. <https://vercel.com/new> → Import the repo.
3. Add env vars in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_TELEMETRY_DISABLED=1`
4. Deploy. Vercel auto-detects Next.js.
5. In Supabase → **Authentication → URL Configuration**, add your Vercel domain to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/auth/callback`
