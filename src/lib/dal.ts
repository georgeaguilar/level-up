import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  CardioProgressPoint,
  Exercise,
  ExerciseProgressPoint,
  WorkoutWithExercises,
} from "@/lib/types";

/**
 * Verifica la sesión y devuelve el usuario autenticado, o redirige a /login.
 * `src/proxy.ts` ya hace una comprobación optimista, pero la autorización
 * real de cada lectura/escritura vive aquí (patrón DAL recomendado por Next.js).
 * Envuelto en `cache()` para no repetir la llamada dentro del mismo render.
 */
export const verifySession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { userId: user.id, email: user.email ?? null };
});

export const getProfile = cache(async () => {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", userId)
    .single();

  return data;
});

const EXERCISE_COLUMNS =
  "id, user_id, name, name_en, slug, kind, muscle_group, equipment, grip, mechanic, is_unilateral";

/**
 * Catálogo completo (global + propio). Sin filtro de servidor: con ~250
 * ejercicios se trae todo y se filtra en cliente (ver `ExercisePicker`),
 * que es lo que permite búsqueda y chips instantáneos sin ida y vuelta.
 */
export async function getExercises(): Promise<Exercise[]> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercises")
    .select(EXERCISE_COLUMNS)
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Ejercicios distintos que el usuario ha registrado alguna vez en algún
 * entrenamiento. La usa `/progress`: con el catálogo completo (~250) de
 * `getExercises()` el selector de esa página sería inservible y casi
 * ningún ejercicio tendría series/tiempos que graficar.
 */
export async function getLoggedExercises(): Promise<Exercise[]> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workout_exercises")
    .select(`exercise:exercises!inner ( ${EXERCISE_COLUMNS} ), workouts!inner ( user_id )`)
    .eq("workouts.user_id", userId);

  if (error) throw error;

  // Igual que en `getExerciseProgress`: sin tipos generados de Supabase el
  // cliente infiere mal la relación many-to-one, hay que forzar el tipo.
  const rows = data as unknown as Array<{ exercise: Exercise }>;
  const byId = new Map(rows.map((row) => [row.exercise.id, row.exercise]));

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getRecentWorkouts(limit = 10) {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workouts")
    .select("id, date, notes")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getWorkout(
  workoutId: string,
): Promise<WorkoutWithExercises | null> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workouts")
    .select(
      `
      id, user_id, date, notes,
      workout_exercises (
        id, workout_id, exercise_id, position, duration_seconds,
        exercise:exercises ( ${EXERCISE_COLUMNS} ),
        sets:exercise_sets ( id, workout_exercise_id, set_number, reps, weight, unit )
      )
    `,
    )
    .eq("id", workoutId)
    .order("position", { referencedTable: "workout_exercises", ascending: true })
    .order("set_number", {
      referencedTable: "workout_exercises.exercise_sets",
      ascending: true,
    })
    .maybeSingle();

  if (error) throw error;
  return data as WorkoutWithExercises | null;
}

export async function getWorkoutByDate(date: string) {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workouts")
    .select("id")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Progresión de un ejercicio de pesas: por cada sesión, peso máximo,
 * volumen total (reps x peso) y 1RM estimado (fórmula de Epley).
 * Las series en `lb` se convierten a `kg` para poder graficar en una sola unidad.
 */
export async function getExerciseProgress(
  exerciseId: string,
): Promise<ExerciseProgressPoint[]> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workout_exercises")
    .select(
      `
      workouts!inner ( date ),
      exercise_sets ( reps, weight, unit )
    `,
    )
    .eq("exercise_id", exerciseId)
    .order("date", { referencedTable: "workouts", ascending: true });

  if (error) throw error;

  // Sin tipos generados de Supabase, el cliente infiere la relación
  // `workouts` (many-to-one vía !inner) como array; en realidad es un objeto.
  const rows = data as unknown as Array<{
    workouts: { date: string };
    exercise_sets: { reps: number; weight: number; unit: "kg" | "lb" }[];
  }>;

  const byDate = new Map<
    string,
    { maxWeightKg: number; volumeKg: number; estimated1RmKg: number }
  >();

  for (const row of rows) {
    const date = row.workouts.date;
    const existing =
      byDate.get(date) ?? { maxWeightKg: 0, volumeKg: 0, estimated1RmKg: 0 };

    for (const set of row.exercise_sets) {
      const weightKg = set.unit === "lb" ? set.weight * 0.453592 : set.weight;
      const epley1Rm = weightKg * (1 + set.reps / 30); // fórmula de Epley
      existing.maxWeightKg = Math.max(existing.maxWeightKg, weightKg);
      existing.volumeKg += weightKg * set.reps;
      existing.estimated1RmKg = Math.max(existing.estimated1RmKg, epley1Rm);
    }

    byDate.set(date, existing);
  }

  return Array.from(byDate.entries())
    .map(([date, { maxWeightKg, volumeKg, estimated1RmKg }]) => ({
      date,
      maxWeightKg: Math.round(maxWeightKg * 100) / 100,
      volumeKg: Math.round(volumeKg * 100) / 100,
      estimated1RmKg: Math.round(estimated1RmKg * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getCardioProgress(
  exerciseId: string,
): Promise<CardioProgressPoint[]> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workout_exercises")
    .select(
      `
      duration_seconds,
      workouts!inner ( date )
    `,
    )
    .eq("exercise_id", exerciseId)
    .not("duration_seconds", "is", null)
    .order("date", { referencedTable: "workouts", ascending: true });

  if (error) throw error;

  const rows = data as unknown as Array<{
    duration_seconds: number | null;
    workouts: { date: string };
  }>;

  return rows
    .filter((row): row is typeof row & { duration_seconds: number } => row.duration_seconds !== null)
    .map((row) => ({ date: row.workouts.date, durationSeconds: row.duration_seconds }));
}
