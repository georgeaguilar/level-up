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
    <div className="flex flex-col gap-3 border border-iron bg-surface p-4">
      <h3 className="font-display text-sm tracking-[0.2em] text-chalk-dim">
        AGREGAR EJERCICIO
      </h3>

      <form action={addExerciseToWorkout} className="flex gap-2">
        <input type="hidden" name="workoutId" value={workoutId} />
        <select
          name="exerciseId"
          required
          defaultValue=""
          className="min-w-0 flex-1 border border-iron bg-floor px-3 py-2 text-base text-chalk"
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
          className="shrink-0 border border-plate-red bg-plate-red px-4 py-2 text-sm font-medium text-chalk transition-colors active:bg-plate-red-dim"
        >
          Agregar
        </button>
      </form>

      <details className="text-sm">
        <summary className="cursor-pointer text-chalk-dim hover:text-chalk">
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
            className="border border-iron bg-floor px-3 py-2 text-base text-chalk placeholder:text-chalk-dim"
          />
          <div className="flex gap-2">
            <select
              name="kind"
              defaultValue="strength"
              className="min-w-0 flex-1 border border-iron bg-floor px-3 py-2 text-base text-chalk"
            >
              <option value="strength">Pesas</option>
              <option value="cardio">Cardio</option>
            </select>
            <button
              type="submit"
              className="shrink-0 border border-iron-bright px-4 py-2 text-sm font-medium text-chalk hover:border-chalk-dim"
            >
              Crear y agregar
            </button>
          </div>
        </form>
      </details>
    </div>
  );
}
