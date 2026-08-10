// Sin "server-only": lo usa también `exercise-picker.tsx`, que es client
// component (necesita filtrar/ordenar el catálogo en el navegador).
import type { Equipment, Exercise, MuscleGroup } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { BCP47 } from "@/i18n/config";

// Orden canónico para chips de filtro y los <select> de "crear ejercicio".
// `as const satisfies` conserva el tipo tupla literal (lo necesita `z.enum`
// en `workouts/actions.ts`) a la vez que valida contra `MuscleGroup`/`Equipment`.
export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "lats",
  "traps",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "core",
  "full_body",
  "cardio",
] as const satisfies readonly MuscleGroup[];

export const EQUIPMENT_OPTIONS = [
  "barbell",
  "ez_bar",
  "dumbbell",
  "kettlebell",
  "machine",
  "cable",
  "smith",
  "bodyweight",
  "band",
  "plate",
  "sled",
  "bench",
  "cardio_machine",
  "other",
] as const satisfies readonly Equipment[];

/** Nombre a mostrar según idioma: `name_en` en el catálogo global si existe, si no `name`. */
export function exerciseName(exercise: Exercise, locale: Locale): string {
  if (locale === "en" && exercise.name_en) return exercise.name_en;
  return exercise.name;
}

/** Copia ordenada por nombre visible, usando el collator del idioma activo. */
export function sortExercises(exercises: Exercise[], locale: Locale): Exercise[] {
  const collator = new Intl.Collator(BCP47[locale]);
  return [...exercises].sort((a, b) => collator.compare(exerciseName(a, locale), exerciseName(b, locale)));
}

/** minúsculas + sin diacríticos, para que "biceps" encuentre "Curl de bíceps". */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** true si `exercise` coincide con `query` en cualquiera de sus dos nombres. */
export function matchesQuery(exercise: Exercise, query: string): boolean {
  const needle = normalize(query);
  if (!needle) return true;
  return (
    normalize(exercise.name).includes(needle) ||
    (exercise.name_en ? normalize(exercise.name_en).includes(needle) : false)
  );
}
