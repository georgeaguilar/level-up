-- Plantillas de rutina: un nombre libre ("Jalones", "Empuje", "Pecho") + una
-- lista ordenada de ejercicios. A propósito NO guardan series, reps ni peso:
-- eso se registra al entrenar. Aplicar una plantilla copia sus ejercicios al
-- final del workout del día (ver `applyTemplateToWorkout` en
-- src/app/(app)/templates/actions.ts).
--
-- Espejo casi exacto del par workouts / workout_exercises, con dos
-- divergencias deliberadas explicadas abajo: el cascade de `exercise_id` y
-- la unicidad del nombre.

-- ---------------------------------------------------------------------------
-- 1) routine_templates
-- ---------------------------------------------------------------------------
create table if not exists public.routine_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  created_at timestamptz not null default now()
);

-- Nombre único por usuario, ignorando mayúsculas y espacios de sobra:
-- "Push", "push " y "PUSH" son la misma plantilla. Índice de expresión (y no
-- `unique (user_id, name)`) porque la normalización tiene que vivir en el
-- índice; `lower()` y `btrim()` son IMMUTABLE, así que son válidas como
-- expresión indexable.
--
-- Este índice es además el índice de lectura de `where user_id = ...`
-- (user_id es su columna líder), así que no se crea un
-- `routine_templates_user_id_idx` aparte: sería redundante.
create unique index if not exists routine_templates_user_name_key
  on public.routine_templates (user_id, lower(btrim(name)));

alter table public.routine_templates enable row level security;

create policy "routine_templates_select_own" on public.routine_templates
  for select using (user_id = auth.uid());

create policy "routine_templates_insert_own" on public.routine_templates
  for insert with check (user_id = auth.uid());

create policy "routine_templates_update_own" on public.routine_templates
  for update using (user_id = auth.uid());

create policy "routine_templates_delete_own" on public.routine_templates
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 2) routine_template_exercises (ejercicios de una plantilla, ordenados)
-- ---------------------------------------------------------------------------
create table if not exists public.routine_template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.routine_templates (id) on delete cascade,
  -- OJO: aquí sí va `on delete cascade`, al revés que en workout_exercises.
  -- workout_exercises es historial: borrar un ejercicio del catálogo no debe
  -- poder borrar series ya registradas, por eso ahí el FK restringe. Una
  -- plantilla es solo un plan sin datos; si el ejercicio deja de existir, la
  -- fila queda sin sentido y lo correcto es que desaparezca con él (si no,
  -- borrar un ejercicio propio quedaría bloqueado para siempre).
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Un ejercicio no se repite dentro de la misma plantilla: sin series ni reps,
-- una segunda fila del mismo ejercicio no aporta información. Las acciones
-- del servidor ya lo comprueban antes de insertar (y salen sin error); este
-- índice es la segunda capa, igual que RLS lo es de `assertOwns*`.
--
-- Sirve también como índice de lectura de `where template_id = ...`
-- (template_id es la columna líder), así que no se crea un
-- `routine_template_exercises_template_id_idx` aparte.
create unique index if not exists routine_template_exercises_template_exercise_key
  on public.routine_template_exercises (template_id, exercise_id);

alter table public.routine_template_exercises enable row level security;

create policy "routine_template_exercises_select_own" on public.routine_template_exercises
  for select using (
    exists (
      select 1 from public.routine_templates t
      where t.id = routine_template_exercises.template_id and t.user_id = auth.uid()
    )
  );

create policy "routine_template_exercises_insert_own" on public.routine_template_exercises
  for insert with check (
    exists (
      select 1 from public.routine_templates t
      where t.id = routine_template_exercises.template_id and t.user_id = auth.uid()
    )
  );

create policy "routine_template_exercises_update_own" on public.routine_template_exercises
  for update using (
    exists (
      select 1 from public.routine_templates t
      where t.id = routine_template_exercises.template_id and t.user_id = auth.uid()
    )
  );

create policy "routine_template_exercises_delete_own" on public.routine_template_exercises
  for delete using (
    exists (
      select 1 from public.routine_templates t
      where t.id = routine_template_exercises.template_id and t.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 3) Índices y constraints que NO se crean, y por qué
-- ---------------------------------------------------------------------------
--   * `routine_templates (user_id)` → redundante: routine_templates_user_name_key
--     ya tiene user_id como columna líder.
--   * `routine_template_exercises (template_id)` → redundante por lo mismo con
--     routine_template_exercises_template_exercise_key.
--   * `routine_template_exercises (exercise_id)` → el FK con cascade obliga a
--     Postgres a recorrer la tabla hija al borrar un ejercicio, pero borrar
--     ejercicios propios es rarísimo (hoy ni siquiera hay UI) y la tabla cabe
--     en unos pocos cientos de filas por usuario. Se añadirá si algún día se
--     borra catálogo en masa.
--   * `unique (template_id, position)` → a propósito no existe: reordenar es
--     un swap de dos filas y con esa constraint el estado intermedio (dos
--     filas con la misma posición) reventaría, obligando a un valor temporal
--     o a `deferrable initially deferred`. Las posiciones se derivan de
--     max(position)+1 en la acción, que ya evita colisiones al insertar.
--   * `updated_at` → nada lo lee; el orden de la lista es por nombre.
-- ---------------------------------------------------------------------------
