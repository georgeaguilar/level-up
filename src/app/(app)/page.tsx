import Link from "next/link";
import { getRecentWorkouts } from "@/lib/dal";
import { goToTodayWorkout } from "@/app/(app)/workouts/actions";
import { getDictionary } from "@/i18n/server";
import { formatWorkoutDate } from "@/i18n/format";

export default async function DashboardPage() {
  const [workouts, { locale, t }] = await Promise.all([getRecentWorkouts(), getDictionary()]);

  return (
    <div className="enter flex flex-col gap-10">
      <form action={goToTodayWorkout}>
        <button
          type="submit"
          className="w-full border-2 border-plate-red bg-plate-red px-4 py-5 font-display text-3xl tracking-wide uppercase text-chalk transition-[transform,background-color] active:scale-[0.99] active:bg-plate-red-dim"
        >
          {t("dashboard.trainToday")}
        </button>
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-sm tracking-[0.2em] text-chalk-dim uppercase">
          {t("dashboard.recentWorkouts")}
        </h2>

        {workouts.length === 0 ? (
          <p className="text-sm text-chalk-dim">{t("dashboard.noWorkouts")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {workouts.map((workout) => (
              <li key={workout.id}>
                <Link
                  href={`/workouts/${workout.id}`}
                  className="block border border-iron bg-surface px-4 py-3 capitalize text-chalk transition-colors hover:border-plate-red"
                >
                  {formatWorkoutDate(workout.date, locale, "long")}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
