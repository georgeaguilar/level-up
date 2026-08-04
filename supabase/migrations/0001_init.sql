-- Level Up: schema inicial
-- Pega esto en el SQL Editor de Supabase (o usa la CLI de supabase).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- crea el profile automáticamente cuando se registra un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- exercises (catálogo global + ejercicios propios)
-- ---------------------------------------------------------------------------
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('strength', 'cardio')),
  muscle_group text,
  created_at timestamptz not null default now()
);

create index if not exists exercises_user_id_idx on public.exercises (user_id);

alter table public.exercises enable row level security;

create policy "exercises_select_global_or_own" on public.exercises
  for select using (user_id is null or user_id = auth.uid());

create policy "exercises_insert_own" on public.exercises
  for insert with check (user_id = auth.uid());

create policy "exercises_update_own" on public.exercises
  for update using (user_id = auth.uid());

create policy "exercises_delete_own" on public.exercises
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- workouts (un entrenamiento por usuario/fecha)
-- ---------------------------------------------------------------------------
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists workouts_user_date_idx on public.workouts (user_id, date desc);

alter table public.workouts enable row level security;

create policy "workouts_select_own" on public.workouts
  for select using (user_id = auth.uid());

create policy "workouts_insert_own" on public.workouts
  for insert with check (user_id = auth.uid());

create policy "workouts_update_own" on public.workouts
  for update using (user_id = auth.uid());

create policy "workouts_delete_own" on public.workouts
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- workout_exercises (ejercicios agregados a un entrenamiento del día)
-- ---------------------------------------------------------------------------
create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id),
  position int not null default 0,
  duration_seconds int, -- solo para ejercicios de cardio
  created_at timestamptz not null default now()
);

create index if not exists workout_exercises_workout_id_idx on public.workout_exercises (workout_id);

alter table public.workout_exercises enable row level security;

create policy "workout_exercises_select_own" on public.workout_exercises
  for select using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_exercises.workout_id and w.user_id = auth.uid()
    )
  );

create policy "workout_exercises_insert_own" on public.workout_exercises
  for insert with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_exercises.workout_id and w.user_id = auth.uid()
    )
  );

create policy "workout_exercises_update_own" on public.workout_exercises
  for update using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_exercises.workout_id and w.user_id = auth.uid()
    )
  );

create policy "workout_exercises_delete_own" on public.workout_exercises
  for delete using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_exercises.workout_id and w.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- exercise_sets (series de un ejercicio de pesas)
-- ---------------------------------------------------------------------------
create table if not exists public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises (id) on delete cascade,
  set_number int not null,
  reps int not null,
  weight numeric(6, 2) not null,
  unit text not null default 'kg' check (unit in ('kg', 'lb')),
  created_at timestamptz not null default now()
);

create index if not exists exercise_sets_workout_exercise_id_idx on public.exercise_sets (workout_exercise_id);

alter table public.exercise_sets enable row level security;

create policy "exercise_sets_select_own" on public.exercise_sets
  for select using (
    exists (
      select 1 from public.workout_exercises we
      join public.workouts w on w.id = we.workout_id
      where we.id = exercise_sets.workout_exercise_id and w.user_id = auth.uid()
    )
  );

create policy "exercise_sets_insert_own" on public.exercise_sets
  for insert with check (
    exists (
      select 1 from public.workout_exercises we
      join public.workouts w on w.id = we.workout_id
      where we.id = exercise_sets.workout_exercise_id and w.user_id = auth.uid()
    )
  );

create policy "exercise_sets_update_own" on public.exercise_sets
  for update using (
    exists (
      select 1 from public.workout_exercises we
      join public.workouts w on w.id = we.workout_id
      where we.id = exercise_sets.workout_exercise_id and w.user_id = auth.uid()
    )
  );

create policy "exercise_sets_delete_own" on public.exercise_sets
  for delete using (
    exists (
      select 1 from public.workout_exercises we
      join public.workouts w on w.id = we.workout_id
      where we.id = exercise_sets.workout_exercise_id and w.user_id = auth.uid()
    )
  );
