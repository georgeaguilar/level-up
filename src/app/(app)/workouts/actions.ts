"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

function todayIsoDate() {
  // Fecha local del servidor en formato YYYY-MM-DD.
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

/**
 * Devuelve el entrenamiento de hoy del usuario, creándolo si no existe,
 * y redirige a su página de detalle.
 */
export async function goToTodayWorkout() {
  const { userId } = await verifySession();
  const supabase = await createClient();
  const date = todayIsoDate();

  const { data: existing, error: findError } = await supabase
    .from("workouts")
    .select("id")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (findError) throw findError;

  if (existing) {
    redirect(`/workouts/${existing.id}`);
  }

  const { data: created, error: insertError } = await supabase
    .from("workouts")
    .insert({ user_id: userId, date })
    .select("id")
    .single();

  if (insertError) throw insertError;

  revalidatePath("/");
  redirect(`/workouts/${created.id}`);
}

async function assertOwnsWorkout(workoutId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select("id")
    .eq("id", workoutId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("No autorizado.");
}

const addExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  exerciseId: z.string().uuid(),
});

export async function addExerciseToWorkout(formData: FormData) {
  const { userId } = await verifySession();
  const { workoutId, exerciseId } = addExerciseSchema.parse({
    workoutId: formData.get("workoutId"),
    exerciseId: formData.get("exerciseId"),
  });

  await assertOwnsWorkout(workoutId, userId);
  const supabase = await createClient();

  const { count } = await supabase
    .from("workout_exercises")
    .select("id", { count: "exact", head: true })
    .eq("workout_id", workoutId);

  const { error } = await supabase.from("workout_exercises").insert({
    workout_id: workoutId,
    exercise_id: exerciseId,
    position: count ?? 0,
  });

  if (error) throw error;
  revalidatePath(`/workouts/${workoutId}`);
}

const createCustomExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  kind: z.enum(["strength", "cardio"]),
});

export async function createCustomExercise(formData: FormData) {
  const { userId } = await verifySession();
  const { workoutId, name, kind } = createCustomExerciseSchema.parse({
    workoutId: formData.get("workoutId"),
    name: formData.get("name"),
    kind: formData.get("kind"),
  });

  await assertOwnsWorkout(workoutId, userId);
  const supabase = await createClient();

  const { data: exercise, error: exerciseError } = await supabase
    .from("exercises")
    .insert({ user_id: userId, name, kind })
    .select("id")
    .single();

  if (exerciseError) throw exerciseError;

  const { count } = await supabase
    .from("workout_exercises")
    .select("id", { count: "exact", head: true })
    .eq("workout_id", workoutId);

  const { error } = await supabase.from("workout_exercises").insert({
    workout_id: workoutId,
    exercise_id: exercise.id,
    position: count ?? 0,
  });

  if (error) throw error;
  revalidatePath(`/workouts/${workoutId}`);
}

async function assertOwnsWorkoutExercise(workoutExerciseId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_exercises")
    .select("id, workout_id, workouts!inner(user_id)")
    .eq("id", workoutExerciseId)
    .eq("workouts.user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("No autorizado.");
  return data.workout_id as string;
}

const removeWorkoutExerciseSchema = z.object({
  workoutExerciseId: z.string().uuid(),
});

export async function removeWorkoutExercise(formData: FormData) {
  const { userId } = await verifySession();
  const { workoutExerciseId } = removeWorkoutExerciseSchema.parse({
    workoutExerciseId: formData.get("workoutExerciseId"),
  });

  const workoutId = await assertOwnsWorkoutExercise(workoutExerciseId, userId);
  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_exercises")
    .delete()
    .eq("id", workoutExerciseId);

  if (error) throw error;
  revalidatePath(`/workouts/${workoutId}`);
}

const setCardioDurationSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  minutes: z.coerce.number().min(0).max(600),
  seconds: z.coerce.number().min(0).max(59),
});

export async function setCardioDuration(formData: FormData) {
  const { userId } = await verifySession();
  const { workoutExerciseId, minutes, seconds } = setCardioDurationSchema.parse({
    workoutExerciseId: formData.get("workoutExerciseId"),
    minutes: formData.get("minutes"),
    seconds: formData.get("seconds"),
  });

  const workoutId = await assertOwnsWorkoutExercise(workoutExerciseId, userId);
  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_exercises")
    .update({ duration_seconds: minutes * 60 + seconds })
    .eq("id", workoutExerciseId);

  if (error) throw error;
  revalidatePath(`/workouts/${workoutId}`);
}

const addSetSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  reps: z.coerce.number().int().min(1).max(1000),
  weight: z.coerce.number().min(0).max(2000),
  unit: z.enum(["kg", "lb"]),
});

export async function addSet(formData: FormData) {
  const { userId } = await verifySession();
  const { workoutExerciseId, reps, weight, unit } = addSetSchema.parse({
    workoutExerciseId: formData.get("workoutExerciseId"),
    reps: formData.get("reps"),
    weight: formData.get("weight"),
    unit: formData.get("unit"),
  });

  const workoutId = await assertOwnsWorkoutExercise(workoutExerciseId, userId);
  const supabase = await createClient();

  const { count } = await supabase
    .from("exercise_sets")
    .select("id", { count: "exact", head: true })
    .eq("workout_exercise_id", workoutExerciseId);

  const { error } = await supabase.from("exercise_sets").insert({
    workout_exercise_id: workoutExerciseId,
    set_number: (count ?? 0) + 1,
    reps,
    weight,
    unit,
  });

  if (error) throw error;
  revalidatePath(`/workouts/${workoutId}`);
}

const deleteSetSchema = z.object({
  setId: z.string().uuid(),
  workoutExerciseId: z.string().uuid(),
});

export async function deleteSet(formData: FormData) {
  const { userId } = await verifySession();
  const { setId, workoutExerciseId } = deleteSetSchema.parse({
    setId: formData.get("setId"),
    workoutExerciseId: formData.get("workoutExerciseId"),
  });

  const workoutId = await assertOwnsWorkoutExercise(workoutExerciseId, userId);
  const supabase = await createClient();

  const { error } = await supabase.from("exercise_sets").delete().eq("id", setId);

  if (error) throw error;
  revalidatePath(`/workouts/${workoutId}`);
}

const deleteWorkoutSchema = z.object({ workoutId: z.string().uuid() });

export async function deleteWorkout(formData: FormData) {
  const { userId } = await verifySession();
  const { workoutId } = deleteWorkoutSchema.parse({
    workoutId: formData.get("workoutId"),
  });

  await assertOwnsWorkout(workoutId, userId);
  const supabase = await createClient();

  const { error } = await supabase.from("workouts").delete().eq("id", workoutId);

  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/history");
  redirect("/history");
}
