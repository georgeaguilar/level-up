-- Amplía el catálogo global de ejercicios: equipo, agarre, mecánica, nombre en
-- inglés y un slug estable. Corre después de 20260804125350_init.sql.
--
-- Orden importante:
--   1) columnas nuevas
--   2) dedupe defensivo de filas globales repetidas (seed.sql no era idempotente)
--   3) backfill de slug en las 17 filas ya sembradas, por nombre
--   4) índice único parcial sobre slug (necesario como target del upsert)
--   5) upsert del catálogo completo (~240 ejercicios) — esto también normaliza
--      muscle_group/equipment de las 17 filas legadas a los nuevos slugs
--   6) check constraints sobre los vocabularios (después del upsert, para no
--      fallar la validación contra los valores viejos en español)
--   7) índice en workout_exercises.exercise_id, que faltaba

-- ---------------------------------------------------------------------------
-- 1) columnas nuevas
-- ---------------------------------------------------------------------------
alter table public.exercises
  add column if not exists slug text,
  add column if not exists name_en text,
  add column if not exists equipment text,
  add column if not exists grip text,
  add column if not exists mechanic text,
  add column if not exists is_unilateral boolean not null default false;

-- ---------------------------------------------------------------------------
-- 2) dedupe defensivo: `seed.sql` usaba `on conflict do nothing` sin target
-- (no-op) y sin índice único en `name`, así que re-aplicarlo duplicó filas.
-- Solo borra duplicados globales no referenciados por ningún workout.
-- ---------------------------------------------------------------------------
with dupes as (
  select id, name,
         row_number() over (partition by name order by created_at asc, id asc) as rn
  from public.exercises
  where user_id is null
)
delete from public.exercises e
using dupes d
where e.id = d.id
  and d.rn > 1
  and not exists (
    select 1 from public.workout_exercises we where we.exercise_id = e.id
  );

-- ---------------------------------------------------------------------------
-- 3) backfill de slug en las 17 filas sembradas originalmente, por nombre,
-- para que el upsert del paso 5 las actualice en vez de duplicarlas.
--
-- Se actualiza solo la fila más antigua por nombre (subconsulta `id = ...
-- order by created_at asc, id asc limit 1`) en vez de todas las que
-- coincidan: así, si el paso 2 dejara vivas dos filas con el mismo nombre
-- (p. ej. porque una estaba referenciada por un workout y sobrevivió al
-- dedupe), este paso nunca les asigna el mismo slug a las dos — evita que
-- el índice único del paso 4 rompa la migración entera.
-- ---------------------------------------------------------------------------
update public.exercises e set slug = v.slug
from (values
  ('Press de banca', 'barbell-bench-press'),
  ('Press inclinado con mancuernas', 'incline-dumbbell-bench-press'),
  ('Sentadilla', 'barbell-back-squat'),
  ('Peso muerto', 'barbell-deadlift'),
  ('Press militar', 'barbell-overhead-press'),
  ('Remo con barra', 'barbell-bent-over-row'),
  ('Dominadas', 'pull-up'),
  ('Curl de bíceps', 'barbell-biceps-curl'),
  ('Extensión de tríceps', 'cable-triceps-pushdown'),
  ('Zancadas', 'dumbbell-walking-lunge'),
  ('Elevaciones laterales', 'dumbbell-lateral-raise'),
  ('Hip thrust', 'barbell-hip-thrust'),
  ('Correr', 'running'),
  ('Bicicleta', 'cycling'),
  ('Elíptica', 'elliptical'),
  ('Remo (cardio)', 'rowing-machine'),
  ('Cuerda', 'jump-rope')
) as v(name, slug)
where e.user_id is null
  and e.name = v.name
  and e.id = (
    select e2.id from public.exercises e2
    where e2.user_id is null and e2.name = v.name
    order by e2.created_at asc, e2.id asc
    limit 1
  );

-- ---------------------------------------------------------------------------
-- 4) índice único parcial sobre slug — target del `on conflict` del paso 5.
-- ---------------------------------------------------------------------------
create unique index if not exists exercises_catalog_slug_key
  on public.exercises (slug)
  where user_id is null;

-- ---------------------------------------------------------------------------
-- 5) catálogo completo. Todas las filas van sin `user_id` (= catálogo global).
-- Idempotente: `on conflict (slug) where user_id is null do update` permite
-- reaplicar la migración o ampliar el catálogo en migraciones futuras.
-- ---------------------------------------------------------------------------

-- pecho ------------------------------------------------------------------
insert into public.exercises (slug, name, name_en, kind, muscle_group, equipment, grip, mechanic, is_unilateral) values
  ('barbell-bench-press', 'Press de banca con barra', 'Barbell Bench Press', 'strength', 'chest', 'barbell', 'overhand', 'compound', false),
  ('dumbbell-bench-press', 'Press de banca con mancuernas', 'Dumbbell Bench Press', 'strength', 'chest', 'dumbbell', 'neutral', 'compound', false),
  ('incline-barbell-bench-press', 'Press inclinado con barra', 'Incline Barbell Bench Press', 'strength', 'chest', 'barbell', 'overhand', 'compound', false),
  ('incline-dumbbell-bench-press', 'Press inclinado con mancuernas', 'Incline Dumbbell Bench Press', 'strength', 'chest', 'dumbbell', 'neutral', 'compound', false),
  ('decline-barbell-bench-press', 'Press declinado con barra', 'Decline Barbell Bench Press', 'strength', 'chest', 'barbell', 'overhand', 'compound', false),
  ('decline-dumbbell-bench-press', 'Press declinado con mancuernas', 'Decline Dumbbell Bench Press', 'strength', 'chest', 'dumbbell', 'neutral', 'compound', false),
  ('smith-machine-bench-press', 'Press de banca en máquina Smith', 'Smith Machine Bench Press', 'strength', 'chest', 'smith', 'overhand', 'compound', false),
  ('machine-chest-press', 'Press de pecho en máquina', 'Machine Chest Press', 'strength', 'chest', 'machine', 'neutral', 'compound', false),
  ('incline-machine-chest-press', 'Press de pecho inclinado en máquina', 'Incline Machine Chest Press', 'strength', 'chest', 'machine', 'neutral', 'compound', false),
  ('cable-chest-press', 'Press de pecho en polea', 'Cable Chest Press', 'strength', 'chest', 'cable', 'neutral', 'compound', false),
  ('cable-crossover-high-to-low', 'Cruce en polea alta', 'High-to-Low Cable Crossover', 'strength', 'chest', 'cable', 'neutral', 'isolation', false),
  ('cable-crossover-low-to-high', 'Cruce en polea baja', 'Low-to-High Cable Crossover', 'strength', 'chest', 'cable', 'neutral', 'isolation', false),
  ('dumbbell-fly', 'Aperturas con mancuernas', 'Dumbbell Fly', 'strength', 'chest', 'dumbbell', 'neutral', 'isolation', false),
  ('incline-dumbbell-fly', 'Aperturas inclinadas con mancuernas', 'Incline Dumbbell Fly', 'strength', 'chest', 'dumbbell', 'neutral', 'isolation', false),
  ('pec-deck-machine-fly', 'Aperturas en máquina contractora', 'Pec Deck Machine Fly', 'strength', 'chest', 'machine', 'neutral', 'isolation', false),
  ('push-up', 'Flexiones', 'Push-Up', 'strength', 'chest', 'bodyweight', 'wide', 'compound', false),
  ('incline-push-up', 'Flexiones inclinadas', 'Incline Push-Up', 'strength', 'chest', 'bodyweight', 'wide', 'compound', false),
  ('decline-push-up', 'Flexiones declinadas', 'Decline Push-Up', 'strength', 'chest', 'bodyweight', 'wide', 'compound', false),
  ('diamond-push-up', 'Flexiones de diamante', 'Diamond Push-Up', 'strength', 'chest', 'bodyweight', 'close', 'compound', false),
  ('weighted-dip-chest', 'Fondos con peso (pecho)', 'Weighted Chest Dip', 'strength', 'chest', 'bodyweight', 'neutral', 'compound', false),
  ('dip-machine-chest', 'Fondos en máquina asistida', 'Assisted Dip Machine', 'strength', 'chest', 'machine', 'neutral', 'compound', false),
  ('resistance-band-chest-press', 'Press de pecho con banda', 'Resistance Band Chest Press', 'strength', 'chest', 'band', 'neutral', 'compound', false),
  ('svend-press', 'Press Svend', 'Svend Press', 'strength', 'chest', 'plate', 'neutral', 'isolation', false),
  ('landmine-press', 'Press landmine', 'Landmine Press', 'strength', 'chest', 'barbell', 'neutral', 'compound', true),
  ('incline-cable-fly', 'Aperturas inclinadas en polea', 'Incline Cable Fly', 'strength', 'chest', 'cable', 'neutral', 'isolation', false)
on conflict (slug) where user_id is null do update set
  name = excluded.name, name_en = excluded.name_en, kind = excluded.kind,
  muscle_group = excluded.muscle_group, equipment = excluded.equipment,
  grip = excluded.grip, mechanic = excluded.mechanic, is_unilateral = excluded.is_unilateral;

-- espalda (general/lumbar) -------------------------------------------------
insert into public.exercises (slug, name, name_en, kind, muscle_group, equipment, grip, mechanic, is_unilateral) values
  ('barbell-deadlift', 'Peso muerto con barra', 'Barbell Deadlift', 'strength', 'back', 'barbell', 'overhand', 'compound', false),
  ('sumo-deadlift', 'Peso muerto sumo', 'Sumo Deadlift', 'strength', 'back', 'barbell', 'overhand', 'compound', false),
  ('mixed-grip-deadlift', 'Peso muerto agarre mixto', 'Mixed-Grip Deadlift', 'strength', 'back', 'barbell', 'mixed', 'compound', false),
  ('trap-bar-deadlift', 'Peso muerto con barra hexagonal', 'Trap Bar Deadlift', 'strength', 'back', 'barbell', 'neutral', 'compound', false),
  ('barbell-bent-over-row', 'Remo con barra', 'Barbell Bent-Over Row', 'strength', 'back', 'barbell', 'overhand', 'compound', false),
  ('barbell-bent-over-row-underhand', 'Remo con barra agarre supino', 'Underhand Barbell Bent-Over Row', 'strength', 'back', 'barbell', 'underhand', 'compound', false),
  ('pendlay-row', 'Remo Pendlay', 'Pendlay Row', 'strength', 'back', 'barbell', 'overhand', 'compound', false),
  ('t-bar-row', 'Remo en T', 'T-Bar Row', 'strength', 'back', 'machine', 'neutral', 'compound', false),
  ('dumbbell-one-arm-row', 'Remo a una mano con mancuerna', 'One-Arm Dumbbell Row', 'strength', 'back', 'dumbbell', 'neutral', 'compound', true),
  ('seated-cable-row-wide', 'Remo sentado en polea agarre abierto', 'Wide-Grip Seated Cable Row', 'strength', 'back', 'cable', 'wide', 'compound', false),
  ('seated-cable-row-close', 'Remo sentado en polea agarre cerrado', 'Close-Grip Seated Cable Row', 'strength', 'back', 'cable', 'close', 'compound', false),
  ('machine-row', 'Remo en máquina', 'Machine Row', 'strength', 'back', 'machine', 'neutral', 'compound', false),
  ('chest-supported-row', 'Remo con soporte en pecho', 'Chest-Supported Row', 'strength', 'back', 'machine', 'neutral', 'compound', false),
  ('good-morning', 'Buenos días', 'Good Morning', 'strength', 'back', 'barbell', 'overhand', 'compound', false),
  ('back-extension', 'Extensión de espalda (hiperextensión)', 'Back Extension', 'strength', 'back', 'bodyweight', null, 'compound', false),
  ('superman', 'Superman', 'Superman', 'strength', 'back', 'bodyweight', null, 'isolation', false)
on conflict (slug) where user_id is null do update set
  name = excluded.name, name_en = excluded.name_en, kind = excluded.kind,
  muscle_group = excluded.muscle_group, equipment = excluded.equipment,
  grip = excluded.grip, mechanic = excluded.mechanic, is_unilateral = excluded.is_unilateral;

-- dorsales ------------------------------------------------------------------
insert into public.exercises (slug, name, name_en, kind, muscle_group, equipment, grip, mechanic, is_unilateral) values
  ('pull-up', 'Dominadas', 'Pull-Up', 'strength', 'lats', 'bodyweight', 'overhand', 'compound', false),
  ('chin-up', 'Dominadas supinas', 'Chin-Up', 'strength', 'lats', 'bodyweight', 'underhand', 'compound', false),
  ('neutral-grip-pull-up', 'Dominadas agarre neutro', 'Neutral-Grip Pull-Up', 'strength', 'lats', 'bodyweight', 'neutral', 'compound', false),
  ('wide-grip-pull-up', 'Dominadas agarre abierto', 'Wide-Grip Pull-Up', 'strength', 'lats', 'bodyweight', 'wide', 'compound', false),
  ('assisted-pull-up-machine', 'Dominadas asistidas en máquina', 'Assisted Pull-Up Machine', 'strength', 'lats', 'machine', 'overhand', 'compound', false),
  ('lat-pulldown-wide', 'Jalón al pecho agarre abierto', 'Wide-Grip Lat Pulldown', 'strength', 'lats', 'cable', 'wide', 'compound', false),
  ('lat-pulldown-close', 'Jalón al pecho agarre cerrado', 'Close-Grip Lat Pulldown', 'strength', 'lats', 'cable', 'close', 'compound', false),
  ('lat-pulldown-underhand', 'Jalón al pecho agarre supino', 'Underhand Lat Pulldown', 'strength', 'lats', 'cable', 'underhand', 'compound', false),
  ('lat-pulldown-neutral', 'Jalón al pecho agarre neutro', 'Neutral-Grip Lat Pulldown', 'strength', 'lats', 'cable', 'neutral', 'compound', false),
  ('straight-arm-pulldown', 'Jalón con brazos rectos', 'Straight-Arm Pulldown', 'strength', 'lats', 'cable', 'overhand', 'isolation', false),
  ('single-arm-lat-pulldown', 'Jalón a un brazo', 'Single-Arm Lat Pulldown', 'strength', 'lats', 'cable', 'neutral', 'compound', true)
on conflict (slug) where user_id is null do update set
  name = excluded.name, name_en = excluded.name_en, kind = excluded.kind,
  muscle_group = excluded.muscle_group, equipment = excluded.equipment,
  grip = excluded.grip, mechanic = excluded.mechanic, is_unilateral = excluded.is_unilateral;

-- trapecios -------------------------------------------------------------
insert into public.exercises (slug, name, name_en, kind, muscle_group, equipment, grip, mechanic, is_unilateral) values
  ('barbell-shrug', 'Encogimientos con barra', 'Barbell Shrug', 'strength', 'traps', 'barbell', 'overhand', 'isolation', false),
  ('dumbbell-shrug', 'Encogimientos con mancuernas', 'Dumbbell Shrug', 'strength', 'traps', 'dumbbell', 'neutral', 'isolation', false),
  ('cable-shrug', 'Encogimientos en polea', 'Cable Shrug', 'strength', 'traps', 'cable', 'overhand', 'isolation', false),
  ('smith-machine-shrug', 'Encogimientos en máquina Smith', 'Smith Machine Shrug', 'strength', 'traps', 'smith', 'overhand', 'isolation', false),
  ('face-pull', 'Face pull', 'Face Pull', 'strength', 'traps', 'cable', 'overhand', 'isolation', false),
  ('upright-row-barbell', 'Remo al mentón con barra', 'Barbell Upright Row', 'strength', 'traps', 'barbell', 'overhand', 'compound', false),
  ('upright-row-cable', 'Remo al mentón en polea', 'Cable Upright Row', 'strength', 'traps', 'cable', 'overhand', 'compound', false),
  ('rack-pull', 'Rack pull', 'Rack Pull', 'strength', 'traps', 'barbell', 'overhand', 'compound', false)
on conflict (slug) where user_id is null do update set
  name = excluded.name, name_en = excluded.name_en, kind = excluded.kind,
  muscle_group = excluded.muscle_group, equipment = excluded.equipment,
  grip = excluded.grip, mechanic = excluded.mechanic, is_unilateral = excluded.is_unilateral;

-- cuádriceps ------------------------------------------------------------
insert into public.exercises (slug, name, name_en, kind, muscle_group, equipment, grip, mechanic, is_unilateral) values
  ('barbell-back-squat', 'Sentadilla con barra', 'Barbell Back Squat', 'strength', 'quads', 'barbell', 'overhand', 'compound', false),
  ('barbell-front-squat', 'Sentadilla frontal con barra', 'Barbell Front Squat', 'strength', 'quads', 'barbell', 'overhand', 'compound', false),
  ('goblet-squat', 'Sentadilla goblet', 'Goblet Squat', 'strength', 'quads', 'dumbbell', 'neutral', 'compound', false),
  ('dumbbell-squat', 'Sentadilla con mancuernas', 'Dumbbell Squat', 'strength', 'quads', 'dumbbell', 'neutral', 'compound', false),
  ('smith-machine-squat', 'Sentadilla en máquina Smith', 'Smith Machine Squat', 'strength', 'quads', 'smith', 'overhand', 'compound', false),
  ('hack-squat-machine', 'Sentadilla hack en máquina', 'Hack Squat Machine', 'strength', 'quads', 'machine', null, 'compound', false),
  ('leg-press', 'Prensa de piernas', 'Leg Press', 'strength', 'quads', 'machine', null, 'compound', false),
  ('leg-press-single-leg', 'Prensa a una pierna', 'Single-Leg Leg Press', 'strength', 'quads', 'machine', null, 'compound', true),
  ('leg-extension', 'Extensión de cuádriceps en máquina', 'Leg Extension Machine', 'strength', 'quads', 'machine', null, 'isolation', false),
  ('bulgarian-split-squat', 'Sentadilla búlgara', 'Bulgarian Split Squat', 'strength', 'quads', 'dumbbell', 'neutral', 'compound', true),
  ('dumbbell-walking-lunge', 'Zancadas caminando con mancuernas', 'Dumbbell Walking Lunge', 'strength', 'quads', 'dumbbell', 'neutral', 'compound', true),
  ('barbell-walking-lunge', 'Zancadas caminando con barra', 'Barbell Walking Lunge', 'strength', 'quads', 'barbell', 'overhand', 'compound', true),
  ('reverse-lunge', 'Zancada inversa', 'Reverse Lunge', 'strength', 'quads', 'dumbbell', 'neutral', 'compound', true),
  ('step-up', 'Subida al cajón', 'Step-Up', 'strength', 'quads', 'dumbbell', 'neutral', 'compound', true),
  ('sissy-squat', 'Sentadilla sissy', 'Sissy Squat', 'strength', 'quads', 'bodyweight', null, 'isolation', false),
  ('box-squat', 'Sentadilla a cajón', 'Box Squat', 'strength', 'quads', 'barbell', 'overhand', 'compound', false),
  ('pistol-squat', 'Sentadilla pistola', 'Pistol Squat', 'strength', 'quads', 'bodyweight', null, 'compound', true),
  ('leg-press-45', 'Prensa de piernas a 45 grados', '45-Degree Leg Press', 'strength', 'quads', 'machine', null, 'compound', false),
  ('cable-squat', 'Sentadilla en polea', 'Cable Squat', 'strength', 'quads', 'cable', 'neutral', 'compound', false),
  ('belt-squat', 'Sentadilla con cinturón', 'Belt Squat', 'strength', 'quads', 'machine', null, 'compound', false),
  ('zercher-squat', 'Sentadilla Zercher', 'Zercher Squat', 'strength', 'quads', 'barbell', 'mixed', 'compound', false),
  ('overhead-squat', 'Sentadilla overhead', 'Overhead Squat', 'strength', 'quads', 'barbell', 'wide', 'compound', false),
  ('wall-sit', 'Sentadilla en pared (isométrico)', 'Wall Sit', 'strength', 'quads', 'bodyweight', null, 'isolation', false),
  ('jump-squat', 'Sentadilla con salto', 'Jump Squat', 'strength', 'quads', 'bodyweight', null, 'compound', false),
  ('banded-squat', 'Sentadilla con banda', 'Banded Squat', 'strength', 'quads', 'band', null, 'compound', false)
on conflict (slug) where user_id is null do update set
  name = excluded.name, name_en = excluded.name_en, kind = excluded.kind,
  muscle_group = excluded.muscle_group, equipment = excluded.equipment,
  grip = excluded.grip, mechanic = excluded.mechanic, is_unilateral = excluded.is_unilateral;

-- isquiotibiales ----------------------------------------------------------
insert into public.exercises (slug, name, name_en, kind, muscle_group, equipment, grip, mechanic, is_unilateral) values
  ('barbell-romanian-deadlift', 'Peso muerto rumano con barra', 'Barbell Romanian Deadlift', 'strength', 'hamstrings', 'barbell', 'overhand', 'compound', false),
  ('dumbbell-romanian-deadlift', 'Peso muerto rumano con mancuernas', 'Dumbbell Romanian Deadlift', 'strength', 'hamstrings', 'dumbbell', 'neutral', 'compound', false),
  ('stiff-leg-deadlift', 'Peso muerto piernas rígidas', 'Stiff-Leg Deadlift', 'strength', 'hamstrings', 'barbell', 'overhand', 'compound', false),
  ('single-leg-deadlift', 'Peso muerto a una pierna', 'Single-Leg Deadlift', 'strength', 'hamstrings', 'dumbbell', 'neutral', 'compound', true),
  ('lying-leg-curl-machine', 'Curl femoral tumbado en máquina', 'Lying Leg Curl Machine', 'strength', 'hamstrings', 'machine', null, 'isolation', false),
  ('seated-leg-curl-machine', 'Curl femoral sentado en máquina', 'Seated Leg Curl Machine', 'strength', 'hamstrings', 'machine', null, 'isolation', false),
  ('standing-leg-curl-machine', 'Curl femoral de pie en máquina', 'Standing Leg Curl Machine', 'strength', 'hamstrings', 'machine', null, 'isolation', true),
  ('cable-leg-curl', 'Curl femoral en polea', 'Cable Leg Curl', 'strength', 'hamstrings', 'cable', null, 'isolation', true),
  ('glute-ham-raise', 'Elevación glúteo-femoral', 'Glute-Ham Raise', 'strength', 'hamstrings', 'bodyweight', null, 'compound', false),
  ('nordic-hamstring-curl', 'Curl nórdico', 'Nordic Hamstring Curl', 'strength', 'hamstrings', 'bodyweight', null, 'isolation', false),
  ('kettlebell-romanian-deadlift', 'Peso muerto rumano con kettlebell', 'Kettlebell Romanian Deadlift', 'strength', 'hamstrings', 'kettlebell', 'neutral', 'compound', false),
  ('hamstring-good-morning', 'Buenos días (enfoque isquios)', 'Hamstring-Focused Good Morning', 'strength', 'hamstrings', 'barbell', 'overhand', 'compound', false),
  ('swiss-ball-leg-curl', 'Curl femoral en fitball', 'Swiss Ball Leg Curl', 'strength', 'hamstrings', 'bodyweight', null, 'isolation', false),
  ('trap-bar-romanian-deadlift', 'Peso muerto rumano con barra hexagonal', 'Trap Bar Romanian Deadlift', 'strength', 'hamstrings', 'barbell', 'neutral', 'compound', false),
  ('banded-leg-curl', 'Curl femoral con banda', 'Banded Leg Curl', 'strength', 'hamstrings', 'band', null, 'isolation', false)
on conflict (slug) where user_id is null do update set
  name = excluded.name, name_en = excluded.name_en, kind = excluded.kind,
  muscle_group = excluded.muscle_group, equipment = excluded.equipment,
  grip = excluded.grip, mechanic = excluded.mechanic, is_unilateral = excluded.is_unilateral;

-- glúteos -----------------------------------------------------------------
insert into public.exercises (slug, name, name_en, kind, muscle_group, equipment, grip, mechanic, is_unilateral) values
  ('barbell-hip-thrust', 'Hip thrust con barra', 'Barbell Hip Thrust', 'strength', 'glutes', 'barbell', null, 'compound', false),
  ('dumbbell-hip-thrust', 'Hip thrust con mancuerna', 'Dumbbell Hip Thrust', 'strength', 'glutes', 'dumbbell', null, 'compound', false),
  ('glute-bridge', 'Puente de glúteos', 'Glute Bridge', 'strength', 'glutes', 'bodyweight', null, 'compound', false),
  ('cable-glute-kickback', 'Patada de glúteo en polea', 'Cable Glute Kickback', 'strength', 'glutes', 'cable', null, 'isolation', true),
  ('machine-glute-kickback', 'Patada de glúteo en máquina', 'Machine Glute Kickback', 'strength', 'glutes', 'machine', null, 'isolation', true),
  ('hip-abduction-machine', 'Abducción de cadera en máquina', 'Hip Abduction Machine', 'strength', 'glutes', 'machine', null, 'isolation', false),
  ('hip-adduction-machine', 'Aducción de cadera en máquina', 'Hip Adduction Machine', 'strength', 'glutes', 'machine', null, 'isolation', false),
  ('banded-hip-abduction', 'Abducción de cadera con banda', 'Banded Hip Abduction', 'strength', 'glutes', 'band', null, 'isolation', false),
  ('cable-pull-through', 'Pull-through en polea', 'Cable Pull-Through', 'strength', 'glutes', 'cable', null, 'compound', false),
  ('single-leg-glute-bridge', 'Puente de glúteos a una pierna', 'Single-Leg Glute Bridge', 'strength', 'glutes', 'bodyweight', null, 'compound', true),
  ('curtsy-lunge', 'Zancada curtsy', 'Curtsy Lunge', 'strength', 'glutes', 'dumbbell', 'neutral', 'compound', true),
  ('sumo-squat', 'Sentadilla sumo', 'Sumo Squat', 'strength', 'glutes', 'dumbbell', 'neutral', 'compound', false),
  ('frog-pump', 'Frog pump', 'Frog Pump', 'strength', 'glutes', 'bodyweight', null, 'isolation', false),
  ('donkey-kick', 'Patada de burro', 'Donkey Kick', 'strength', 'glutes', 'bodyweight', null, 'isolation', true),
  ('smith-machine-hip-thrust', 'Hip thrust en máquina Smith', 'Smith Machine Hip Thrust', 'strength', 'glutes', 'smith', null, 'compound', false)
on conflict (slug) where user_id is null do update set
  name = excluded.name, name_en = excluded.name_en, kind = excluded.kind,
  muscle_group = excluded.muscle_group, equipment = excluded.equipment,
  grip = excluded.grip, mechanic = excluded.mechanic, is_unilateral = excluded.is_unilateral;

-- pantorrillas --------------------------------------------------------------
insert into public.exercises (slug, name, name_en, kind, muscle_group, equipment, grip, mechanic, is_unilateral) values
  ('standing-calf-raise-machine', 'Elevación de talones de pie en máquina', 'Standing Calf Raise Machine', 'strength', 'calves', 'machine', null, 'isolation', false),
  ('seated-calf-raise-machine', 'Elevación de talones sentado en máquina', 'Seated Calf Raise Machine', 'strength', 'calves', 'machine', null, 'isolation', false),
  ('dumbbell-calf-raise', 'Elevación de talones con mancuernas', 'Dumbbell Calf Raise', 'strength', 'calves', 'dumbbell', 'neutral', 'isolation', false),
  ('barbell-calf-raise', 'Elevación de talones con barra', 'Barbell Calf Raise', 'strength', 'calves', 'barbell', 'overhand', 'isolation', false),
  ('leg-press-calf-raise', 'Elevación de talones en prensa', 'Leg Press Calf Raise', 'strength', 'calves', 'machine', null, 'isolation', false),
  ('smith-machine-calf-raise', 'Elevación de talones en máquina Smith', 'Smith Machine Calf Raise', 'strength', 'calves', 'smith', 'overhand', 'isolation', false),
  ('single-leg-calf-raise', 'Elevación de talones a una pierna', 'Single-Leg Calf Raise', 'strength', 'calves', 'bodyweight', null, 'isolation', true),
  ('donkey-calf-raise', 'Elevación de talones burro', 'Donkey Calf Raise', 'strength', 'calves', 'machine', null, 'isolation', false)
on conflict (slug) where user_id is null do update set
  name = excluded.name, name_en = excluded.name_en, kind = excluded.kind,
  muscle_group = excluded.muscle_group, equipment = excluded.equipment,
  grip = excluded.grip, mechanic = excluded.mechanic, is_unilateral = excluded.is_unilateral;

-- hombros -------------------------------------------------------------------
insert into public.exercises (slug, name, name_en, kind, muscle_group, equipment, grip, mechanic, is_unilateral) values
  ('barbell-overhead-press', 'Press militar con barra', 'Barbell Overhead Press', 'strength', 'shoulders', 'barbell', 'overhand', 'compound', false),
  ('dumbbell-overhead-press', 'Press militar con mancuernas', 'Dumbbell Overhead Press', 'strength', 'shoulders', 'dumbbell', 'neutral', 'compound', false),
  ('seated-dumbbell-shoulder-press', 'Press de hombro sentado con mancuernas', 'Seated Dumbbell Shoulder Press', 'strength', 'shoulders', 'dumbbell', 'neutral', 'compound', false),
  ('arnold-press', 'Press Arnold', 'Arnold Press', 'strength', 'shoulders', 'dumbbell', 'neutral', 'compound', false),
  ('machine-shoulder-press', 'Press de hombro en máquina', 'Machine Shoulder Press', 'strength', 'shoulders', 'machine', 'neutral', 'compound', false),
  ('smith-machine-shoulder-press', 'Press de hombro en máquina Smith', 'Smith Machine Shoulder Press', 'strength', 'shoulders', 'smith', 'overhand', 'compound', false),
  ('push-press', 'Push press', 'Push Press', 'strength', 'shoulders', 'barbell', 'overhand', 'compound', false),
  ('landmine-shoulder-press', 'Press de hombro landmine', 'Landmine Shoulder Press', 'strength', 'shoulders', 'barbell', 'neutral', 'compound', true),
  ('dumbbell-lateral-raise', 'Elevaciones laterales con mancuernas', 'Dumbbell Lateral Raise', 'strength', 'shoulders', 'dumbbell', 'neutral', 'isolation', false),
  ('cable-lateral-raise', 'Elevaciones laterales en polea', 'Cable Lateral Raise', 'strength', 'shoulders', 'cable', 'neutral', 'isolation', true),
  ('machine-lateral-raise', 'Elevaciones laterales en máquina', 'Machine Lateral Raise', 'strength', 'shoulders', 'machine', 'neutral', 'isolation', false),
  ('leaning-cable-lateral-raise', 'Elevaciones laterales inclinado en polea', 'Leaning Cable Lateral Raise', 'strength', 'shoulders', 'cable', 'neutral', 'isolation', true),
  ('dumbbell-front-raise', 'Elevaciones frontales con mancuernas', 'Dumbbell Front Raise', 'strength', 'shoulders', 'dumbbell', 'neutral', 'isolation', false),
  ('barbell-front-raise', 'Elevaciones frontales con barra', 'Barbell Front Raise', 'strength', 'shoulders', 'barbell', 'overhand', 'isolation', false),
  ('cable-front-raise', 'Elevaciones frontales en polea', 'Cable Front Raise', 'strength', 'shoulders', 'cable', 'neutral', 'isolation', false),
  ('plate-front-raise', 'Elevaciones frontales con disco', 'Plate Front Raise', 'strength', 'shoulders', 'plate', 'neutral', 'isolation', false),
  ('dumbbell-rear-delt-fly', 'Aperturas posteriores con mancuernas', 'Dumbbell Rear Delt Fly', 'strength', 'shoulders', 'dumbbell', 'neutral', 'isolation', false),
  ('machine-rear-delt-fly', 'Aperturas posteriores en máquina', 'Machine Rear Delt Fly', 'strength', 'shoulders', 'machine', 'neutral', 'isolation', false),
  ('cable-rear-delt-fly', 'Aperturas posteriores en polea', 'Cable Rear Delt Fly', 'strength', 'shoulders', 'cable', 'neutral', 'isolation', false),
  ('rope-face-pull', 'Face pull con cuerda', 'Rope Face Pull', 'strength', 'shoulders', 'cable', 'neutral', 'isolation', false),
  ('band-pull-apart', 'Apertura con banda', 'Band Pull-Apart', 'strength', 'shoulders', 'band', 'wide', 'isolation', false),
  ('cuban-press', 'Press cubano', 'Cuban Press', 'strength', 'shoulders', 'dumbbell', 'neutral', 'compound', false),
  ('bradford-press', 'Press Bradford', 'Bradford Press', 'strength', 'shoulders', 'barbell', 'overhand', 'compound', false),
  ('handstand-push-up', 'Flexión en pino', 'Handstand Push-Up', 'strength', 'shoulders', 'bodyweight', 'wide', 'compound', false),
  ('pike-push-up', 'Flexión pike', 'Pike Push-Up', 'strength', 'shoulders', 'bodyweight', 'wide', 'compound', false)
on conflict (slug) where user_id is null do update set
  name = excluded.name, name_en = excluded.name_en, kind = excluded.kind,
  muscle_group = excluded.muscle_group, equipment = excluded.equipment,
  grip = excluded.grip, mechanic = excluded.mechanic, is_unilateral = excluded.is_unilateral;

-- bíceps ----------------------------------------------------------------
insert into public.exercises (slug, name, name_en, kind, muscle_group, equipment, grip, mechanic, is_unilateral) values
  ('barbell-biceps-curl', 'Curl de bíceps con barra', 'Barbell Biceps Curl', 'strength', 'biceps', 'barbell', 'underhand', 'isolation', false),
  ('ez-bar-biceps-curl', 'Curl de bíceps con barra Z', 'EZ Bar Biceps Curl', 'strength', 'biceps', 'ez_bar', 'underhand', 'isolation', false),
  ('dumbbell-biceps-curl', 'Curl de bíceps con mancuernas', 'Dumbbell Biceps Curl', 'strength', 'biceps', 'dumbbell', 'underhand', 'isolation', false),
  ('alternating-dumbbell-curl', 'Curl alterno con mancuernas', 'Alternating Dumbbell Curl', 'strength', 'biceps', 'dumbbell', 'underhand', 'isolation', true),
  ('hammer-curl', 'Curl martillo', 'Hammer Curl', 'strength', 'biceps', 'dumbbell', 'neutral', 'isolation', false),
  ('concentration-curl', 'Curl concentrado', 'Concentration Curl', 'strength', 'biceps', 'dumbbell', 'underhand', 'isolation', true),
  ('barbell-preacher-curl', 'Curl en banco Scott con barra', 'Barbell Preacher Curl', 'strength', 'biceps', 'barbell', 'underhand', 'isolation', false),
  ('ez-bar-preacher-curl', 'Curl en banco Scott con barra Z', 'EZ Bar Preacher Curl', 'strength', 'biceps', 'ez_bar', 'underhand', 'isolation', false),
  ('preacher-curl-machine', 'Curl en banco Scott en máquina', 'Preacher Curl Machine', 'strength', 'biceps', 'machine', 'underhand', 'isolation', false),
  ('cable-biceps-curl', 'Curl de bíceps en polea', 'Cable Biceps Curl', 'strength', 'biceps', 'cable', 'underhand', 'isolation', false),
  ('cable-rope-hammer-curl', 'Curl martillo con cuerda en polea', 'Cable Rope Hammer Curl', 'strength', 'biceps', 'cable', 'neutral', 'isolation', false),
  ('incline-dumbbell-curl', 'Curl inclinado con mancuernas', 'Incline Dumbbell Curl', 'strength', 'biceps', 'dumbbell', 'underhand', 'isolation', false),
  ('spider-curl', 'Curl araña', 'Spider Curl', 'strength', 'biceps', 'ez_bar', 'underhand', 'isolation', false),
  ('drag-curl', 'Curl drag', 'Drag Curl', 'strength', 'biceps', 'barbell', 'underhand', 'isolation', false),
  ('reverse-curl', 'Curl inverso', 'Reverse Curl', 'strength', 'biceps', 'barbell', 'overhand', 'isolation', false),
  ('band-biceps-curl', 'Curl de bíceps con banda', 'Band Biceps Curl', 'strength', 'biceps', 'band', 'underhand', 'isolation', false),
  ('machine-biceps-curl', 'Curl de bíceps en máquina', 'Machine Biceps Curl', 'strength', 'biceps', 'machine', 'underhand', 'isolation', false),
  ('zottman-curl', 'Curl Zottman', 'Zottman Curl', 'strength', 'biceps', 'dumbbell', 'rotating', 'isolation', false)
on conflict (slug) where user_id is null do update set
  name = excluded.name, name_en = excluded.name_en, kind = excluded.kind,
  muscle_group = excluded.muscle_group, equipment = excluded.equipment,
  grip = excluded.grip, mechanic = excluded.mechanic, is_unilateral = excluded.is_unilateral;

-- tríceps ---------------------------------------------------------------
insert into public.exercises (slug, name, name_en, kind, muscle_group, equipment, grip, mechanic, is_unilateral) values
  ('cable-triceps-pushdown', 'Extensión de tríceps en polea', 'Cable Triceps Pushdown', 'strength', 'triceps', 'cable', 'overhand', 'isolation', false),
  ('rope-triceps-pushdown', 'Extensión de tríceps con cuerda', 'Rope Triceps Pushdown', 'strength', 'triceps', 'cable', 'neutral', 'isolation', false),
  ('dumbbell-overhead-triceps-extension', 'Extensión de tríceps overhead con mancuerna', 'Dumbbell Overhead Triceps Extension', 'strength', 'triceps', 'dumbbell', 'neutral', 'isolation', false),
  ('cable-overhead-triceps-extension', 'Extensión de tríceps overhead en polea', 'Cable Overhead Triceps Extension', 'strength', 'triceps', 'cable', 'neutral', 'isolation', false),
  ('ez-bar-skull-crusher', 'Press francés con barra Z', 'EZ Bar Skull Crusher', 'strength', 'triceps', 'ez_bar', 'overhand', 'isolation', false),
  ('dumbbell-skull-crusher', 'Press francés con mancuernas', 'Dumbbell Skull Crusher', 'strength', 'triceps', 'dumbbell', 'neutral', 'isolation', false),
  ('close-grip-bench-press', 'Press de banca agarre cerrado', 'Close-Grip Bench Press', 'strength', 'triceps', 'barbell', 'close', 'compound', false),
  ('weighted-triceps-dip', 'Fondos con peso (tríceps)', 'Weighted Triceps Dip', 'strength', 'triceps', 'bodyweight', 'neutral', 'compound', false),
  ('bench-dip', 'Fondos en banco', 'Bench Dip', 'strength', 'triceps', 'bench', 'neutral', 'compound', false),
  ('machine-triceps-dip', 'Fondos en máquina', 'Machine Triceps Dip', 'strength', 'triceps', 'machine', 'neutral', 'compound', false),
  ('dumbbell-triceps-kickback', 'Patada de tríceps con mancuerna', 'Dumbbell Triceps Kickback', 'strength', 'triceps', 'dumbbell', 'neutral', 'isolation', true),
  ('cable-triceps-kickback', 'Patada de tríceps en polea', 'Cable Triceps Kickback', 'strength', 'triceps', 'cable', 'neutral', 'isolation', true),
  ('single-arm-cable-pushdown', 'Extensión de tríceps a un brazo en polea', 'Single-Arm Cable Pushdown', 'strength', 'triceps', 'cable', 'overhand', 'isolation', true),
  ('jm-press', 'Press JM', 'JM Press', 'strength', 'triceps', 'barbell', 'overhand', 'compound', false),
  ('tate-press', 'Press Tate', 'Tate Press', 'strength', 'triceps', 'dumbbell', 'neutral', 'isolation', false),
  ('band-triceps-pushdown', 'Extensión de tríceps con banda', 'Band Triceps Pushdown', 'strength', 'triceps', 'band', 'overhand', 'isolation', false),
  ('machine-triceps-extension', 'Extensión de tríceps en máquina', 'Machine Triceps Extension', 'strength', 'triceps', 'machine', 'neutral', 'isolation', false),
  ('floor-skull-crusher', 'Press francés en el suelo', 'Floor Skull Crusher', 'strength', 'triceps', 'ez_bar', 'overhand', 'isolation', false)
on conflict (slug) where user_id is null do update set
  name = excluded.name, name_en = excluded.name_en, kind = excluded.kind,
  muscle_group = excluded.muscle_group, equipment = excluded.equipment,
  grip = excluded.grip, mechanic = excluded.mechanic, is_unilateral = excluded.is_unilateral;

-- antebrazos --------------------------------------------------------------
insert into public.exercises (slug, name, name_en, kind, muscle_group, equipment, grip, mechanic, is_unilateral) values
  ('barbell-wrist-curl', 'Curl de muñeca con barra', 'Barbell Wrist Curl', 'strength', 'forearms', 'barbell', 'underhand', 'isolation', false),
  ('dumbbell-wrist-curl', 'Curl de muñeca con mancuerna', 'Dumbbell Wrist Curl', 'strength', 'forearms', 'dumbbell', 'underhand', 'isolation', true),
  ('reverse-wrist-curl', 'Curl de muñeca inverso', 'Reverse Wrist Curl', 'strength', 'forearms', 'barbell', 'overhand', 'isolation', false),
  ('farmers-carry', 'Caminata del granjero', 'Farmer''s Carry', 'strength', 'forearms', 'dumbbell', 'neutral', 'compound', false),
  ('plate-pinch-hold', 'Pinza de disco (agarre)', 'Plate Pinch Hold', 'strength', 'forearms', 'plate', null, 'isolation', false),
  ('wrist-roller', 'Rodillo de muñeca', 'Wrist Roller', 'strength', 'forearms', 'plate', 'overhand', 'isolation', false),
  ('dead-hang', 'Colgado pasivo (dead hang)', 'Dead Hang', 'strength', 'forearms', 'bodyweight', 'overhand', 'isolation', false),
  ('hand-gripper-squeeze', 'Cierre de gripper', 'Hand Gripper Squeeze', 'strength', 'forearms', 'other', null, 'isolation', false)
on conflict (slug) where user_id is null do update set
  name = excluded.name, name_en = excluded.name_en, kind = excluded.kind,
  muscle_group = excluded.muscle_group, equipment = excluded.equipment,
  grip = excluded.grip, mechanic = excluded.mechanic, is_unilateral = excluded.is_unilateral;

-- core ----------------------------------------------------------------------
insert into public.exercises (slug, name, name_en, kind, muscle_group, equipment, grip, mechanic, is_unilateral) values
  ('plank', 'Plancha', 'Plank', 'strength', 'core', 'bodyweight', null, 'isolation', false),
  ('side-plank', 'Plancha lateral', 'Side Plank', 'strength', 'core', 'bodyweight', null, 'isolation', true),
  ('hanging-leg-raise', 'Elevación de piernas colgado', 'Hanging Leg Raise', 'strength', 'core', 'bodyweight', 'overhand', 'isolation', false),
  ('hanging-knee-raise', 'Elevación de rodillas colgado', 'Hanging Knee Raise', 'strength', 'core', 'bodyweight', 'overhand', 'isolation', false),
  ('captains-chair-leg-raise', 'Elevación de piernas en silla romana', 'Captain''s Chair Leg Raise', 'strength', 'core', 'machine', null, 'isolation', false),
  ('cable-crunch', 'Crunch en polea', 'Cable Crunch', 'strength', 'core', 'cable', null, 'isolation', false),
  ('machine-ab-crunch', 'Crunch en máquina', 'Machine Ab Crunch', 'strength', 'core', 'machine', null, 'isolation', false),
  ('weighted-sit-up', 'Abdominal con peso', 'Weighted Sit-Up', 'strength', 'core', 'plate', null, 'isolation', false),
  ('bicycle-crunch', 'Crunch de bicicleta', 'Bicycle Crunch', 'strength', 'core', 'bodyweight', null, 'isolation', false),
  ('russian-twist', 'Giro ruso', 'Russian Twist', 'strength', 'core', 'plate', null, 'isolation', false),
  ('ab-wheel-rollout', 'Rueda abdominal', 'Ab Wheel Rollout', 'strength', 'core', 'other', 'overhand', 'compound', false),
  ('mountain-climber', 'Escalador', 'Mountain Climber', 'strength', 'core', 'bodyweight', null, 'isolation', false),
  ('flutter-kick', 'Patada de tijera', 'Flutter Kick', 'strength', 'core', 'bodyweight', null, 'isolation', false),
  ('v-up', 'V-up', 'V-Up', 'strength', 'core', 'bodyweight', null, 'isolation', false),
  ('dead-bug', 'Dead bug', 'Dead Bug', 'strength', 'core', 'bodyweight', null, 'isolation', false),
  ('pallof-press', 'Press Pallof', 'Pallof Press', 'strength', 'core', 'cable', 'neutral', 'isolation', true),
  ('cable-woodchopper', 'Leñador en polea', 'Cable Woodchopper', 'strength', 'core', 'cable', 'neutral', 'isolation', true),
  ('hollow-body-hold', 'Hollow body hold', 'Hollow Body Hold', 'strength', 'core', 'bodyweight', null, 'isolation', false),
  ('reverse-crunch', 'Crunch inverso', 'Reverse Crunch', 'strength', 'core', 'bodyweight', null, 'isolation', false),
  ('weighted-plank', 'Plancha con peso', 'Weighted Plank', 'strength', 'core', 'plate', null, 'isolation', false)
on conflict (slug) where user_id is null do update set
  name = excluded.name, name_en = excluded.name_en, kind = excluded.kind,
  muscle_group = excluded.muscle_group, equipment = excluded.equipment,
  grip = excluded.grip, mechanic = excluded.mechanic, is_unilateral = excluded.is_unilateral;

-- cuerpo completo / olímpicos ----------------------------------------------
insert into public.exercises (slug, name, name_en, kind, muscle_group, equipment, grip, mechanic, is_unilateral) values
  ('kettlebell-swing', 'Swing con kettlebell', 'Kettlebell Swing', 'strength', 'full_body', 'kettlebell', 'overhand', 'compound', false),
  ('barbell-clean', 'Cargada con barra', 'Barbell Clean', 'strength', 'full_body', 'barbell', 'overhand', 'compound', false),
  ('power-clean', 'Cargada de potencia', 'Power Clean', 'strength', 'full_body', 'barbell', 'overhand', 'compound', false),
  ('clean-and-jerk', 'Dos tiempos', 'Clean and Jerk', 'strength', 'full_body', 'barbell', 'overhand', 'compound', false),
  ('snatch', 'Arrancada', 'Snatch', 'strength', 'full_body', 'barbell', 'wide', 'compound', false),
  ('barbell-thruster', 'Thruster con barra', 'Barbell Thruster', 'strength', 'full_body', 'barbell', 'overhand', 'compound', false),
  ('dumbbell-thruster', 'Thruster con mancuernas', 'Dumbbell Thruster', 'strength', 'full_body', 'dumbbell', 'neutral', 'compound', false),
  ('burpee', 'Burpee', 'Burpee', 'strength', 'full_body', 'bodyweight', null, 'compound', false),
  ('kettlebell-clean-and-press', 'Cargada y press con kettlebell', 'Kettlebell Clean and Press', 'strength', 'full_body', 'kettlebell', 'neutral', 'compound', true),
  ('sled-push', 'Empuje de trineo', 'Sled Push', 'strength', 'full_body', 'sled', null, 'compound', false),
  ('sled-pull', 'Arrastre de trineo', 'Sled Pull', 'strength', 'full_body', 'sled', null, 'compound', false),
  ('battle-ropes', 'Cuerdas de batalla', 'Battle Ropes', 'strength', 'full_body', 'other', null, 'compound', false)
on conflict (slug) where user_id is null do update set
  name = excluded.name, name_en = excluded.name_en, kind = excluded.kind,
  muscle_group = excluded.muscle_group, equipment = excluded.equipment,
  grip = excluded.grip, mechanic = excluded.mechanic, is_unilateral = excluded.is_unilateral;

-- cardio ----------------------------------------------------------------
insert into public.exercises (slug, name, name_en, kind, muscle_group, equipment, grip, mechanic, is_unilateral) values
  ('running', 'Correr', 'Running', 'cardio', 'cardio', 'bodyweight', null, null, false),
  ('treadmill-running', 'Correr en cinta', 'Treadmill Running', 'cardio', 'cardio', 'cardio_machine', null, null, false),
  ('cycling', 'Bicicleta', 'Cycling', 'cardio', 'cardio', 'bodyweight', null, null, false),
  ('stationary-bike', 'Bicicleta estática', 'Stationary Bike', 'cardio', 'cardio', 'cardio_machine', null, null, false),
  ('elliptical', 'Elíptica', 'Elliptical', 'cardio', 'cardio', 'cardio_machine', null, null, false),
  ('rowing-machine', 'Remo (máquina)', 'Rowing Machine', 'cardio', 'cardio', 'cardio_machine', null, null, false),
  ('jump-rope', 'Cuerda', 'Jump Rope', 'cardio', 'cardio', 'other', null, null, false),
  ('stair-climber', 'Escaladora', 'Stair Climber', 'cardio', 'cardio', 'cardio_machine', null, null, false),
  ('swimming', 'Natación', 'Swimming', 'cardio', 'cardio', 'bodyweight', null, null, false),
  ('walking', 'Caminar', 'Walking', 'cardio', 'cardio', 'bodyweight', null, null, false),
  ('incline-treadmill-walk', 'Caminata inclinada en cinta', 'Incline Treadmill Walk', 'cardio', 'cardio', 'cardio_machine', null, null, false),
  ('assault-bike', 'Bicicleta de asalto', 'Assault Bike', 'cardio', 'cardio', 'cardio_machine', null, null, false),
  ('hiit-circuit', 'Circuito HIIT', 'HIIT Circuit', 'cardio', 'cardio', 'bodyweight', null, null, false),
  ('stair-stepper', 'Step (subidas)', 'Stair Stepper', 'cardio', 'cardio', 'cardio_machine', null, null, false),
  ('spinning-class', 'Clase de spinning', 'Spinning Class', 'cardio', 'cardio', 'cardio_machine', null, null, false)
on conflict (slug) where user_id is null do update set
  name = excluded.name, name_en = excluded.name_en, kind = excluded.kind,
  muscle_group = excluded.muscle_group, equipment = excluded.equipment,
  grip = excluded.grip, mechanic = excluded.mechanic, is_unilateral = excluded.is_unilateral;

-- ---------------------------------------------------------------------------
-- 6) check constraints sobre los vocabularios — después del upsert, para que
-- la validación corra contra los valores ya normalizados.
-- ---------------------------------------------------------------------------
alter table public.exercises
  add constraint exercises_muscle_group_check
  check (muscle_group is null or muscle_group in (
    'chest', 'back', 'lats', 'traps', 'shoulders', 'biceps', 'triceps', 'forearms',
    'quads', 'hamstrings', 'glutes', 'calves', 'core', 'full_body', 'cardio'
  ));

alter table public.exercises
  add constraint exercises_equipment_check
  check (equipment is null or equipment in (
    'barbell', 'ez_bar', 'dumbbell', 'kettlebell', 'machine', 'cable', 'smith',
    'bodyweight', 'band', 'plate', 'sled', 'bench', 'cardio_machine', 'other'
  ));

alter table public.exercises
  add constraint exercises_grip_check
  check (grip is null or grip in (
    'overhand', 'underhand', 'neutral', 'wide', 'close', 'mixed', 'rotating'
  ));

alter table public.exercises
  add constraint exercises_mechanic_check
  check (mechanic is null or mechanic in ('compound', 'isolation'));

-- ---------------------------------------------------------------------------
-- 7) índice que faltaba: `getExerciseProgress`/`getCardioProgress` filtran
-- `workout_exercises` por `exercise_id` y no había índice para esa columna.
-- ---------------------------------------------------------------------------
create index if not exists workout_exercises_exercise_id_idx
  on public.workout_exercises (exercise_id);
