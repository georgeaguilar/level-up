import {
  finishWorkoutSession,
  resetWorkoutSession,
  startWorkoutSession,
} from "@/app/(app)/workouts/actions";
import { getDictionary } from "@/i18n/server";
import { formatClockTime, formatDuration } from "@/i18n/format";

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
        <button
          type="submit"
          className="border border-iron px-3 py-2 text-sm font-medium text-chalk transition-colors hover:border-iron-bright active:bg-iron"
        >
          {t("workout.sessionStart")}
        </button>
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
          <button
            type="submit"
            className="border border-iron px-3 py-2 text-sm font-medium text-chalk transition-colors hover:border-iron-bright active:bg-iron"
          >
            {t("workout.sessionFinish")}
          </button>
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
        <button type="submit" className="-m-2 p-2 text-sm text-chalk-dim hover:text-plate-red">
          {t("workout.sessionReset")}
        </button>
      </form>
    </div>
  );
}
