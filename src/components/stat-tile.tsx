import { DeltaBadge } from "@/components/delta-badge";
import { Card } from "@/components/ui/card";
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
    <Card padding="sm" className="flex flex-col gap-1">
      <span className="text-label block truncate text-chalk-dim" title={label} aria-label={label}>
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-xl tabular-nums ${muted ? "text-chalk-dim" : "text-chalk"}`}>
          {value}
        </span>
        {unit && <span className="font-mono text-xs text-chalk-dim">{unit}</span>}
      </div>
      {delta !== undefined && <DeltaBadge value={delta} invert={invert} />}
    </Card>
  );
}
