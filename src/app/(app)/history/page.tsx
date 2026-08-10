import Link from "next/link";
import { getRecentWorkouts } from "@/lib/dal";
import { getDictionary } from "@/i18n/server";
import { formatWorkoutDate } from "@/i18n/format";

export default async function HistoryPage() {
  const [workouts, { locale, t }] = await Promise.all([
    getRecentWorkouts(200),
    getDictionary(),
  ]);

  return (
    <div className="enter flex flex-col gap-4">
      <h1 className="font-display text-2xl tracking-wide">{t("history.title")}</h1>

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
                {formatWorkoutDate(workout.date, locale, "full")}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
