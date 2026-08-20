import { getCardioProgress, getExerciseProgress, getLoggedExercises } from "@/lib/dal";
import { CardioChart, ProgressChart } from "@/components/progress-chart";
import { getDictionary } from "@/i18n/server";
import { exerciseName, sortExercises } from "@/lib/exercise-display";
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
    <>
      <form action="/progress" method="get" className="flex gap-2">
        {/* Un GET <form> reemplaza el query string completo: sin estos dos
            hidden inputs se perdería la pestaña y el rango al cambiar de
            ejercicio. */}
        <input type="hidden" name="tab" value="ejercicio" />
        <input type="hidden" name="range" value={params.range} />
        <select
          name="exercise"
          defaultValue={selected?.id}
          className="min-w-0 flex-1 border border-iron bg-surface px-3 py-2 text-base text-chalk"
        >
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
        </select>
        <button
          type="submit"
          className="shrink-0 border border-plate-red bg-plate-red px-4 py-2 text-sm font-medium text-chalk transition-colors active:bg-plate-red-dim"
        >
          {t("progress.viewButton")}
        </button>
      </form>

      {selected && (
        <div>
          <h2 className="mb-3 font-display text-lg tracking-wide text-chalk-dim">
            {exerciseName(selected, locale)}
          </h2>
          {selected.kind === "strength" ? (
            <ProgressChart data={data as Awaited<ReturnType<typeof getExerciseProgress>>} />
          ) : (
            <CardioChart data={data as Awaited<ReturnType<typeof getCardioProgress>>} />
          )}
        </div>
      )}
    </>
  );
}
