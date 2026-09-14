# Level Up

Level Up is a personal workout tracker built with Next.js and Supabase. Log strength and cardio workouts, track sets/reps/weight or duration, review progress over time (1RM, volume, personal records), and organize routines with reusable templates.

## Tech stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS v4, [Recharts](https://recharts.org) for progress charts
- **Backend:** [Supabase](https://supabase.com) (Postgres with Row Level Security, no ORM — queries go through `@supabase/supabase-js`/`@supabase/ssr` directly)
- **Validation:** [Zod](https://zod.dev) on every Server Action
- **Language:** TypeScript
- **i18n:** built-in Spanish/English support (UI defaults to Spanish)
- Installable as a PWA (manifest + icons, add-to-home-screen prompt)

## Getting started

### Prerequisites

- Node.js, pinned via [`.nvmrc`](.nvmrc) (`22.13.0`). Run `nvm use` before installing dependencies — this matters especially on Apple Silicon, where a mismatched Node can pull x64 native binaries (Supabase CLI, `@next/swc`, `lightningcss`) that crash under Rosetta.
- A [Supabase](https://supabase.com) project (free tier is enough) for the database and auth.

### Setup

1. Install dependencies:

   ```bash
   nvm use
   npm install
   ```

2. Configure environment variables. Copy `.env.example` to `.env.local` and fill in your Supabase project's credentials (**Project Settings → API** in the Supabase dashboard):

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Description |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase project's anon/public API key |

3. Apply the database schema. Migrations live in `supabase/migrations/` and are applied via the Supabase CLI (`supabase` is a devDependency, no global install needed):

   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npm run db:push
   ```

   Optionally seed the exercise catalog and sample data with `supabase/seed.sql` (run it by hand via the Supabase SQL editor or `supabase db execute -f supabase/seed.sql`).

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). You'll land on `/login` — create an account from there.

### Available scripts

```bash
npm run dev       # start dev server (Next.js, Turbopack)
npm run build     # production build
npm run start     # run production build
npm run lint      # eslint
npm run db:new    # create a new timestamped migration file
npm run db:status # compare local vs. remote migration state
npm run db:push   # apply local migrations to the linked Supabase project
```

There is no test suite configured in this repo.

## Project structure

```
src/
  app/
    (auth)/            # /login, /signup — unauthenticated route group
    (app)/              # dashboard (/), /history, /progress, /workouts/[id],
                         # /templates, /profile — all require a session
    layout.tsx, globals.css, manifest.ts, icons
  components/           # server components by default; "use client" only where interactive
  lib/
    dal.ts               # data access layer — all reads, session verification
    supabase/            # Supabase client factories (browser + server)
    types.ts             # shared types mirroring the DB schema
    authz.ts             # ownership assertions used by Server Actions
  i18n/                  # es/en dictionaries and locale helpers
  proxy.ts               # Next 16's middleware.ts equivalent — optimistic auth redirect
supabase/
  migrations/            # incremental SQL schema, applied via Supabase CLI
  seed.sql                # sample/reference data (not run automatically)
```

## Architecture overview

- **Auth** is enforced in two layers: `src/proxy.ts` does a fast, optimistic cookie-based redirect for UX, while `src/lib/dal.ts`'s `verifySession()` is the real authorization boundary — it re-checks the session against Supabase and is called at the top of every data-access function.
- **Data access**: all reads live in `src/lib/dal.ts` (server-only). All writes are Server Actions (`"use server"`), primarily in `src/app/(app)/workouts/actions.ts`, `src/app/(app)/templates/actions.ts`, and `src/app/(auth)/actions.ts`. Every mutation validates input with Zod and checks ownership in application code, backed by Postgres RLS policies as a second layer. Mutations call `revalidatePath` instead of returning data for client-side merging.
- **Data model**: a `Workout` (one per user per calendar date) has many `WorkoutExercise` entries (ordered by `position`), each of which has many `ExerciseSet`s for strength exercises or a single `duration_seconds` for cardio. `Exercise` rows are either global catalog entries or user-created custom ones. `RoutineTemplate`s let you save a reusable list of exercises to start a workout from. Progress math (1RM via the Epley formula, volume, personal records, unit conversion) lives in `getExerciseProgress`/`getCardioProgress`/dashboard helpers in `dal.ts`.
- **Rendering**: components default to Server Components using plain `<form action={serverAction}>` for mutations — no client-side fetch calls. `"use client"` is reserved for actual interactivity (e.g. auth form pending state, progress charts).

See [`CLAUDE.md`](CLAUDE.md) and [`AGENTS.md`](AGENTS.md) for more detailed, code-agent-oriented notes on these conventions.

## Database migrations

Schema changes are SQL files in `supabase/migrations/`, applied automatically: pushing a new migration to `main` runs `.github/workflows/db-migrate.yml`, which executes `supabase db push --linked` against the hosted project. To add a migration:

```bash
npm run db:new <name>   # creates supabase/migrations/<timestamp>_<name>.sql
# write the incremental SQL — never edit a migration that has already been pushed
git add supabase/migrations
git commit -m "..."
git push
```

## Contributing

- UI copy is in Spanish throughout (labels, error messages); match this convention for user-facing text.
- Run `npm run lint` before submitting changes.
- Commits and PR titles follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.) — this is enforced by CI on pull requests.
