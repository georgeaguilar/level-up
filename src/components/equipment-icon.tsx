import type { Equipment } from "@/lib/types";

type EquipmentIconProps = {
  equipment: Equipment | null;
  className?: string;
};

const SIZE = 20;
const SHARED = {
  width: SIZE,
  height: SIZE,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Un ícono lineal por tipo de equipo — sin archivos externos ni next/image. */
const PATHS: Record<Equipment, React.ReactNode> = {
  barbell: (
    <>
      <path d="M4 12h16" />
      <path d="M2 9v6M6 8v8" />
      <path d="M22 9v6M18 8v8" />
    </>
  ),
  ez_bar: (
    <>
      <path d="M3 12h2l2-3h2l2 3h6l2-3h2l2 3" />
      <path d="M2 9v6M6 9v6M18 9v6M22 9v6" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M9 12h6" />
      <rect x="4" y="9" width="3" height="6" rx="1" />
      <rect x="17" y="9" width="3" height="6" rx="1" />
      <path d="M3 10.5v3M21 10.5v3" />
    </>
  ),
  kettlebell: (
    <>
      <path d="M9 8a3 3 0 0 1 6 0v1H9z" />
      <circle cx="12" cy="15" r="6" />
    </>
  ),
  machine: (
    <>
      <rect x="3" y="4" width="7" height="16" rx="1" />
      <circle cx="17" cy="9" r="3" />
      <path d="M17 12v8M13 20h8" />
    </>
  ),
  cable: (
    <>
      <path d="M6 3v10a4 4 0 0 0 8 0V3" />
      <circle cx="10" cy="19" r="2" />
      <path d="M10 15v2" />
    </>
  ),
  smith: (
    <>
      <rect x="3" y="3" width="4" height="18" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
      <path d="M7 9h10" />
    </>
  ),
  bodyweight: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v7M8 10l4-2 4 2M9 21l3-6 3 6" />
    </>
  ),
  band: (
    <>
      <path d="M4 6c6 3 10 3 16 0" />
      <path d="M4 18c6-3 10-3 16 0" />
      <path d="M4 6v12M20 6v12" />
    </>
  ),
  plate: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  sled: (
    <>
      <path d="M3 18h6l3-6h6" />
      <path d="M18 12v6h3" />
      <circle cx="7" cy="20" r="1.5" />
    </>
  ),
  bench: (
    <>
      <path d="M3 13h18M5 13v6M19 13v6" />
      <path d="M3 9h6" />
    </>
  ),
  cardio_machine: (
    <>
      <path d="M3 16h3l2-6 3 10 2-7 2 3h6" />
    </>
  ),
  other: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
};

export function EquipmentIcon({ equipment, className }: EquipmentIconProps) {
  if (!equipment) return null;

  return (
    <svg {...SHARED} className={className}>
      {PATHS[equipment]}
    </svg>
  );
}
