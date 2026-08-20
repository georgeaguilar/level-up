import type { ExerciseSet } from "@/lib/types";
import { addSet, deleteSet } from "@/app/(app)/workouts/actions";
import { getDictionary } from "@/i18n/server";

type SetRowsProps = {
  workoutExerciseId: string;
  sets: ExerciseSet[];
};

/** Lista de series de un ejercicio de pesas + fila para agregar la siguiente. */
export async function SetRows({ workoutExerciseId, sets }: SetRowsProps) {
  const lastSet = sets[sets.length - 1];
  const { t } = await getDictionary();

  return (
    <div className="flex flex-col gap-2">
      {sets.length > 0 && (
        <div className="flex flex-col gap-1">
          {sets.map((set) => (
            <div
              key={set.id}
              className="flex items-center justify-between gap-2 border border-iron bg-floor px-3 py-2 text-sm"
            >
              <span className="font-mono text-chalk-dim">#{set.set_number}</span>
              <span className="flex-1 text-right font-mono text-chalk">
                {set.reps} reps × {set.weight} {set.unit}
                {set.rir !== null && <span className="text-chalk-dim"> · RIR {set.rir}</span>}
              </span>
              <form action={deleteSet}>
                <input type="hidden" name="setId" value={set.id} />
                <input type="hidden" name="workoutExerciseId" value={workoutExerciseId} />
                <button
                  type="submit"
                  aria-label={t("setRows.deleteSet")}
                  className="-m-2 p-2 text-chalk-dim hover:text-plate-red"
                >
                  ✕
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form action={addSet} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="workoutExerciseId" value={workoutExerciseId} />

        <label className="flex min-w-0 flex-1 basis-16 flex-col gap-1 text-xs tracking-wide text-chalk-dim uppercase">
          {t("setRows.reps")}
          <input
            type="number"
            name="reps"
            inputMode="numeric"
            min={1}
            max={1000}
            required
            defaultValue={lastSet?.reps}
            className="w-full border border-iron bg-floor px-2 py-2 font-mono text-base text-chalk"
          />
        </label>

        <label className="flex min-w-0 flex-1 basis-20 flex-col gap-1 text-xs tracking-wide text-chalk-dim uppercase">
          {t("setRows.weight")}
          <input
            type="number"
            name="weight"
            inputMode="decimal"
            step="0.5"
            min={0}
            max={2000}
            required
            defaultValue={lastSet?.weight}
            className="w-full border border-iron bg-floor px-2 py-2 font-mono text-base text-chalk"
          />
        </label>

        <label className="flex shrink-0 flex-col gap-1 text-xs tracking-wide text-chalk-dim uppercase">
          {t("setRows.unit")}
          <select
            name="unit"
            defaultValue={lastSet?.unit ?? "kg"}
            className="border border-iron bg-floor px-2 py-2 text-base text-chalk"
          >
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </label>

        <label className="flex shrink-0 flex-col gap-1 text-xs tracking-wide text-chalk-dim uppercase">
          {t("setRows.rir")}
          {/* Sin prellenar: a diferencia de reps/peso, un valor de relleno
              escribiría un RIR que el usuario no pensó y envenenaría el
              promedio del dashboard. */}
          <select
            name="rir"
            defaultValue=""
            className="border border-iron bg-floor px-2 py-2 text-base text-chalk"
          >
            <option value="">{t("setRows.rirNone")}</option>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </label>

        <button
          type="submit"
          className="basis-full border border-plate-red bg-plate-red px-3 py-2 text-sm font-medium text-chalk transition-colors active:bg-plate-red-dim sm:basis-auto"
        >
          {t("setRows.addSet")}
        </button>
      </form>
    </div>
  );
}
