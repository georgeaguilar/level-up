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

const METRICS = {
  maxWeightKg: { label: "Peso máximo (kg)" },
  volumeKg: { label: "Volumen total (kg)" },
  estimated1RmKg: { label: "1RM estimado (kg)" },
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

export function ProgressChart({ data }: { data: ExerciseProgressPoint[] }) {
  const [metric, setMetric] = useState<Metric>("maxWeightKg");

  if (data.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Todavía no hay series registradas para este ejercicio.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {(Object.keys(METRICS) as Metric[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setMetric(key)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              metric === key
                ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-black"
                : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            {METRICS[key].label}
          </button>
        ))}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
            <YAxis fontSize={12} width={40} />
            <Tooltip labelFormatter={formatTooltipLabel} />
            <Line type="monotone" dataKey={metric} stroke="currentColor" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CardioChart({ data }: { data: CardioProgressPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Todavía no hay tiempos registrados para este ejercicio.
      </p>
    );
  }

  const chartData = data.map((point) => ({
    date: point.date,
    minutes: Math.round((point.durationSeconds / 60) * 10) / 10,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
          <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
          <YAxis fontSize={12} width={40} unit="m" />
          <Tooltip labelFormatter={formatTooltipLabel} />
          <Line type="monotone" dataKey="minutes" stroke="currentColor" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
