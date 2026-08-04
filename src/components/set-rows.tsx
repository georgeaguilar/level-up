import type { ExerciseSet } from "@/lib/types";
import { addSet, deleteSet } from "@/app/(app)/workouts/actions";

type SetRowsProps = {
  workoutExerciseId: string;
  sets: ExerciseSet[];
};

/** Lista de series de un ejercicio de pesas + fila para agregar la siguiente. */
export function SetRows({ workoutExerciseId, sets }: SetRowsProps) {
  const lastSet = sets[sets.length - 1];

  return (
    <div className="flex flex-col gap-2">
      {sets.length > 0 && (
        <div className="flex flex-col gap-1">
          {sets.map((set) => (
            <div
              key={set.id}
              className="flex items-center justify-between gap-2 rounded-md bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900"
            >
              <span className="text-zinc-500">#{set.set_number}</span>
              <span className="flex-1 text-right font-medium">
                {set.reps} reps × {set.weight} {set.unit}
              </span>
              <form action={deleteSet}>
                <input type="hidden" name="setId" value={set.id} />
                <input type="hidden" name="workoutExerciseId" value={workoutExerciseId} />
                <button
                  type="submit"
                  aria-label="Borrar serie"
                  className="text-zinc-400 hover:text-red-600"
                >
                  ✕
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form action={addSet} className="flex items-end gap-2">
        <input type="hidden" name="workoutExerciseId" value={workoutExerciseId} />

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Reps
          <input
            type="number"
            name="reps"
            inputMode="numeric"
            min={1}
            max={1000}
            required
            defaultValue={lastSet?.reps}
            className="w-16 rounded-md border border-zinc-300 px-2 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Peso
          <input
            type="number"
            name="weight"
            inputMode="decimal"
            step="0.5"
            min={0}
            max={2000}
            required
            defaultValue={lastSet?.weight}
            className="w-20 rounded-md border border-zinc-300 px-2 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Unidad
          <select
            name="unit"
            defaultValue={lastSet?.unit ?? "kg"}
            className="rounded-md border border-zinc-300 px-2 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </label>

        <button
          type="submit"
          className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          + Serie
        </button>
      </form>
    </div>
  );
}
