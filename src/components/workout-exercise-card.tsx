import type { WorkoutExercise } from "@/lib/types";
import { removeWorkoutExercise } from "@/app/(app)/workouts/actions";
import { SetRows } from "@/components/set-rows";
import { CardioDuration } from "@/components/cardio-duration";

export function WorkoutExerciseCard({
  workoutExercise,
}: {
  workoutExercise: WorkoutExercise;
}) {
  const { exercise } = workoutExercise;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{exercise.name}</h3>
          <span className="text-xs text-zinc-500">
            {exercise.kind === "strength" ? "Pesas" : "Cardio"}
            {exercise.muscle_group ? ` · ${exercise.muscle_group}` : ""}
          </span>
        </div>
        <form action={removeWorkoutExercise}>
          <input type="hidden" name="workoutExerciseId" value={workoutExercise.id} />
          <button
            type="submit"
            className="text-sm text-zinc-400 hover:text-red-600"
          >
            Quitar
          </button>
        </form>
      </div>

      {exercise.kind === "strength" ? (
        <SetRows workoutExerciseId={workoutExercise.id} sets={workoutExercise.sets} />
      ) : (
        <CardioDuration
          workoutExerciseId={workoutExercise.id}
          durationSeconds={workoutExercise.duration_seconds}
        />
      )}
    </div>
  );
}
