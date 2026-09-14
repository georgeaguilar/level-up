import type { MuscleGroup } from "@/lib/types";

type MuscleSilhouetteProps = {
  muscleGroup: MuscleGroup | null;
  className?: string;
};

const WIDTH = 22;
const HEIGHT = 34;
const OUTLINE = "#8a8272";

/** Vista desde la que se ve mejor cada grupo — decide qué detalle de silueta dibujar. */
const BACK_VIEW: ReadonlySet<MuscleGroup> = new Set([
  "back",
  "lats",
  "traps",
  "triceps",
  "hamstrings",
  "glutes",
  "calves",
]);

/** Un color sólido por grupo, agrupados por familia (espalda/trapecios en rosa, como pide el issue). */
const HIGHLIGHT: Record<Exclude<MuscleGroup, "cardio">, string> = {
  chest: "#3b82f6",
  shoulders: "#a855f7",
  back: "#ec4899",
  lats: "#db2777",
  traps: "#f472b6",
  biceps: "#f97316",
  triceps: "#f59e0b",
  forearms: "#22d3ee",
  core: "#eab308",
  quads: "#22c55e",
  hamstrings: "#10b981",
  glutes: "#14b8a6",
  calves: "#84cc16",
  full_body: "#ef4444",
};

/** Silueta base (torso, brazos, piernas) común a todos los grupos — solo cambia
 * el resaltado de color encima. `back` agrega una línea de columna para
 * distinguir la vista posterior de la frontal. */
function BodyOutline({ back }: { back: boolean }) {
  return (
    <>
      <circle cx="11" cy="4.2" r="3" fill="none" stroke={OUTLINE} strokeWidth="1.1" />
      <rect x="7.2" y="10" width="7.6" height="13.5" rx="3" fill="none" stroke={OUTLINE} strokeWidth="1.1" />
      <rect x="2" y="11" width="3.4" height="13" rx="1.7" fill="none" stroke={OUTLINE} strokeWidth="1.1" />
      <rect x="16.6" y="11" width="3.4" height="13" rx="1.7" fill="none" stroke={OUTLINE} strokeWidth="1.1" />
      <rect x="7.5" y="23" width="3.6" height="11.5" rx="1.8" fill="none" stroke={OUTLINE} strokeWidth="1.1" />
      <rect x="11.9" y="23" width="3.6" height="11.5" rx="1.8" fill="none" stroke={OUTLINE} strokeWidth="1.1" />
      {back ? (
        <line x1="11" y1="10.5" x2="11" y2="22.5" stroke={OUTLINE} strokeWidth="0.7" strokeDasharray="1.2 1" />
      ) : (
        <>
          <circle cx="9.8" cy="4" r="0.4" fill={OUTLINE} />
          <circle cx="12.2" cy="4" r="0.4" fill={OUTLINE} />
        </>
      )}
    </>
  );
}

/** Formas de resaltado por grupo muscular, superpuestas a `BodyOutline`. */
function Highlight({ muscleGroup, color }: { muscleGroup: Exclude<MuscleGroup, "cardio">; color: string }) {
  switch (muscleGroup) {
    case "chest":
      return <rect x="8" y="11.5" width="6" height="4.5" rx="1.4" fill={color} />;
    case "shoulders":
      return (
        <>
          <circle cx="5.5" cy="11.3" r="2" fill={color} />
          <circle cx="16.5" cy="11.3" r="2" fill={color} />
        </>
      );
    case "back":
      return <rect x="7.6" y="10.5" width="6.8" height="12.5" rx="2.4" fill={color} fillOpacity="0.85" />;
    case "lats":
      return (
        <>
          <rect x="7.3" y="14" width="2.4" height="7" fill={color} />
          <rect x="12.3" y="14" width="2.4" height="7" fill={color} />
        </>
      );
    case "traps":
      return <rect x="8.4" y="9.6" width="5.2" height="3.2" rx="1.2" fill={color} />;
    case "biceps":
      return (
        <>
          <rect x="2.2" y="12" width="3" height="5" rx="1.2" fill={color} />
          <rect x="16.8" y="12" width="3" height="5" rx="1.2" fill={color} />
        </>
      );
    case "triceps":
      return (
        <>
          <rect x="2.2" y="15" width="3" height="5" rx="1.2" fill={color} />
          <rect x="16.8" y="15" width="3" height="5" rx="1.2" fill={color} />
        </>
      );
    case "forearms":
      return (
        <>
          <rect x="2" y="20" width="3.2" height="5" rx="1.2" fill={color} />
          <rect x="16.8" y="20" width="3.2" height="5" rx="1.2" fill={color} />
        </>
      );
    case "core":
      return <rect x="8.4" y="17.5" width="5.2" height="5.5" rx="1.3" fill={color} />;
    case "quads":
    case "hamstrings":
      return (
        <>
          <rect x="7.6" y="24" width="3.2" height="8.5" rx="1.4" fill={color} />
          <rect x="12" y="24" width="3.2" height="8.5" rx="1.4" fill={color} />
        </>
      );
    case "glutes":
      return <rect x="7.6" y="23.2" width="7.9" height="4.2" rx="1.8" fill={color} />;
    case "calves":
      return (
        <>
          <rect x="7.6" y="29.5" width="3.2" height="5" rx="1.2" fill={color} />
          <rect x="12" y="29.5" width="3.2" height="5" rx="1.2" fill={color} />
        </>
      );
    case "full_body":
      return (
        <>
          <rect x="7.2" y="10" width="7.6" height="13.5" rx="3" fill={color} fillOpacity="0.8" />
          <rect x="2" y="11" width="3.4" height="13" rx="1.7" fill={color} fillOpacity="0.8" />
          <rect x="16.6" y="11" width="3.4" height="13" rx="1.7" fill={color} fillOpacity="0.8" />
          <rect x="7.5" y="23" width="3.6" height="11.5" rx="1.8" fill={color} fillOpacity="0.8" />
          <rect x="11.9" y="23" width="3.6" height="11.5" rx="1.8" fill={color} fillOpacity="0.8" />
        </>
      );
    default:
      return null;
  }
}

/** Ícono de corazón simple para `cardio`, que no es un grupo muscular. */
function CardioHeart({ color }: { color: string }) {
  return (
    <path
      d="M11 27c-4.5-2.9-7-5.9-7-9.2A4.3 4.3 0 0 1 11 14.8 4.3 4.3 0 0 1 18 17.8c0 3.3-2.5 6.3-7 9.2z"
      fill={color}
    />
  );
}

/**
 * Silueta corporal con el grupo muscular objetivo resaltado en color, al
 * estilo de la referencia del issue #6 (silueta gris + músculo trabajado en
 * color sólido). No es una imagen generada por IA — es un ícono SVG con la
 * misma idea visual, para no depender de assets externos; se puede sustituir
 * por PNGs en `/public/muscle-icons/` sin tocar los lugares donde se usa.
 */
export function MuscleSilhouette({ muscleGroup, className }: MuscleSilhouetteProps) {
  if (!muscleGroup) return null;

  if (muscleGroup === "cardio") {
    return (
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden className={className}>
        <CardioHeart color={HIGHLIGHT.full_body} />
      </svg>
    );
  }

  const back = BACK_VIEW.has(muscleGroup);

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden className={className}>
      <Highlight muscleGroup={muscleGroup} color={HIGHLIGHT[muscleGroup]} />
      <BodyOutline back={back} />
    </svg>
  );
}
