import type { WorkoutExercise } from "@/lib/types";
import { removeWorkoutExercise } from "@/app/(app)/workouts/actions";
import { SetRows } from "@/components/set-rows";
import { CardioDuration } from "@/components/cardio-duration";
import { EquipmentIcon } from "@/components/equipment-icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/i18n/server";
import { exerciseName } from "@/lib/exercise-display";

export async function WorkoutExerciseCard({
  workoutExercise,
}: {
  workoutExercise: WorkoutExercise;
}) {
  const { exercise } = workoutExercise;
  const isStrength = exercise.kind === "strength";
  const { locale, t } = await getDictionary();

  return (
    <Card className="flex flex-col gap-3 rounded-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <EquipmentIcon
            equipment={exercise.equipment}
            className={`mt-0.5 shrink-0 ${isStrength ? "text-plate-red" : "text-plate-blue"}`}
          />
          <div className="min-w-0">
            <h3 className="break-words font-medium text-chalk">
              {exerciseName(exercise, locale)}
            </h3>
            <span
              className={`text-xs font-medium tracking-wide uppercase ${
                isStrength ? "text-plate-red" : "text-plate-blue"
              }`}
            >
              {isStrength ? t("exerciseKind.strength") : t("exerciseKind.cardio")}
              {exercise.muscle_group ? (
                <span className="text-chalk-dim normal-case"> · {t(`muscleGroup.${exercise.muscle_group}`)}</span>
              ) : null}
            </span>
          </div>
        </div>
        <form action={removeWorkoutExercise} className="shrink-0">
          <input type="hidden" name="workoutExerciseId" value={workoutExercise.id} />
          <Button type="submit" variant="danger">
            {t("workoutExerciseCard.remove")}
          </Button>
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
    </Card>
  );
}
