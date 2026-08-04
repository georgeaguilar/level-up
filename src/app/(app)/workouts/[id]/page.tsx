import { notFound } from "next/navigation";
import { getExercises, getWorkout } from "@/lib/dal";
import { deleteWorkout } from "@/app/(app)/workouts/actions";
import { ExercisePicker } from "@/components/exercise-picker";
import { WorkoutExerciseCard } from "@/components/workout-exercise-card";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold capitalize">{formatDate(workout.date)}</h1>
        <form action={deleteWorkout}>
          <input type="hidden" name="workoutId" value={workout.id} />
          <button type="submit" className="text-sm text-zinc-400 hover:text-red-600">
            Borrar entrenamiento
          </button>
        </form>
      </div>

      {sortedExercises.length === 0 ? (
        <p className="text-sm text-zinc-500">Todavía no agregas ejercicios hoy.</p>
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
