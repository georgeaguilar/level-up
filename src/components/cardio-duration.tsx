import { setCardioDuration } from "@/app/(app)/workouts/actions";

type CardioDurationProps = {
  workoutExerciseId: string;
  durationSeconds: number | null;
};

/** Formulario de tiempo (min : seg) para un ejercicio de cardio. */
export function CardioDuration({
  workoutExerciseId,
  durationSeconds,
}: CardioDurationProps) {
  const minutes = durationSeconds ? Math.floor(durationSeconds / 60) : undefined;
  const seconds = durationSeconds ? durationSeconds % 60 : undefined;

  return (
    <form action={setCardioDuration} className="flex items-end gap-2">
      <input type="hidden" name="workoutExerciseId" value={workoutExerciseId} />

      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Minutos
        <input
          type="number"
          name="minutes"
          inputMode="numeric"
          min={0}
          max={600}
          required
          defaultValue={minutes}
          className="w-20 rounded-md border border-zinc-300 px-2 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Segundos
        <input
          type="number"
          name="seconds"
          inputMode="numeric"
          min={0}
          max={59}
          required
          defaultValue={seconds ?? 0}
          className="w-20 rounded-md border border-zinc-300 px-2 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <button
        type="submit"
        className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        Guardar
      </button>
    </form>
  );
}
