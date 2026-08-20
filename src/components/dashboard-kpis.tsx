import { PlateBadge } from "@/components/plate-badge";
import { StatTile } from "@/components/stat-tile";
import { getDictionary } from "@/i18n/server";
import { formatDuration, formatNumber } from "@/i18n/format";
import type { PeriodDeltas, PeriodTotals } from "@/lib/types";

type DashboardKpisProps = {
  current: PeriodTotals;
  deltas: PeriodDeltas;
};

/** Fila de KPIs del periodo: tonelaje como hero + el resto en grid. */
export async function DashboardKpis({ current, deltas }: DashboardKpisProps) {
  const { locale, t } = await getDictionary();

  return (
    <div className="flex flex-col gap-4">
      <PlateBadge
        value={formatNumber(current.tonnageKg, locale)}
        unit={t("analytics.units.kg")}
        label={t("analytics.kpi.tonnage")}
        tone="red"
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile
          label={t("analytics.kpi.workouts")}
          value={formatNumber(current.workouts, locale)}
          delta={deltas.workouts}
        />
        <StatTile
          label={t("analytics.kpi.perWeek")}
          value={formatNumber(current.workoutsPerWeek, locale)}
          delta={deltas.workoutsPerWeek}
        />
        <StatTile
          label={t("analytics.kpi.sets")}
          value={formatNumber(current.sets, locale)}
          delta={deltas.sets}
        />
        <StatTile
          label={t("analytics.kpi.reps")}
          value={formatNumber(current.reps, locale)}
          delta={deltas.reps}
        />
        <StatTile
          label={t("analytics.kpi.avgReps")}
          value={formatNumber(current.avgRepsPerSet, locale)}
          delta={deltas.avgRepsPerSet}
        />
        <StatTile
          label={t("analytics.kpi.avgRir")}
          value={current.avgRir !== null ? formatNumber(current.avgRir, locale) : "—"}
          delta={current.avgRir !== null ? deltas.avgRir : undefined}
          invert
          muted={current.avgRir === null}
        />
        <StatTile
          label={t("analytics.kpi.avgSession")}
          value={current.avgSessionMinutes !== null ? formatDuration(current.avgSessionMinutes, locale) : "—"}
          delta={current.avgSessionMinutes !== null ? deltas.avgSessionMinutes : undefined}
          muted={current.avgSessionMinutes === null}
        />
        <StatTile
          label={t("analytics.kpi.weeksTrained")}
          value={formatNumber(current.weeksTrained, locale)}
        />
      </div>
    </div>
  );
}
