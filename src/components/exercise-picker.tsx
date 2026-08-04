import type { Exercise } from "@/lib/types";
import { addExerciseToWorkout, createCustomExercise } from "@/app/(app)/workouts/actions";

type ExercisePickerProps = {
  workoutId: string;
  exercises: Exercise[];
};

/**
 * Selector de ejercicio del catálogo (global + propios) más un formulario
 * para crear uno nuevo. Todo se renderiza en servidor: el <select> nativo
 * ya permite buscar escribiendo, sin necesitar JS de cliente.
 */
export function ExercisePicker({ workoutId, exercises }: ExercisePickerProps) {
  const strength = exercises.filter((e) => e.kind === "strength");
  const cardio = exercises.filter((e) => e.kind === "cardio");

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h3 className="text-sm font-medium">Agregar ejercicio</h3>

      <form action={addExerciseToWorkout} className="flex gap-2">
        <input type="hidden" name="workoutId" value={workoutId} />
        <select
          name="exerciseId"
          required
          defaultValue=""
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="" disabled>
            Elige un ejercicio…
          </option>
          {strength.length > 0 && (
            <optgroup label="Pesas">
              {strength.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </optgroup>
          )}
          {cardio.length > 0 && (
            <optgroup label="Cardio">
              {cardio.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <button
          type="submit"
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Agregar
        </button>
      </form>

      <details className="text-sm">
        <summary className="cursor-pointer text-zinc-600 dark:text-zinc-400">
          ¿No está en la lista? Crea tu propio ejercicio
        </summary>
        <form action={createCustomExercise} className="mt-3 flex flex-col gap-2">
          <input type="hidden" name="workoutId" value={workoutId} />
          <input
            type="text"
            name="name"
            placeholder="Nombre del ejercicio"
            required
            maxLength={80}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
          />
          <div className="flex gap-2">
            <select
              name="kind"
              defaultValue="strength"
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="strength">Pesas</option>
              <option value="cardio">Cardio</option>
            </select>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
            >
              Crear y agregar
            </button>
          </div>
        </form>
      </details>
    </div>
  );
}
