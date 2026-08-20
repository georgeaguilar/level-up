import { getDashboard } from "@/lib/dal";
import { getDictionary } from "@/i18n/server";
import { DashboardKpis } from "@/components/dashboard-kpis";
import { MuscleGroupCards } from "@/components/muscle-group-cards";
import { RecordList } from "@/components/record-list";
import { TonnageChart } from "@/components/tonnage-chart";
import { RangePicker } from "@/components/range-picker";
import type { ProgressParams } from "@/lib/progress-params";

/** Pestaña "Resumen": dashboard agregado del rango seleccionado. */
export async function SummaryTab({ params }: { params: ProgressParams }) {
  const [dashboard, { t }] = await Promise.all([getDashboard(params.range), getDictionary()]);

  return (
    <div className="flex flex-col gap-6">
      <RangePicker params={params} />

      {!dashboard.hasData ? (
        <p className="text-sm text-chalk-dim">{t("analytics.empty")}</p>
      ) : (
        <>
          <DashboardKpis current={dashboard.current} deltas={dashboard.deltas} />

          <div>
            <h2 className="mb-3 font-display text-lg tracking-wide text-chalk-dim">
              {t("analytics.chart.title")}
            </h2>
            <TonnageChart data={dashboard.weekly} />
          </div>

          <div>
            <h2 className="mb-3 font-display text-lg tracking-wide text-chalk-dim">
              {t("analytics.muscle.title")}
            </h2>
            <MuscleGroupCards groups={dashboard.muscleGroups} />
          </div>

          <div>
            <h2 className="mb-3 font-display text-lg tracking-wide text-chalk-dim">
              {t("analytics.records.title")}
            </h2>
            <RecordList records={dashboard.records} />
          </div>
        </>
      )}
    </div>
  );
}
