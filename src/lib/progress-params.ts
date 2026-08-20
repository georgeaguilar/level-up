// Estado de la URL de /progress. Módulo plano (sin "server-only"): lo usa la
// página (server) y los componentes de pestañas/rango (también server, pero
// separados para mantener este archivo puro y testeable sin React).
import type { DashboardRange } from "@/lib/types";

export type ProgressTab = "resumen" | "ejercicio";

export const DASHBOARD_RANGES = [4, 12, 52] as const satisfies readonly DashboardRange[];

const DEFAULT_RANGE: DashboardRange = 12;

export type ProgressParams = {
  tab: ProgressTab;
  range: DashboardRange;
  exercise?: string;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Lee tab/range/exercise de los searchParams de /progress.
 * `tab` por defecto es "resumen", salvo que venga `?exercise=` sin `tab`
 * explícito — así una URL vieja como `/progress?exercise=<id>` sigue
 * abriendo la pestaña por ejercicio en vez de la nueva pestaña de resumen.
 */
export function parseProgressParams(
  searchParams: Record<string, string | string[] | undefined>,
): ProgressParams {
  const rawTab = firstValue(searchParams.tab);
  const exercise = firstValue(searchParams.exercise);

  const tab: ProgressTab =
    rawTab === "resumen" || rawTab === "ejercicio"
      ? rawTab
      : exercise
        ? "ejercicio"
        : "resumen";

  const rawRange = Number(firstValue(searchParams.range));
  const range = (DASHBOARD_RANGES as readonly number[]).includes(rawRange)
    ? (rawRange as DashboardRange)
    : DEFAULT_RANGE;

  return exercise ? { tab, range, exercise } : { tab, range };
}

/**
 * Construye el href de /progress mezclando el estado actual con un patch.
 * Siempre emite `tab` explícito (omitirlo dejaría que la regla de arriba lo
 * voltee a "ejercicio" si hay `exercise` en la URL) y omite `range` cuando
 * es el default, para no ensuciar la URL en el caso común.
 */
export function progressHref(current: ProgressParams, patch: Partial<ProgressParams>): string {
  const next: ProgressParams = { ...current, ...patch };

  const params = new URLSearchParams();
  params.set("tab", next.tab);
  if (next.range !== DEFAULT_RANGE) params.set("range", String(next.range));
  if (next.exercise) params.set("exercise", next.exercise);

  return `/progress?${params.toString()}`;
}
