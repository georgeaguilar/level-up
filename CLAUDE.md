# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev     # start dev server (Next.js 16, Turbopack)
npm run build   # production build
npm run start   # run production build
npm run lint    # eslint (flat config: eslint-config-next core-web-vitals + typescript)
```

There is no test suite configured in this repo.

Database schema lives in `supabase/migrations/0001_init.sql` (apply via the Supabase SQL editor or CLI); `supabase/seed.sql` has seed data. Env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are in `.env.local`, documented in `.env.example`.

## Architecture

Level Up is a personal workout tracker: Next.js App Router + Supabase (Postgres with RLS, no ORM — queries go through the `@supabase/supabase-js` query builder directly).

**Route groups**: `src/app/(auth)` (login/signup, unauthenticated) and `src/app/(app)` (dashboard `/`, `/history`, `/progress`, `/workouts/[id]`, all require a session). Each group has its own `layout.tsx`.

**Auth is enforced in two layers, both required**:
- `src/proxy.ts` — Next 16's replacement for `middleware.ts` (same API, new filename). Does an optimistic cookie-based redirect (unauthenticated → `/login`, authenticated on `/login`|`/signup` → `/`). This is a fast UX check only.
- `src/lib/dal.ts` — `verifySession()` is the real authorization boundary, called at the top of every data-access function and re-checked with `supabase.auth.getUser()`. Wrapped in React's `cache()` so it dedupes within a render. Treat DAL functions, not the proxy, as the source of truth for "is this request allowed."

**Data access pattern**: all reads live in `src/lib/dal.ts` (marked `import "server-only"`), all writes are Server Actions in `src/app/(app)/workouts/actions.ts` and `src/app/(auth)/actions.ts` (`"use server"`). Every mutation validates input with `zod`, then calls an `assertOwnsWorkout`/`assertOwnsWorkoutExercise` helper before touching the DB — RLS policies in the migration double as a second enforcement layer, but ownership is also checked in application code. Mutations call `revalidatePath` on the affected routes rather than returning data for the client to merge.

**Supabase clients** (`src/lib/supabase/`): `client.ts` for Client Components, `server.ts` for Server Components/Actions (cookie-based, can't write cookies from a pure Server Component — that's expected, the proxy handles session refresh). Don't add a third client variant; extend one of these two.

**Data model** (`src/lib/types.ts` mirrors `supabase/migrations/0001_init.sql`): `Workout` (one per user per calendar date, enforced by a unique constraint) has many `WorkoutExercise` (an exercise instance within that workout, ordered by `position`), which has many `ExerciseSet` for strength exercises or a single `duration_seconds` for cardio. `Exercise` rows are either global catalog entries (`user_id is null`) or user-created custom ones. Progress math (1RM via Epley formula, volume, unit conversion lb→kg) lives in `getExerciseProgress`/`getCardioProgress` in `dal.ts`.

**Rendering approach**: components default to Server Components rendering plain `<form action={serverAction}>` — no client-side form state or fetch calls for mutations (see `exercise-picker.tsx`, `set-rows.tsx`, `cardio-duration.tsx`). `"use client"` is reserved for actual interactivity: `auth-form.tsx` (`useActionState` for pending/error UI) and `progress-chart.tsx` (Recharts).

**UI copy is in Spanish** throughout (labels, error messages, code comments in `dal.ts`/`proxy.ts`/actions files). Match this when adding user-facing text or comments in those areas.

Styling is Tailwind v4 (CSS-based config via `@theme inline` in `src/app/globals.css`, no `tailwind.config.ts`).
