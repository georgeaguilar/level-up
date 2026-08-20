import type { CSSProperties } from "react";
import Link from "next/link";
import { getRecentWorkouts } from "@/lib/dal";
import { getDictionary } from "@/i18n/server";
import { formatMonthHeading, formatWorkoutDate } from "@/i18n/format";
import { cardClasses } from "@/components/ui/card";
import { cn } from "@/lib/cn";

/** Agrupa entrenamientos por mes calendario, en el mismo orden (desc) en que llegan. */
function groupByMonth<T extends { date: string }>(workouts: T[]) {
  const groups = new Map<string, T[]>();
  for (const workout of workouts) {
    const key = workout.date.slice(0, 7); // "YYYY-MM"
    const group = groups.get(key);
    if (group) group.push(workout);
    else groups.set(key, [workout]);
  }
  return groups;
}

export default async function HistoryPage() {
  const [workouts, { locale, t }] = await Promise.all([
    getRecentWorkouts(200),
    getDictionary(),
  ]);

  const months = groupByMonth(workouts);

  return (
    <div className="enter flex flex-col gap-6">
      <h1 className="font-display text-2xl tracking-wide">{t("history.title")}</h1>

      {workouts.length === 0 ? (
        <p className="text-sm text-chalk-dim">{t("history.empty")}</p>
      ) : (
        <div className="flex flex-col gap-6">
          {[...months.entries()].map(([month, monthWorkouts]) => (
            <section key={month} className="flex flex-col gap-2">
              <h2 className="text-label sticky top-14 -mx-4 bg-floor/95 px-4 py-1.5 capitalize text-chalk-dim backdrop-blur">
                {formatMonthHeading(monthWorkouts[0].date, locale)}
              </h2>
              <ul className="flex flex-col gap-2">
                {monthWorkouts.map((workout, index) => (
                  <li key={workout.id} className="stagger-item" style={{ "--stagger-index": index } as CSSProperties}>
                    <Link
                      href={`/workouts/${workout.id}`}
                      className={cn(
                        cardClasses({ variant: "interactive", padding: "md" }),
                        "block capitalize text-chalk",
                      )}
                    >
                      {formatWorkoutDate(workout.date, locale, "full")}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
