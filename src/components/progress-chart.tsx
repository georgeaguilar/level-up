"use client";

import { useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CardioProgressPoint, ExerciseProgressPoint } from "@/lib/types";
import { PlateBadge } from "@/components/plate-badge";
import { useI18n } from "@/i18n/client";
import { formatNumber, formatWorkoutDate } from "@/i18n/format";
import type { TranslationKey } from "@/i18n/dictionary";
import { CHALK_DIM, IRON, PLATE_BLUE, PLATE_GOLD, PLATE_RED, tooltipStyle } from "@/lib/chart-theme";
import { SegmentedButton, SegmentedGroup } from "@/components/ui/segmented";

const METRICS = {
  maxWeightKg: { labelKey: "progress.metric.maxWeight", tone: "red", color: PLATE_RED },
  volumeKg: { labelKey: "progress.metric.volume", tone: "blue", color: PLATE_BLUE },
  estimated1RmKg: { labelKey: "progress.metric.estimated1Rm", tone: "gold", color: PLATE_GOLD },
} satisfies Record<string, { labelKey: TranslationKey; tone: "red" | "blue" | "gold"; color: string }>;

type Metric = keyof typeof METRICS;

export function ProgressChart({ data }: { data: ExerciseProgressPoint[] }) {
  const { locale, t } = useI18n();
  const [metric, setMetric] = useState<Metric>("maxWeightKg");

  function formatTooltipLabel(label: React.ReactNode) {
    return typeof label === "string" ? formatWorkoutDate(label, locale, "short") : "";
  }

  if (data.length === 0) {
    return <p className="text-sm text-chalk-dim">{t("progress.noSetsYet")}</p>;
  }

  const active = METRICS[metric];
  const latest = data[data.length - 1][metric];
  const gradientId = `progress-gradient-${metric}`;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <PlateBadge
        value={formatNumber(latest, locale)}
        unit="kg"
        label={t(active.labelKey)}
        tone={active.tone}
      />

      <SegmentedGroup>
        {(Object.keys(METRICS) as Metric[]).map((key) => (
          <SegmentedButton key={key} active={metric === key} onClick={() => setMetric(key)}>
            {t(METRICS[key].labelKey)}
          </SegmentedButton>
        ))}
      </SegmentedGroup>

      <div className="h-56 w-full min-w-0 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={active.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={active.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={IRON} strokeOpacity={0.6} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(iso: string) => formatWorkoutDate(iso, locale, "short")}
              fontSize={12}
              stroke={CHALK_DIM}
              minTickGap={16}
              interval="preserveStartEnd"
            />
            <YAxis fontSize={12} width={40} stroke={CHALK_DIM} />
            <Tooltip labelFormatter={formatTooltipLabel} contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey={metric} stroke="none" fill={`url(#${gradientId})`} fillOpacity={1} />
            <Line
              type="monotone"
              dataKey={metric}
              stroke={active.color}
              strokeWidth={2.5}
              dot={{ fill: active.color, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CardioChart({ data }: { data: CardioProgressPoint[] }) {
  const { locale, t } = useI18n();

  function formatTooltipLabel(label: React.ReactNode) {
    return typeof label === "string" ? formatWorkoutDate(label, locale, "short") : "";
  }

  if (data.length === 0) {
    return <p className="text-sm text-chalk-dim">{t("progress.noCardioYet")}</p>;
  }

  const chartData = data.map((point) => ({
    date: point.date,
    minutes: Math.round((point.durationSeconds / 60) * 10) / 10,
  }));
  const latest = chartData[chartData.length - 1].minutes;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <PlateBadge
        value={formatNumber(latest, locale)}
        unit="min"
        label={t("progress.lastTime")}
        tone="blue"
      />

      <div className="h-56 w-full min-w-0 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cardio-gradient-minutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PLATE_BLUE} stopOpacity={0.28} />
                <stop offset="100%" stopColor={PLATE_BLUE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={IRON} strokeOpacity={0.6} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(iso: string) => formatWorkoutDate(iso, locale, "short")}
              fontSize={12}
              stroke={CHALK_DIM}
              minTickGap={16}
              interval="preserveStartEnd"
            />
            <YAxis fontSize={12} width={40} unit="m" stroke={CHALK_DIM} />
            <Tooltip labelFormatter={formatTooltipLabel} contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="none"
              fill="url(#cardio-gradient-minutes)"
              fillOpacity={1}
            />
            <Line
              type="monotone"
              dataKey="minutes"
              stroke={PLATE_BLUE}
              strokeWidth={2.5}
              dot={{ fill: PLATE_BLUE, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
