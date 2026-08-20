import type { CSSProperties } from "react";
import type { ExerciseSet } from "@/lib/types";
import { addSet, deleteSet } from "@/app/(app)/workouts/actions";
import { getDictionary } from "@/i18n/server";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SetRowsProps = {
  workoutExerciseId: string;
  sets: ExerciseSet[];
};

/** Lista de series de un ejercicio de pesas + fila para agregar la siguiente. */
export async function SetRows({ workoutExerciseId, sets }: SetRowsProps) {
  const lastSet = sets[sets.length - 1];
  const { t } = await getDictionary();
  const idFor = (field: string) => `${workoutExerciseId}-${field}`;

  return (
    <div className="flex flex-col gap-2">
      {sets.length > 0 && (
        <div className="flex flex-col gap-1">
          {sets.map((set, index) => (
            <div
              key={set.id}
              className="stagger-item flex items-center justify-between gap-2 rounded-sm border border-iron bg-surface-raised px-3 py-2 text-sm shadow-elev-1"
              style={{ "--stagger-index": index } as CSSProperties}
            >
              <span className="font-mono text-chalk-dim">#{set.set_number}</span>
              <span className="flex-1 text-right font-mono text-chalk">
                {set.reps} reps × {set.weight} {set.unit}
                {set.rir !== null && <span className="text-chalk-dim"> · RIR {set.rir}</span>}
              </span>
              <form action={deleteSet}>
                <input type="hidden" name="setId" value={set.id} />
                <input type="hidden" name="workoutExerciseId" value={workoutExerciseId} />
                <Button type="submit" variant="danger" aria-label={t("setRows.deleteSet")}>
                  ✕
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form action={addSet} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="workoutExerciseId" value={workoutExerciseId} />

        <Field label={t("setRows.reps")} htmlFor={idFor("reps")} className="min-w-0 flex-1 basis-16">
          <Input
            id={idFor("reps")}
            type="number"
            name="reps"
            inputMode="numeric"
            min={1}
            max={1000}
            required
            defaultValue={lastSet?.reps}
            className="font-mono"
          />
        </Field>

        <Field label={t("setRows.weight")} htmlFor={idFor("weight")} className="min-w-0 flex-1 basis-20">
          <Input
            id={idFor("weight")}
            type="number"
            name="weight"
            inputMode="decimal"
            step="0.5"
            min={0}
            max={2000}
            required
            defaultValue={lastSet?.weight}
            className="font-mono"
          />
        </Field>

        <Field label={t("setRows.unit")} htmlFor={idFor("unit")} className="shrink-0">
          <Select id={idFor("unit")} name="unit" defaultValue={lastSet?.unit ?? "kg"}>
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </Select>
        </Field>

        <Field label={t("setRows.rir")} htmlFor={idFor("rir")} className="shrink-0">
          {/* Sin prellenar: a diferencia de reps/peso, un valor de relleno
              escribiría un RIR que el usuario no pensó y envenenaría el
              promedio del dashboard. */}
          <Select id={idFor("rir")} name="rir" defaultValue="">
            <option value="">{t("setRows.rirNone")}</option>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </Select>
        </Field>

        <Button type="submit" size="sm" className="basis-full sm:basis-auto">
          {t("setRows.addSet")}
        </Button>
      </form>
    </div>
  );
}
