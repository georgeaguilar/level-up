import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n/server";

async function unauthorized(): Promise<never> {
  const { t } = await getDictionary();
  throw new Error(t("errors.unauthorized"));
}

export async function assertOwnsWorkout(workoutId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select("id")
    .eq("id", workoutId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) await unauthorized();
}

/** Devuelve el workout_id padre. */
export async function assertOwnsWorkoutExercise(workoutExerciseId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_exercises")
    .select("id, workout_id, workouts!inner(user_id)")
    .eq("id", workoutExerciseId)
    .eq("workouts.user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) await unauthorized();
  return data!.workout_id as string;
}

export async function assertOwnsTemplate(templateId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routine_templates")
    .select("id")
    .eq("id", templateId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) await unauthorized();
}

/** Devuelve el template_id padre. */
export async function assertOwnsTemplateExercise(templateExerciseId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routine_template_exercises")
    .select("id, template_id, routine_templates!inner(user_id)")
    .eq("id", templateExerciseId)
    .eq("routine_templates.user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) await unauthorized();
  return data!.template_id as string;
}
