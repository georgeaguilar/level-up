import type { CSSProperties } from "react";
import Link from "next/link";
import { getDashboard, getRecentWorkouts } from "@/lib/dal";
import { goToTodayWorkout } from "@/app/(app)/workouts/actions";
import { getDictionary } from "@/i18n/server";
import { formatNumber, formatWorkoutDate } from "@/i18n/format";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/stat-tile";
import { cardClasses } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export default async function DashboardPage() {
  const [workouts, dashboard, { locale, t }] = await Promise.all([
    getRecentWorkouts(),
    getDashboard(4),
    getDictionary(),
  ]);

  return (
    <div className="enter flex flex-col gap-8">
      <form action={goToTodayWorkout}>
        <Button type="submit" size="lg" className="w-full rounded-lg border-2 shadow-elev-2">
          {t("dashboard.trainToday")}
        </Button>
      </form>

      {dashboard.hasData && (
        <section className="flex flex-col gap-3">
          <h2 className="text-label text-chalk-dim">{t("dashboard.last4Weeks")}</h2>
          <div className="grid grid-cols-3 gap-2">
            <StatTile
              label={t("analytics.kpi.tonnage")}
              value={formatNumber(dashboard.current.tonnageKg, locale)}
              unit={t("analytics.units.kg")}
              delta={dashboard.deltas.tonnageKg}
            />
            <StatTile
              label={t("analytics.kpi.workouts")}
              value={formatNumber(dashboard.current.workouts, locale)}
              delta={dashboard.deltas.workouts}
            />
            <StatTile
              label={t("analytics.kpi.sets")}
              value={formatNumber(dashboard.current.sets, locale)}
              delta={dashboard.deltas.sets}
            />
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-label text-chalk-dim">{t("dashboard.recentWorkouts")}</h2>

        {workouts.length === 0 ? (
          <p className="text-sm text-chalk-dim">{t("dashboard.noWorkouts")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {workouts.map((workout, index) => (
              <li
                key={workout.id}
                className="stagger-item"
                style={{ "--stagger-index": index } as CSSProperties}
              >
                <Link
                  href={`/workouts/${workout.id}`}
                  className={cn(cardClasses({ variant: "interactive", padding: "md" }), "block capitalize text-chalk")}
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
