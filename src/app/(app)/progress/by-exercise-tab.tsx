import { getCardioProgress, getExerciseProgress, getLoggedExercises } from "@/lib/dal";
import { CardioChart, ProgressChart } from "@/components/progress-chart";
import { getDictionary } from "@/i18n/server";
import { exerciseName, sortExercises } from "@/lib/exercise-display";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ProgressParams } from "@/lib/progress-params";

/** Pestaña "Por ejercicio": gráfica de progresión de un solo ejercicio (comportamiento original de /progress). */
export async function ByExerciseTab({ params }: { params: ProgressParams }) {
  const [loggedExercises, { locale, t }] = await Promise.all([getLoggedExercises(), getDictionary()]);
  const exercises = sortExercises(loggedExercises, locale);
  const selected = exercises.find((e) => e.id === params.exercise) ?? exercises[0];

  if (exercises.length === 0) {
    return <p className="text-sm text-chalk-dim">{t("progress.noLoggedExercises")}</p>;
  }

  const strength = exercises.filter((e) => e.kind === "strength");
  const cardio = exercises.filter((e) => e.kind === "cardio");

  const data = selected
    ? selected.kind === "strength"
      ? await getExerciseProgress(selected.id)
      : await getCardioProgress(selected.id)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <form action="/progress" method="get" className="flex gap-2">
        {/* Un GET <form> reemplaza el query string completo: sin estos dos
            hidden inputs se perdería la pestaña y el rango al cambiar de
            ejercicio. */}
        <input type="hidden" name="tab" value="ejercicio" />
        <input type="hidden" name="range" value={params.range} />
        <Select name="exercise" defaultValue={selected?.id} className="min-w-0 flex-1">
          {strength.length > 0 && (
            <optgroup label={t("exerciseKind.strength")}>
              {strength.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exerciseName(exercise, locale)}
                </option>
              ))}
            </optgroup>
          )}
          {cardio.length > 0 && (
            <optgroup label={t("exerciseKind.cardio")}>
              {cardio.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exerciseName(exercise, locale)}
                </option>
              ))}
            </optgroup>
          )}
        </Select>
        <Button type="submit" size="sm" className="shrink-0">
          {t("progress.viewButton")}
        </Button>
      </form>

      {selected && (
        <Card padding="md" className="rounded-lg">
          <h2 className="mb-3 text-base font-semibold text-chalk">{exerciseName(selected, locale)}</h2>
          {selected.kind === "strength" ? (
            <ProgressChart data={data as Awaited<ReturnType<typeof getExerciseProgress>>} />
          ) : (
            <CardioChart data={data as Awaited<ReturnType<typeof getCardioProgress>>} />
          )}
        </Card>
      )}
    </div>
  );
}
