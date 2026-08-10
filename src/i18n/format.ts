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
