export type ExerciseKind = "strength" | "cardio";
export type WeightUnit = "kg" | "lb";

export type Exercise = {
  id: string;
  user_id: string | null;
  name: string;
  kind: ExerciseKind;
  muscle_group: string | null;
};

export type ExerciseSet = {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  unit: WeightUnit;
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
