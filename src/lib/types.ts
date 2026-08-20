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
