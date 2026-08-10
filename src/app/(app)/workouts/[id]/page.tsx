import { notFound } from "next/navigation";
import { getExercises, getWorkout } from "@/lib/dal";
import { deleteWorkout } from "@/app/(app)/workouts/actions";
import { ExercisePicker } from "@/components/exercise-picker";
import { WorkoutExerciseCard } from "@/components/workout-exercise-card";
import { PlateBadge } from "@/components/plate-badge";
import type { WorkoutWithExercises } from "@/lib/types";
import { getDictionary } from "@/i18n/server";
import { formatNumber, formatWorkoutDate } from "@/i18n/format";

/** Kg totales movidos hoy (reps × peso, series de lb convertidas a kg). */
function totalVolumeKg(workout: WorkoutWithExercises) {
  let total = 0;
  for (const we of workout.workout_exercises) {
    for (const set of we.sets) {
      const weightKg = set.unit === "lb" ? set.weight * 0.453592 : set.weight;
      total += weightKg * set.reps;
    }
  }
  return Math.round(total);
}

export default async function WorkoutPage(props: PageProps<"/workouts/[id]">) {
  const { id } = await props.params;

  const [workout, exercises, { locale, t }] = await Promise.all([
    getWorkout(id),
    getExercises(),
    getDictionary(),
  ]);

  if (!workout) {
    notFound();
  }

  const sortedExercises = [...workout.workout_exercises].sort(
    (a, b) => a.position - b.position,
  );
  const volume = totalVolumeKg(workout);

  return (
    <div className="enter flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h1 className="min-w-0 flex-1 font-display text-2xl tracking-wide capitalize break-words">
          {formatWorkoutDate(workout.date, locale, "full")}
        </h1>
        <form action={deleteWorkout} className="shrink-0">
          <input type="hidden" name="workoutId" value={workout.id} />
          <button type="submit" className="-m-2 p-2 text-sm text-chalk-dim hover:text-plate-red">
            {t("workout.deleteWorkout")}
          </button>
        </form>
      </div>

      {volume > 0 && (
        <PlateBadge
          value={formatNumber(volume, locale)}
          unit="kg"
          label={t("workout.todayVolume")}
        />
      )}

      {sortedExercises.length === 0 ? (
        <p className="text-sm text-chalk-dim">{t("workout.noExercisesToday")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedExercises.map((workoutExercise) => (
            <WorkoutExerciseCard key={workoutExercise.id} workoutExercise={workoutExercise} />
          ))}
        </div>
      )}

      <ExercisePicker workoutId={workout.id} exercises={exercises} />
    </div>
  );
}
