export type ExerciseKind = "strength" | "cardio";
export type WeightUnit = "kg" | "lb";

export type MuscleGroup =
  | "chest"
  | "back"
  | "lats"
  | "traps"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core"
  | "full_body"
  | "cardio";

export type Equipment =
  | "barbell"
  | "ez_bar"
  | "dumbbell"
  | "kettlebell"
  | "machine"
  | "cable"
  | "smith"
  | "bodyweight"
  | "band"
  | "plate"
  | "sled"
  | "bench"
  | "cardio_machine"
  | "other";

export type Grip = "overhand" | "underhand" | "neutral" | "wide" | "close" | "mixed" | "rotating";

export type Mechanic = "compound" | "isolation";

export type Exercise = {
  id: string;
  user_id: string | null;
  name: string;
  /** Nombre en inglés del catálogo global; `null` en ejercicios propios del usuario. */
  name_en: string | null;
  kind: ExerciseKind;
  /** Slug estable del catálogo global (`user_id is null`); `null` en ejercicios propios. */
  slug: string | null;
  muscle_group: MuscleGroup | null;
  equipment: Equipment | null;
  grip: Grip | null;
  mechanic: Mechanic | null;
  is_unilateral: boolean;
};

export type ExerciseSet = {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  unit: WeightUnit;
  /** Reps en reserva (0 = al fallo). `null` = no registrado en esta serie. */
  rir: number | null;
};

export type WorkoutExercise = {
  id: string;
  workout_id: string;
  exercise_id: string;
  position: number;
  duration_seconds: number | null;
  exercise: Exercise;
  sets: ExerciseSet[];
};

export type Workout = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  notes: string | null;
  /** Hora en que se marcó el inicio/fin de la sesión. `null` = no registrado. */
  started_at: string | null; // timestamptz ISO
  ended_at: string | null; // timestamptz ISO
};

export type WorkoutWithExercises = Workout & {
  workout_exercises: WorkoutExercise[];
};

export type ExerciseProgressPoint = {
  date: string;
  maxWeightKg: number;
  volumeKg: number;
  estimated1RmKg: number;
};

export type CardioProgressPoint = {
  date: string;
  durationSeconds: number;
};

// ---------------------------------------------------------------------------
// Dashboard de analítica (/progress, pestaña "Resumen")
// ---------------------------------------------------------------------------

export type DashboardRange = 4 | 12 | 52;

/** % de cambio vs. el periodo anterior. `null` = no había base con qué comparar. */
export type Delta = number | null;

export type PeriodTotals = {
  tonnageKg: number;
  sets: number;
  reps: number;
  workouts: number;
  avgRepsPerSet: number;
  avgRir: number | null;
  /** Fracción 0..1 de series con RIR registrado en el periodo. */
  rirCoverage: number;
  avgSessionMinutes: number | null;
  timedSessions: number;
  workoutsPerWeek: number;
  weeksTrained: number;
};

export type PeriodDeltas = {
  tonnageKg: Delta;
  sets: Delta;
  reps: Delta;
  workouts: Delta;
  avgRepsPerSet: Delta;
  avgRir: Delta;
  avgSessionMinutes: Delta;
  workoutsPerWeek: Delta;
};

export type MuscleGroupStat = {
  group: MuscleGroup;
  sets: number;
  tonnageKg: number;
  /** Sesiones distintas que entrenaron el grupo en el periodo. */
  sessions: number;
  sessionsPerWeek: number;
  bestE1rmKg: number | null;
  volumeDelta: Delta;
  strengthDelta: Delta;
  frequencyDelta: Delta;
};

export type PersonalRecord = {
  exerciseId: string;
  name: string;
  nameEn: string | null;
  muscleGroup: MuscleGroup | null;
  date: string; // YYYY-MM-DD
  reps: number;
  weightKg: number;
  e1rmKg: number;
  /** Mejor marca previa a este set. `null` = primera vez que se registra el ejercicio. */
  previousE1rmKg: number | null;
  kind: "e1rm" | "weight" | "both";
};

export type WeeklyPoint = {
  weekStart: string; // lunes, YYYY-MM-DD
  tonnageKg: number;
  sets: number;
  workouts: number;
};

export type DashboardData = {
  range: DashboardRange;
  periodStart: string;
  periodEnd: string;
  previousStart: string;
  previousEnd: string;
  current: PeriodTotals;
  previous: PeriodTotals;
  deltas: PeriodDeltas;
  /** Desc por tonnageKg. Sin grupos con cero series en ambos periodos. */
  muscleGroups: MuscleGroupStat[];
  /** Desc por fecha. Máx. un récord por ejercicio (el más reciente/mejor). */
  records: PersonalRecord[];
  /** Solo el periodo actual, longitud === range. */
  weekly: WeeklyPoint[];
  hasData: boolean;
};
