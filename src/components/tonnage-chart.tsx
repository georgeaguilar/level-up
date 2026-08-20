"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WeeklyPoint } from "@/lib/types";
import { useI18n } from "@/i18n/client";
import { formatWorkoutDate } from "@/i18n/format";
import type { TranslationKey } from "@/i18n/dictionary";
import { CHALK_DIM, IRON, PLATE_BLUE, PLATE_GOLD, PLATE_RED, tooltipStyle } from "@/lib/chart-theme";
import { SegmentedButton, SegmentedGroup } from "@/components/ui/segmented";

const METRICS = {
  tonnageKg: { labelKey: "analytics.chart.tonnage", color: PLATE_RED },
  sets: { labelKey: "analytics.chart.sets", color: PLATE_BLUE },
  workouts: { labelKey: "analytics.chart.workouts", color: PLATE_GOLD },
} satisfies Record<string, { labelKey: TranslationKey; color: string }>;

type Metric = keyof typeof METRICS;

export function TonnageChart({ data }: { data: WeeklyPoint[] }) {
  const { locale, t } = useI18n();
  const [metric, setMetric] = useState<Metric>("tonnageKg");

  function formatTooltipLabel(label: React.ReactNode) {
    return typeof label === "string" ? formatWorkoutDate(label, locale, "short") : "";
  }

  const hasData = data.some((point) => point.tonnageKg > 0 || point.sets > 0 || point.workouts > 0);
  if (!hasData) {
    return <p className="text-sm text-chalk-dim">{t("analytics.chart.empty")}</p>;
  }

  const active = METRICS[metric];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <SegmentedGroup>
        {(Object.keys(METRICS) as Metric[]).map((key) => (
          <SegmentedButton key={key} active={metric === key} onClick={() => setMetric(key)}>
            {t(METRICS[key].labelKey)}
          </SegmentedButton>
        ))}
      </SegmentedGroup>

      <div className="h-56 w-full min-w-0 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={IRON} strokeOpacity={0.6} vertical={false} />
            <XAxis
              dataKey="weekStart"
              tickFormatter={(iso: string) => formatWorkoutDate(iso, locale, "short")}
              fontSize={12}
              stroke={CHALK_DIM}
              minTickGap={16}
              interval="preserveStartEnd"
            />
            <YAxis fontSize={12} width={40} stroke={CHALK_DIM} />
            <Tooltip labelFormatter={formatTooltipLabel} contentStyle={tooltipStyle} cursor={{ fill: IRON, opacity: 0.3 }} />
            <Bar dataKey={metric} fill={active.color} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
