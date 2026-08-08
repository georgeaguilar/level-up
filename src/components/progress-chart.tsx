"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CardioProgressPoint, ExerciseProgressPoint } from "@/lib/types";
import { PlateBadge } from "@/components/plate-badge";

// Colores de los tokens en globals.css — recharts necesita valores concretos, no var().
const PLATE_RED = "#d6432c";
const PLATE_BLUE = "#4a86ac";
const PLATE_GOLD = "#d9a62e";
const IRON = "#3a342a";
const CHALK_DIM = "#a89d88";
const SURFACE = "#211d17";

const METRICS = {
  maxWeightKg: { label: "Peso máximo", badgeLabel: "PESO MÁXIMO", tone: "red", color: PLATE_RED },
  volumeKg: { label: "Volumen total", badgeLabel: "VOLUMEN TOTAL", tone: "blue", color: PLATE_BLUE },
  estimated1RmKg: { label: "1RM estimado", badgeLabel: "1RM ESTIMADO", tone: "gold", color: PLATE_GOLD },
} as const;

type Metric = keyof typeof METRICS;

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
  });
}

function formatTooltipLabel(label: React.ReactNode) {
  return typeof label === "string" ? formatDate(label) : "";
}

const tooltipStyle = {
  background: SURFACE,
  border: `1px solid ${IRON}`,
  borderRadius: 0,
  color: "#f3eee3",
  fontSize: 13,
};

export function ProgressChart({ data }: { data: ExerciseProgressPoint[] }) {
  const [metric, setMetric] = useState<Metric>("maxWeightKg");

  if (data.length === 0) {
    return (
      <p className="text-sm text-chalk-dim">
        Todavía no hay series registradas para este ejercicio.
      </p>
    );
  }

  const active = METRICS[metric];
  const latest = data[data.length - 1][metric];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <PlateBadge
        value={latest.toLocaleString("es")}
        unit="kg"
        label={active.badgeLabel}
        tone={active.tone}
      />

      <div className="flex flex-wrap gap-2">
        {(Object.keys(METRICS) as Metric[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setMetric(key)}
            className={`border px-3 py-1 text-xs font-medium tracking-wide uppercase transition-colors ${
              metric === key
                ? "border-chalk bg-chalk text-floor"
                : "border-iron text-chalk-dim hover:border-iron-bright"
            }`}
          >
            {METRICS[key].label}
          </button>
        ))}
      </div>

      <div className="h-56 w-full min-w-0 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={IRON} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              fontSize={12}
              stroke={CHALK_DIM}
              minTickGap={16}
              interval="preserveStartEnd"
            />
            <YAxis fontSize={12} width={40} stroke={CHALK_DIM} />
            <Tooltip labelFormatter={formatTooltipLabel} contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey={metric}
              stroke={active.color}
              strokeWidth={2}
              dot={{ fill: active.color, strokeWidth: 0, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CardioChart({ data }: { data: CardioProgressPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-chalk-dim">
        Todavía no hay tiempos registrados para este ejercicio.
      </p>
    );
  }

  const chartData = data.map((point) => ({
    date: point.date,
    minutes: Math.round((point.durationSeconds / 60) * 10) / 10,
  }));
  const latest = chartData[chartData.length - 1].minutes;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <PlateBadge value={latest.toLocaleString("es")} unit="min" label="ÚLTIMO TIEMPO" tone="blue" />

      <div className="h-56 w-full min-w-0 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={IRON} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              fontSize={12}
              stroke={CHALK_DIM}
              minTickGap={16}
              interval="preserveStartEnd"
            />
            <YAxis fontSize={12} width={40} unit="m" stroke={CHALK_DIM} />
            <Tooltip labelFormatter={formatTooltipLabel} contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="minutes"
              stroke={PLATE_BLUE}
              strokeWidth={2}
              dot={{ fill: PLATE_BLUE, strokeWidth: 0, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
