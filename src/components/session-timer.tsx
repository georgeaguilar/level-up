import {
  finishWorkoutSession,
  resetWorkoutSession,
  startWorkoutSession,
} from "@/app/(app)/workouts/actions";
import { getDictionary } from "@/i18n/server";
import { formatClockTime, formatDuration } from "@/i18n/format";
import { Button } from "@/components/ui/button";

type SessionTimerProps = {
  workoutId: string;
  startedAt: string | null;
  endedAt: string | null;
};

/**
 * Inicio/fin de la sesión de entrenamiento. Sin cronómetro vivo a propósito:
 * un contador en marcha obligaría a "use client" + setInterval para un número
 * que nadie mira; un timestamp estático se queda como server component.
 */
export async function SessionTimer({ workoutId, startedAt, endedAt }: SessionTimerProps) {
  const { locale, t } = await getDictionary();

  if (!startedAt) {
    return (
      <form action={startWorkoutSession}>
        <input type="hidden" name="workoutId" value={workoutId} />
        <Button type="submit" variant="secondary" size="sm">
          {t("workout.sessionStart")}
        </Button>
      </form>
    );
  }

  if (!endedAt) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-chalk-dim">
          {t("workout.sessionStartedAt")} {formatClockTime(startedAt, locale)}
        </span>
        <form action={finishWorkoutSession}>
          <input type="hidden" name="workoutId" value={workoutId} />
          <Button type="submit" variant="secondary" size="sm">
            {t("workout.sessionFinish")}
          </Button>
        </form>
      </div>
    );
  }

  const minutes = (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60_000;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-sm text-chalk-dim">
        {formatClockTime(startedAt, locale)} → {formatClockTime(endedAt, locale)} ·{" "}
        {formatDuration(minutes, locale)}
      </span>
      <form action={resetWorkoutSession}>
        <input type="hidden" name="workoutId" value={workoutId} />
        <Button type="submit" variant="danger">
          {t("workout.sessionReset")}
        </Button>
      </form>
    </div>
  );
}
