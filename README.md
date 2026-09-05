# Gamtaa Barattoota Tuulaa (GBT) — Platform

**Phase 1** — public website · **Phase 2** — Supabase backend, authentication & student
registration. Built on the philosophy **LEARN → RETURN → SERVE → IMPACT**.

## Stack

- **Next.js 16** (App Router, TypeScript), **Tailwind CSS v4**, **shadcn/ui**
- **Supabase** — Postgres + Auth + Storage (`@supabase/ssr` cookie-based sessions)
- Dependency-free accessible SVG charts & lightbox

## Getting started

```bash
npm install
cp .env.example .env.local        # add your Supabase project credentials
npm run dev                       # http://localhost:3000
npm run lint                      # eslint
./node_modules/.bin/tsc --noEmit  # typecheck
npm run build                     # production build
```

Without `.env.local` the site runs in **preview mode**: the full public website works,
auth pages explain that the backend is not connected, and the contact form shows a
"demo mode" note instead of persisting.

## Routes

| Route                | Purpose |
| -------------------- | ------- |
| `/` `/about` `/programs` `/programs/[slug]` `/impact` `/gallery` `/team` `/contact` | Public website (Phase 1) |
| `/register`          | Supabase sign-up (email verification, metadata: full name, phone) |
| `/login`             | Sign in (`next` redirect support) |
| `/forgot-password`   | Reset link → `/auth/callback` → new-password step |
| `/auth/callback`     | Code-exchange route for verification & reset emails |
| `/join`              | Protected 7-step student registration wizard + application status |
| `/student`           | Protected student area (profile, skills, application status) |

## Database (supabase/migrations/0001_initial_schema.sql)

Tables: `profiles` (roles: student/admin/super_admin), `student_profiles`,
`student_skills`, `applications` (status enum; `GBT-APP-YYYY-NNNN` numbers assigned by a
trigger + sequence), `contact_messages`. Storage buckets: `avatars`, `gallery`,
`team-photos`, `program-images`.

Security model:

- A `security definer` trigger creates a `profiles` row on signup.
- **RLS everywhere**: students can read/write *only* their own profile, student
  profile, skills, and application; students cannot change their own role or
  application status; `anon` sees nothing; `contact_messages` is written only by the
  **service role** (server-side, never exposed to the browser); admins get read/review
  via `public.is_admin()`.
- Storage: avatar uploads only into `avatars/{auth.uid()}/…`; content buckets are
  public-read, admin-write.

Apply with `supabase db push` (or paste into the SQL editor), then run the migration
once. No seed required.

## Verifying the backend locally (no hosted project needed)

`supabase/tests/run_tests.sh` spins up a throwaway Postgres database with a minimal
Supabase stub (`auth.uid()`, `auth.users` trigger surface, `storage` schema, API roles)
and executes the **real migration**, then asserts 33 RLS/behavior scenarios (ownership,
cross-student denial, role-escalation denial, application numbering, storage policies,
admin review, service-role-only contact writes). Requires local Postgres:

```bash
sudo apt-get install -y postgresql   # once
./supabase/tests/run_tests.sh        # => RESULT: 33 passed, 0 failed
```

Latest run on this repo: **33 passed, 0 failed** (PostgreSQL 17).

App-level flows (sign-up email, login, wizard submission) require real project
credentials in `.env.local`; all code paths degrade gracefully without them.

## Phase 3 — student dashboard, programs & service tracking

Routes (all protected; unauthenticated users are redirected to `/login`):

| Route | Purpose |
| ----- | ------- |
| `/student/dashboard` | Welcome, application status, program counts, **total verified service hours**, certificates, active/upcoming/completed programs |
| `/student/profile` | Edit allowed fields (personal info, avatar, university, skills, availability, bio). Role/status/hours are not editable |
| `/student/programs` + `/student/programs/[id]` | Browse/search/filter DB programs, view details, join |
| `/student/my-programs` | Upcoming / active / completed with per-program verified hours & completion state |
| `/student/service-history` | Filterable table (program/status/date) + submit pending service records |
| `/student/notifications` | Inbox with unread badge in sidebar; mark one/all read |
| `/student/certificates` | Issued certificates (number, hours, date, status) |
| `/student/settings` | Account email + change password |

Database (`supabase/migrations/0002_student_portal.sql`): `programs`,
`program_participants`, `service_records`, `notifications`, `certificates`
(+ `availability_start/end` on `student_profiles`). Security model:

- Students insert only their own participations (`registered`) and service records
  (`pending`); verification, review, and issuance are admin/service-role only
  (students lack even the UPDATE grant on `service_records`).
- `public.my_verified_hours()` sums **verified** records only — the dashboard total.
- Security-definer triggers create notifications on application decisions, enrollment
  acceptance, service verification, and certificate issuance; students can only read
  their own inbox and flip `read`.
- Certificate numbers: `GBT-CERT-YYYY-NNNN` via trigger + sequence.
- `supabase/seed.sql` loads five demo programs for fresh projects.

The sidebar shell lives in `src/components/student/student-shell.tsx`; server actions in
`src/lib/actions/student.ts`.

Verification (this repo): `supabase/tests/run_tests.sh` runs both migrations on a local
Postgres 17 and asserts **54 scenarios** — latest run: 54 passed, 0 failed — covering all
Phase 3 rules (join flow, pending-only submission, no self-verify, verified-hours math,
notification triggers, certificate numbering, cross-student privacy).

## Phase 2 architecture notes

- `src/lib/supabase/` — `config.ts` (env gate), `client.ts` (browser), `server.ts`
  (SSR cookies), `admin.ts` (service role, throws in browser), `middleware.ts`
  (session refresh + `/student` protection).
- Server actions in `src/lib/actions/` — `auth.ts`, `application.ts`, `contact.ts`.
- The Phase 1 public pages still read from the typed demo-data seam in
  `src/lib/data/*`; point those modules at Supabase queries in a later phase.

Not built yet (by design): admin dashboard, certificates, advanced program management.

© 2026 Gamtaa Barattoota Tuulaa. All rights reserved.
# Gamtaa-Barattoota-Tuulaa-GBT-
# Gamtaa-Barattoota-Tuulaa-GBT-
