import { DeltaBadge } from "@/components/delta-badge";
import type { Delta } from "@/lib/types";

type StatTileProps = {
  label: string;
  value: string;
  unit?: string;
  delta?: Delta;
  invert?: boolean;
  muted?: boolean;
};

/** Celda de KPI: label, número y delta opcional vs. el periodo anterior. */
export function StatTile({ label, value, unit, delta, invert, muted }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 border border-iron bg-surface p-3">
      <span className="font-display text-xs tracking-[0.2em] text-chalk-dim uppercase">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-xl tabular-nums ${muted ? "text-chalk-dim" : "text-chalk"}`}>
          {value}
        </span>
        {unit && <span className="font-mono text-xs text-chalk-dim">{unit}</span>}
      </div>
      {delta !== undefined && <DeltaBadge value={delta} invert={invert} />}
    </div>
  );
}
