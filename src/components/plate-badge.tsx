import { cn } from "@/lib/cn";

type PlateBadgeProps = {
  value: string;
  unit?: string;
  label: string;
  tone?: "red" | "blue" | "gold";
  /** "lg" solo para el hero del dashboard — el resto de la app usa "md". */
  size?: "md" | "lg";
};

const TONE = {
  red: { edge: "var(--plate-red)", edgeDim: "var(--plate-red-dim)", text: "text-plate-red" },
  blue: { edge: "var(--plate-blue)", edgeDim: "var(--plate-blue-dim)", text: "text-plate-blue" },
  gold: { edge: "var(--plate-gold)", edgeDim: "var(--plate-gold-dim)", text: "text-plate-gold" },
} as const;

const SIZE = {
  md: { wrap: "h-24 w-24", hub: "inset-2.5" },
  lg: { wrap: "h-28 w-28", hub: "inset-3" },
} as const;

/**
 * Insignia "plato estampado": el número que más importa en la pantalla,
 * tratado como el peso grabado en un disco de gimnasio. El aro exterior
 * mezcla un conic-gradient (brillo de metal torneado) con un moleteado
 * repetido; el cubo interior es una superficie elevada aparte, para que se
 * lea como dos piezas físicas y no como un círculo pintado.
 */
export function PlateBadge({ value, unit, label, tone = "red", size = "md" }: PlateBadgeProps) {
  const t = TONE[tone];
  const dims = SIZE[size];
  const numberSize =
    value.length > 6 ? "text-xl" : value.length > 4 ? "text-2xl" : size === "lg" ? "text-4xl" : "text-3xl";

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn("relative shrink-0 rounded-full shadow-elev-2", dims.wrap)}
        style={{
          backgroundImage: `repeating-conic-gradient(rgba(0,0,0,0.35) 0deg 1.5deg, rgba(255,255,255,0.05) 1.5deg 3deg), conic-gradient(from 210deg, ${t.edgeDim}, ${t.edge} 35%, ${t.edgeDim} 60%, ${t.edge} 85%, ${t.edgeDim})`,
        }}
      >
        <div
          className={cn(
            "absolute flex items-center justify-center rounded-full bg-surface-raised shadow-elev-1",
            dims.hub,
          )}
        >
          <span
            className={cn("font-display px-1 text-center leading-none tabular-nums", numberSize, t.text)}
            style={{ textShadow: "0 1px 0 rgb(0 0 0 / 0.6)" }}
          >
            {value}
          </span>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-label break-words text-chalk-dim">{label}</span>
        {unit && <span className="font-mono text-sm text-chalk-dim">{unit}</span>}
      </div>
    </div>
  );
}
