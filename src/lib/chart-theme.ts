// Colores de los tokens en globals.css — Recharts necesita valores concretos,
// no var(), así que se duplican aquí. Compartido por progress-chart.tsx y
// tonnage-chart.tsx.
export const PLATE_RED = "#d6432c";
export const PLATE_BLUE = "#4a86ac";
export const PLATE_GOLD = "#d9a62e";
export const IRON = "#3a342a";
export const CHALK_DIM = "#a89d88";
export const SURFACE = "#211d17";

export const SURFACE_RAISED = "#2a251d";

export const tooltipStyle = {
  background: SURFACE_RAISED,
  border: `1px solid ${IRON}`,
  borderRadius: 10, // = --radius-md en globals.css
  boxShadow: "inset 0 1px 0 rgba(243,238,227,0.07), 0 4px 12px -2px rgba(0,0,0,0.6)", // = --elev-2
  color: "#f3eee3",
  fontSize: 13,
  padding: "8px 12px",
};
