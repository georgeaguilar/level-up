import { setCardioDuration } from "@/app/(app)/workouts/actions";
import { getDictionary } from "@/i18n/server";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const idFor = (field: string) => `${workoutExerciseId}-${field}`;

  return (
    <form action={setCardioDuration} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="workoutExerciseId" value={workoutExerciseId} />

      <Field label={t("cardioDuration.minutes")} htmlFor={idFor("minutes")} className="min-w-0 flex-1 basis-20">
        <Input
          id={idFor("minutes")}
          type="number"
          name="minutes"
          inputMode="numeric"
          min={0}
          max={600}
          required
          defaultValue={minutes}
          className="font-mono"
        />
      </Field>

      <Field label={t("cardioDuration.seconds")} htmlFor={idFor("seconds")} className="min-w-0 flex-1 basis-20">
        <Input
          id={idFor("seconds")}
          type="number"
          name="seconds"
          inputMode="numeric"
          min={0}
          max={59}
          required
          defaultValue={seconds ?? 0}
          className="font-mono"
        />
      </Field>

      <Button
        type="submit"
        size="sm"
        className="basis-full border-plate-blue bg-plate-blue-dim hover:bg-plate-blue active:bg-plate-blue-dim sm:basis-auto"
      >
        {t("cardioDuration.save")}
      </Button>
    </form>
  );
}
