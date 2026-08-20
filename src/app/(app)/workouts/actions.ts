"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n/server";
import { EQUIPMENT_OPTIONS, MUSCLE_GROUPS } from "@/lib/exercise-display";

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
  if (!data) {
    const { t } = await getDictionary();
    throw new Error(t("errors.unauthorized"));
  }
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

// El <select> de grupo muscular/equipo es opcional y envía "" sin elegir nada.
// El de RIR además puede venir ausente del todo (formularios ya renderizados
// antes de este campo), y ahí formData.get() devuelve null en vez de "".
const emptyToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);

const createCustomExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  kind: z.enum(["strength", "cardio"]),
  muscleGroup: z.preprocess(emptyToUndefined, z.enum(MUSCLE_GROUPS).optional()),
  equipment: z.preprocess(emptyToUndefined, z.enum(EQUIPMENT_OPTIONS).optional()),
});

export async function createCustomExercise(formData: FormData) {
  const { userId } = await verifySession();
  const { workoutId, name, kind, muscleGroup, equipment } = createCustomExerciseSchema.parse({
    workoutId: formData.get("workoutId"),
    name: formData.get("name"),
    kind: formData.get("kind"),
    muscleGroup: formData.get("muscleGroup"),
    equipment: formData.get("equipment"),
  });

  await assertOwnsWorkout(workoutId, userId);
  const supabase = await createClient();

  const { data: exercise, error: exerciseError } = await supabase
    .from("exercises")
    .insert({
      user_id: userId,
      name,
      kind,
      muscle_group: muscleGroup ?? null,
      equipment: equipment ?? null,
    })
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
  if (!data) {
    const { t } = await getDictionary();
    throw new Error(t("errors.unauthorized"));
  }
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
  // Reps en reserva: opcional, sin prellenar. El select manda "" si no se elige.
  rir: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).max(10).optional()),
});

export async function addSet(formData: FormData) {
  const { userId } = await verifySession();
  const { workoutExerciseId, reps, weight, unit, rir } = addSetSchema.parse({
    workoutExerciseId: formData.get("workoutExerciseId"),
    reps: formData.get("reps"),
    weight: formData.get("weight"),
    unit: formData.get("unit"),
    rir: formData.get("rir"),
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
    rir: rir ?? null,
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

const sessionSchema = z.object({ workoutId: z.string().uuid() });

/** Marca el inicio de la sesión. Si ya estaba iniciada, no hace nada (evita
 * que un doble submit reinicie el reloj). */
export async function startWorkoutSession(formData: FormData) {
  const { userId } = await verifySession();
  const { workoutId } = sessionSchema.parse({ workoutId: formData.get("workoutId") });

  await assertOwnsWorkout(workoutId, userId);
  const supabase = await createClient();

  const { error } = await supabase
    .from("workouts")
    .update({ started_at: new Date().toISOString(), ended_at: null })
    .eq("id", workoutId)
    .is("started_at", null);

  if (error) throw error;
  revalidatePath(`/workouts/${workoutId}`);
  revalidatePath("/progress");
}

/** Marca el fin de la sesión. Solo aplica si ya estaba iniciada y aún no
 * terminada. */
export async function finishWorkoutSession(formData: FormData) {
  const { userId } = await verifySession();
  const { workoutId } = sessionSchema.parse({ workoutId: formData.get("workoutId") });

  await assertOwnsWorkout(workoutId, userId);
  const supabase = await createClient();

  const { error } = await supabase
    .from("workouts")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", workoutId)
    .not("started_at", "is", null)
    .is("ended_at", null);

  if (error) throw error;
  revalidatePath(`/workouts/${workoutId}`);
  revalidatePath("/progress");
}

export async function resetWorkoutSession(formData: FormData) {
  const { userId } = await verifySession();
  const { workoutId } = sessionSchema.parse({ workoutId: formData.get("workoutId") });

  await assertOwnsWorkout(workoutId, userId);
  const supabase = await createClient();

  const { error } = await supabase
    .from("workouts")
    .update({ started_at: null, ended_at: null })
    .eq("id", workoutId);

  if (error) throw error;
  revalidatePath(`/workouts/${workoutId}`);
  revalidatePath("/progress");
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
