// Colores de los tokens en globals.css — Recharts necesita valores concretos,
// no var(), así que se duplican aquí. Compartido por progress-chart.tsx y
// tonnage-chart.tsx.
export const PLATE_RED = "#d6432c";
export const PLATE_BLUE = "#4a86ac";
export const PLATE_GOLD = "#d9a62e";
export const IRON = "#3a342a";
export const CHALK_DIM = "#a89d88";
export const SURFACE = "#211d17";

export const tooltipStyle = {
  background: SURFACE,
  border: `1px solid ${IRON}`,
  borderRadius: 0,
  color: "#f3eee3",
  fontSize: 13,
};
