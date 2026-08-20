import { getDashboard } from "@/lib/dal";
import { getDictionary } from "@/i18n/server";
import { DashboardKpis } from "@/components/dashboard-kpis";
import { MuscleGroupCards } from "@/components/muscle-group-cards";
import { RecordList } from "@/components/record-list";
import { TonnageChart } from "@/components/tonnage-chart";
import { RangePicker } from "@/components/range-picker";
import { Card } from "@/components/ui/card";
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

          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start">
            <Card padding="md" className="rounded-lg">
              <h2 className="mb-3 text-base font-semibold text-chalk">{t("analytics.chart.title")}</h2>
              <TonnageChart data={dashboard.weekly} />
            </Card>

            <Card padding="md" className="rounded-lg">
              <h2 className="mb-3 text-base font-semibold text-chalk">{t("analytics.muscle.title")}</h2>
              <MuscleGroupCards groups={dashboard.muscleGroups} />
            </Card>
          </div>

          <Card padding="md" className="rounded-lg">
            <h2 className="mb-3 text-base font-semibold text-chalk">{t("analytics.records.title")}</h2>
            <RecordList records={dashboard.records} />
          </Card>
        </>
      )}
    </div>
  );
}
