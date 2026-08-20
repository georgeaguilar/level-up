-- Añade RIR (reps en reserva) a las series y marcas de inicio/fin de sesión a
-- los entrenamientos. Ambas cosas son nullable: las filas existentes no
-- tienen ese dato y seguir registrándolo es opcional.

-- ---------------------------------------------------------------------------
-- 1) RIR por serie (0 = al fallo, 10 = muy lejos del fallo)
-- ---------------------------------------------------------------------------
alter table public.exercise_sets
  add column if not exists rir smallint;

alter table public.exercise_sets
  add constraint exercise_sets_rir_check
  check (rir is null or (rir >= 0 and rir <= 10));

-- ---------------------------------------------------------------------------
-- 2) Duración de la sesión. `date` sigue siendo la clave del entrenamiento
-- (unique user_id+date); estas dos columnas solo miden cuánto duró.
-- ---------------------------------------------------------------------------
alter table public.workouts
  add column if not exists started_at timestamptz,
  add column if not exists ended_at timestamptz;

alter table public.workouts
  add constraint workouts_session_window_check
  check (ended_at is null or started_at is null or ended_at >= started_at);

-- ---------------------------------------------------------------------------
-- 3) Sin índices nuevos:
--   * El rango de fechas del dashboard filtra workouts por (user_id, date) →
--     ya lo cubre `workouts_user_date_idx`.
--   * El descenso a series pasa por workout_exercises_workout_id_idx →
--     exercise_sets_workout_exercise_id_idx.
--   * La consulta de récords filtra `workout_exercises.exercise_id in (...)` →
--     ya lo cubre `workout_exercises_exercise_id_idx`.
-- No se agrega índice sobre `started_at`/`ended_at`: nunca se filtra por ellas,
-- solo se leen de filas ya seleccionadas por fecha.
-- ---------------------------------------------------------------------------
