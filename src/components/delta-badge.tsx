import { getDictionary } from "@/i18n/server";
import type { Delta } from "@/lib/types";

type DeltaBadgeProps = {
  value: Delta;
  /** Cuando bajar es una mejora (p. ej. RIR promedio), invierte el color sin
   * invertir el glifo ↑/↓ — la dirección real del cambio no miente. */
  invert?: boolean;
};

/** `↑18%` / `↓7%` / `—` (sin base de comparación o sin cambio). */
export async function DeltaBadge({ value, invert = false }: DeltaBadgeProps) {
  const { t } = await getDictionary();

  if (value === null || value === 0) {
    const label = value === null ? t("analytics.noComparison") : t("analytics.delta.flat");
    return (
      <span className="font-mono text-xs text-chalk-dim" aria-label={label}>
        —
      </span>
    );
  }

  const isUp = value > 0;
  const isImprovement = invert ? !isUp : isUp;
  const color = isImprovement ? "text-plate-gold" : "text-plate-blue";
  const glyph = isUp ? "↑" : "↓";
  const label = `${isUp ? t("analytics.delta.up") : t("analytics.delta.down")} ${Math.abs(value)}%`;

  return (
    <span className={`font-mono text-xs ${color}`} aria-label={label}>
      {glyph}
      {Math.abs(value)}%
    </span>
  );
}
