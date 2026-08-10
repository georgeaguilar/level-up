import { setCardioDuration } from "@/app/(app)/workouts/actions";
import { getDictionary } from "@/i18n/server";

type CardioDurationProps = {
  workoutExerciseId: string;
  durationSeconds: number | null;
};

/** Formulario de tiempo (min : seg) para un ejercicio de cardio. */
export async function CardioDuration({
  workoutExerciseId,
  durationSeconds,
}: CardioDurationProps) {
  const minutes = durationSeconds ? Math.floor(durationSeconds / 60) : undefined;
  const seconds = durationSeconds ? durationSeconds % 60 : undefined;
  const { t } = await getDictionary();

  return (
    <form action={setCardioDuration} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="workoutExerciseId" value={workoutExerciseId} />

      <label className="flex min-w-0 flex-1 basis-20 flex-col gap-1 text-xs tracking-wide text-chalk-dim uppercase">
        {t("cardioDuration.minutes")}
        <input
          type="number"
          name="minutes"
          inputMode="numeric"
          min={0}
          max={600}
          required
          defaultValue={minutes}
          className="w-full border border-iron bg-floor px-2 py-2 font-mono text-base text-chalk"
        />
      </label>

      <label className="flex min-w-0 flex-1 basis-20 flex-col gap-1 text-xs tracking-wide text-chalk-dim uppercase">
        {t("cardioDuration.seconds")}
        <input
          type="number"
          name="seconds"
          inputMode="numeric"
          min={0}
          max={59}
          required
          defaultValue={seconds ?? 0}
          className="w-full border border-iron bg-floor px-2 py-2 font-mono text-base text-chalk"
        />
      </label>

      <button
        type="submit"
        className="basis-full border border-plate-blue bg-plate-blue-dim px-3 py-2 text-sm font-medium text-chalk transition-colors hover:bg-plate-blue sm:basis-auto"
      >
        {t("cardioDuration.save")}
      </button>
    </form>
  );
}
