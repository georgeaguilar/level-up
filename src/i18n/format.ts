// Formato de fechas y números locale-aware. Sin "server-only": lo usa también
// `progress-chart.tsx` (client component) para los ejes y tooltips del chart.
import { BCP47, type Locale } from "@/i18n/config";

type DateStyle = "full" | "long" | "short";

const DATE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  // martes, 10 de agosto de 2026 / Tuesday, August 10, 2026
  full: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  // martes, 10 de agosto / Tuesday, August 10
  long: { weekday: "long", day: "numeric", month: "long" },
  // 10 ago / Aug 10
  short: { day: "numeric", month: "short" },
};

/**
 * Reemplaza los 4 helpers `formatDate` duplicados que había en
 * `(app)/page.tsx`, `(app)/history/page.tsx`, `(app)/workouts/[id]/page.tsx`
 * y `progress-chart.tsx`. Parsea a medianoche local, igual que el original.
 */
export function formatWorkoutDate(iso: string, locale: Locale, style: DateStyle = "full"): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(BCP47[locale], DATE_OPTIONS[style]);
}

export function formatNumber(value: number, locale: Locale): string {
  return value.toLocaleString(BCP47[locale]);
}

/** Hora local del timestamptz, formato corto (18:42 / 6:42 PM). */
export function formatClockTime(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleTimeString(BCP47[locale], { hour: "numeric", minute: "2-digit" });
}

/** Minutos a "83 min" o "1 h 23 min" cuando pasa de una hora. */
export function formatDuration(minutes: number, locale: Locale): string {
  const rounded = Math.round(minutes);
  if (rounded < 60) return `${formatNumber(rounded, locale)} min`;

  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return rest === 0
    ? `${formatNumber(hours, locale)} h`
    : `${formatNumber(hours, locale)} h ${formatNumber(rest, locale)} min`;
}
