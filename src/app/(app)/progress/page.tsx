import { getCardioProgress, getExerciseProgress, getExercises } from "@/lib/dal";
import { CardioChart, ProgressChart } from "@/components/progress-chart";

export default async function ProgressPage(props: PageProps<"/progress">) {
  const searchParams = await props.searchParams;
  const requestedId =
    typeof searchParams.exercise === "string" ? searchParams.exercise : undefined;

  const exercises = await getExercises();
  const selected = exercises.find((e) => e.id === requestedId) ?? exercises[0];

  const strength = exercises.filter((e) => e.kind === "strength");
  const cardio = exercises.filter((e) => e.kind === "cardio");

  const data = selected
    ? selected.kind === "strength"
      ? await getExerciseProgress(selected.id)
      : await getCardioProgress(selected.id)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Progreso</h1>

      {exercises.length === 0 ? (
        <p className="text-sm text-zinc-500">Todavía no hay ejercicios en el catálogo.</p>
      ) : (
        <>
          <form action="/progress" method="get" className="flex gap-2">
            <select
              name="exercise"
              defaultValue={selected?.id}
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
            >
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
              Ver
            </button>
          </form>

          {selected && (
            <div>
              <h2 className="mb-2 font-medium">{selected.name}</h2>
              {selected.kind === "strength" ? (
                <ProgressChart data={data as Awaited<ReturnType<typeof getExerciseProgress>>} />
              ) : (
                <CardioChart data={data as Awaited<ReturnType<typeof getCardioProgress>>} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
