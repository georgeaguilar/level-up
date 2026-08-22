"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/lib/dal";
import {
  assertOwnsTemplate,
  assertOwnsTemplateExercise,
  assertOwnsWorkout,
} from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { EQUIPMENT_OPTIONS, MUSCLE_GROUPS } from "@/lib/exercise-display";

const nameSchema = z.string().trim().min(1).max(60);

/**
 * Resuelve choques de nombre añadiendo " (2)", " (3)"… El índice único de la
 * migración es case-insensitive y sin espacios de sobra, así que aquí se
 * normaliza igual. Se prefiere renombrar en silencio a reventar con un 23505:
 * las Server Actions de este repo devuelven void y no hay toasts ni
 * useActionState fuera de auth-form.tsx, así que un error de Postgres se vería
 * como una pantalla de error, no como feedback.
 */
async function availableTemplateName(userId: string, name: string, excludeId?: string) {
  const supabase = await createClient();
  const query = supabase.from("routine_templates").select("id, name").eq("user_id", userId);
  const { data, error } = excludeId ? await query.neq("id", excludeId) : await query;
  if (error) throw error;

  const taken = new Set(data.map((row) => row.name.trim().toLowerCase()));
  const base = name.trim();
  if (!taken.has(base.toLowerCase())) return base;

  for (let n = 2; n <= 99; n++) {
    const candidate = `${base} (${n})`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
  return `${base} (${Date.now()})`;
}

/**
 * Siguiente posición libre = max(position) + 1, no `count`. `count` (lo que
 * hace addExerciseToWorkout) se rompe en cuanto se borra una fila intermedia:
 * quedan dos filas con la misma posición y el orden pasa a ser indefinido.
 */
async function nextTemplateExercisePosition(templateId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routine_template_exercises")
    .select("position")
    .eq("template_id", templateId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.position ?? -1) + 1;
}

const createTemplateSchema = z.object({ name: nameSchema });

export async function createTemplate(formData: FormData) {
  const { userId } = await verifySession();
  const { name } = createTemplateSchema.parse({ name: formData.get("name") });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routine_templates")
    .insert({ user_id: userId, name: await availableTemplateName(userId, name) })
    .select("id")
    .single();

  if (error) throw error;
  revalidatePath("/templates");
  // Se crea vacía → aterriza directo en el detalle para llenarla.
  redirect(`/templates/${data.id}`);
}

const renameTemplateSchema = z.object({ templateId: z.string().uuid(), name: nameSchema });

export async function renameTemplate(formData: FormData) {
  const { userId } = await verifySession();
  const { templateId, name } = renameTemplateSchema.parse({
    templateId: formData.get("templateId"),
    name: formData.get("name"),
  });

  await assertOwnsTemplate(templateId, userId);
  const supabase = await createClient();

  const { error } = await supabase
    .from("routine_templates")
    // excludeId: renombrar "Push" a "Push" no debe convertirlo en "Push (2)".
    .update({ name: await availableTemplateName(userId, name, templateId) })
    .eq("id", templateId);

  if (error) throw error;
  revalidatePath("/templates");
  revalidatePath(`/templates/${templateId}`);
}

const templateSchema = z.object({ templateId: z.string().uuid() });

export async function deleteTemplate(formData: FormData) {
  const { userId } = await verifySession();
  const { templateId } = templateSchema.parse({ templateId: formData.get("templateId") });

  await assertOwnsTemplate(templateId, userId);
  const supabase = await createClient();

  // Los ejercicios de la plantilla se van por el `on delete cascade` del FK.
  const { error } = await supabase.from("routine_templates").delete().eq("id", templateId);

  if (error) throw error;
  revalidatePath("/templates");
  redirect("/templates");
}

const addExerciseSchema = z.object({
  templateId: z.string().uuid(),
  exerciseId: z.string().uuid(),
});

export async function addExerciseToTemplate(formData: FormData) {
  const { userId } = await verifySession();
  const { templateId, exerciseId } = addExerciseSchema.parse({
    templateId: formData.get("templateId"),
    exerciseId: formData.get("exerciseId"),
  });

  await assertOwnsTemplate(templateId, userId);
  const supabase = await createClient();

  // Sin series ni reps, repetir un ejercicio en la misma plantilla no aporta
  // nada — y el índice único lo prohíbe. Se sale sin error: para el usuario
  // "agregar algo que ya está" es un no-op, no un fallo.
  const { data: existing, error: existingError } = await supabase
    .from("routine_template_exercises")
    .select("id")
    .eq("template_id", templateId)
    .eq("exercise_id", exerciseId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return;

  const { error } = await supabase.from("routine_template_exercises").insert({
    template_id: templateId,
    exercise_id: exerciseId,
    position: await nextTemplateExercisePosition(templateId),
  });

  if (error) throw error;
  revalidatePath(`/templates/${templateId}`);
  revalidatePath("/templates");
}

// El <select> de grupo muscular/equipo es opcional y envía "" sin elegir nada.
const emptyToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);

const createCustomExerciseSchema = z.object({
  templateId: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  kind: z.enum(["strength", "cardio"]),
  muscleGroup: z.preprocess(emptyToUndefined, z.enum(MUSCLE_GROUPS).optional()),
  equipment: z.preprocess(emptyToUndefined, z.enum(EQUIPMENT_OPTIONS).optional()),
});

export async function createCustomExerciseForTemplate(formData: FormData) {
  const { userId } = await verifySession();
  const { templateId, name, kind, muscleGroup, equipment } = createCustomExerciseSchema.parse({
    templateId: formData.get("templateId"),
    name: formData.get("name"),
    kind: formData.get("kind"),
    muscleGroup: formData.get("muscleGroup"),
    equipment: formData.get("equipment"),
  });

  await assertOwnsTemplate(templateId, userId);
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

  const { error } = await supabase.from("routine_template_exercises").insert({
    template_id: templateId,
    exercise_id: exercise.id,
    position: await nextTemplateExercisePosition(templateId),
  });

  if (error) throw error;
  revalidatePath(`/templates/${templateId}`);
  revalidatePath("/templates");
}

const templateExerciseSchema = z.object({ templateExerciseId: z.string().uuid() });

export async function removeTemplateExercise(formData: FormData) {
  const { userId } = await verifySession();
  const { templateExerciseId } = templateExerciseSchema.parse({
    templateExerciseId: formData.get("templateExerciseId"),
  });

  const templateId = await assertOwnsTemplateExercise(templateExerciseId, userId);
  const supabase = await createClient();

  const { error } = await supabase
    .from("routine_template_exercises")
    .delete()
    .eq("id", templateExerciseId);

  if (error) throw error;
  revalidatePath(`/templates/${templateId}`);
  revalidatePath("/templates");
}

const moveTemplateExerciseSchema = z.object({
  templateExerciseId: z.string().uuid(),
  direction: z.enum(["up", "down"]),
});

/** Sube o baja un ejercicio de la plantilla un puesto (swap con el vecino).
 * No-op si ya está en el extremo correspondiente. */
export async function moveTemplateExercise(formData: FormData) {
  const { userId } = await verifySession();
  const { templateExerciseId, direction } = moveTemplateExerciseSchema.parse({
    templateExerciseId: formData.get("templateExerciseId"),
    direction: formData.get("direction"),
  });

  const templateId = await assertOwnsTemplateExercise(templateExerciseId, userId);
  const supabase = await createClient();

  const { data: rows, error: rowsError } = await supabase
    .from("routine_template_exercises")
    .select("id, position")
    .eq("template_id", templateId)
    .order("position", { ascending: true });

  if (rowsError) throw rowsError;

  const index = rows.findIndex((row) => row.id === templateExerciseId);
  const neighbor = index === -1 ? undefined : rows[direction === "up" ? index - 1 : index + 1];
  if (!neighbor) return;

  // Swap directo, dos updates en paralelo. Es seguro porque no hay
  // `unique (template_id, position)` — ver la nota de la migración.
  const [a, b] = await Promise.all([
    supabase
      .from("routine_template_exercises")
      .update({ position: neighbor.position })
      .eq("id", rows[index].id),
    supabase
      .from("routine_template_exercises")
      .update({ position: rows[index].position })
      .eq("id", neighbor.id),
  ]);

  if (a.error) throw a.error;
  if (b.error) throw b.error;
  revalidatePath(`/templates/${templateId}`);
  revalidatePath("/templates");
}

const applyTemplateSchema = z.object({
  workoutId: z.string().uuid(),
  templateId: z.string().uuid(),
});

/**
 * Añade los ejercicios de la plantilla al final del entrenamiento, sin tocar
 * lo que ya hubiera. Un solo INSERT con todas las filas: nada de un round
 * trip por ejercicio.
 */
export async function applyTemplateToWorkout(formData: FormData) {
  const { userId } = await verifySession();
  const { workoutId, templateId } = applyTemplateSchema.parse({
    workoutId: formData.get("workoutId"),
    templateId: formData.get("templateId"),
  });

  await Promise.all([
    assertOwnsWorkout(workoutId, userId),
    assertOwnsTemplate(templateId, userId),
  ]);

  const supabase = await createClient();

  const [template, last] = await Promise.all([
    supabase
      .from("routine_template_exercises")
      .select("exercise_id")
      .eq("template_id", templateId)
      .order("position", { ascending: true }),
    supabase
      .from("workout_exercises")
      .select("position")
      .eq("workout_id", workoutId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (template.error) throw template.error;
  if (last.error) throw last.error;
  // Plantilla vacía: `.insert([])` sería un 400 de PostgREST, no un no-op.
  if (template.data.length === 0) return;

  // Base = max(position) + 1, no `count`: si el usuario borró un ejercicio de
  // en medio, `count` chocaría con una posición ya usada.
  const base = (last.data?.position ?? -1) + 1;

  const { error } = await supabase.from("workout_exercises").insert(
    template.data.map((row, index) => ({
      workout_id: workoutId,
      exercise_id: row.exercise_id,
      position: base + index,
    })),
  );

  if (error) throw error;
  revalidatePath(`/workouts/${workoutId}`);
}

const saveWorkoutAsTemplateSchema = z.object({
  workoutId: z.string().uuid(),
  name: nameSchema,
});

export async function saveWorkoutAsTemplate(formData: FormData) {
  const { userId } = await verifySession();
  const { workoutId, name } = saveWorkoutAsTemplateSchema.parse({
    workoutId: formData.get("workoutId"),
    name: formData.get("name"),
  });

  await assertOwnsWorkout(workoutId, userId);
  const supabase = await createClient();

  const { data: rows, error: rowsError } = await supabase
    .from("workout_exercises")
    .select("exercise_id")
    .eq("workout_id", workoutId)
    .order("position", { ascending: true });

  if (rowsError) throw rowsError;
  if (rows.length === 0) return; // el botón no se pinta si no hay ejercicios

  // Un workout SÍ puede tener el mismo ejercicio dos veces; una plantilla no
  // (índice único). Se conserva la primera aparición y su orden.
  const exerciseIds = [...new Set(rows.map((row) => row.exercise_id))];

  const { data: template, error: templateError } = await supabase
    .from("routine_templates")
    .insert({ user_id: userId, name: await availableTemplateName(userId, name) })
    .select("id")
    .single();

  if (templateError) throw templateError;

  const { error } = await supabase.from("routine_template_exercises").insert(
    exerciseIds.map((exerciseId, index) => ({
      template_id: template.id,
      exercise_id: exerciseId,
      position: index,
    })),
  );

  if (error) throw error;
  revalidatePath("/templates");
  revalidatePath(`/workouts/${workoutId}`); // la plantilla nueva aparece en "aplicar"
}
