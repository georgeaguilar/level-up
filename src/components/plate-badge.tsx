type PlateBadgeProps = {
  value: string;
  unit?: string;
  label: string;
  tone?: "red" | "blue" | "gold";
};

const TONE = {
  red: { ring: "border-plate-red", fill: "bg-plate-red-dim", text: "text-plate-red" },
  blue: { ring: "border-plate-blue", fill: "bg-plate-blue-dim", text: "text-plate-blue" },
  gold: { ring: "border-plate-gold", fill: "bg-plate-gold-dim", text: "text-plate-gold" },
} as const;

/** Insignia "plato estampado": el número que más importa en la pantalla, tratado como el peso grabado en un disco. */
export function PlateBadge({ value, unit, label, tone = "red" }: PlateBadgeProps) {
  const t = TONE[tone];

  return (
    <div className="flex items-center gap-4">
      <div
        className={`relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 ${t.ring} ${t.fill}`}
      >
        <div className={`absolute inset-2 rounded-full border ${t.ring} opacity-40`} />
        <span className={`font-display text-3xl leading-none ${t.text}`}>{value}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-display text-xs tracking-[0.2em] text-chalk-dim">{label}</span>
        {unit && <span className="font-mono text-sm text-chalk-dim">{unit}</span>}
      </div>
    </div>
  );
}
