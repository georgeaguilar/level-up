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
  const isStrength = exercise.kind === "strength";

  return (
    <div className="flex flex-col gap-3 border border-iron bg-surface p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-chalk">{exercise.name}</h3>
          <span
            className={`text-xs font-medium tracking-wide uppercase ${
              isStrength ? "text-plate-red" : "text-plate-blue"
            }`}
          >
            {isStrength ? "Pesas" : "Cardio"}
            {exercise.muscle_group ? (
              <span className="text-chalk-dim normal-case"> · {exercise.muscle_group}</span>
            ) : null}
          </span>
        </div>
        <form action={removeWorkoutExercise}>
          <input type="hidden" name="workoutExerciseId" value={workoutExercise.id} />
          <button type="submit" className="text-sm text-chalk-dim hover:text-plate-red">
            Quitar
          </button>
        </form>
      </div>

      {isStrength ? (
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
