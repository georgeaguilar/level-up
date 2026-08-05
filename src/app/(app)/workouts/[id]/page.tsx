import { notFound } from "next/navigation";
import { getExercises, getWorkout } from "@/lib/dal";
import { deleteWorkout } from "@/app/(app)/workouts/actions";
import { ExercisePicker } from "@/components/exercise-picker";
import { WorkoutExerciseCard } from "@/components/workout-exercise-card";
import { PlateBadge } from "@/components/plate-badge";
import type { WorkoutWithExercises } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

  const [workout, exercises] = await Promise.all([getWorkout(id), getExercises()]);

  if (!workout) {
    notFound();
  }

  const sortedExercises = [...workout.workout_exercises].sort(
    (a, b) => a.position - b.position,
  );
  const volume = totalVolumeKg(workout);

  return (
    <div className="enter flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-wide capitalize">
          {formatDate(workout.date)}
        </h1>
        <form action={deleteWorkout}>
          <input type="hidden" name="workoutId" value={workout.id} />
          <button type="submit" className="text-sm text-chalk-dim hover:text-plate-red">
            Borrar entrenamiento
          </button>
        </form>
      </div>

      {volume > 0 && (
        <PlateBadge value={volume.toLocaleString("es")} unit="kg" label="VOLUMEN DE HOY" />
      )}

      {sortedExercises.length === 0 ? (
        <p className="text-sm text-chalk-dim">Todavía no agregas ejercicios hoy.</p>
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
