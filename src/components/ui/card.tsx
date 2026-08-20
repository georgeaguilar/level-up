import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardVariant = "flat" | "raised" | "interactive";
type CardPadding = "sm" | "md" | "lg";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  padding?: CardPadding;
};

const VARIANT: Record<CardVariant, string> = {
  flat: "border border-iron bg-surface shadow-elev-1",
  raised: "border border-iron bg-surface-raised shadow-elev-2",
  interactive:
    "border border-iron bg-surface shadow-elev-1 transition-[border-color,box-shadow,transform] duration-base ease-brand hover:border-plate-red hover:shadow-elev-2 active:scale-[0.99]",
};

const PADDING: Record<CardPadding, string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

/**
 * Genera las clases de una card sin imponer el elemento — úsalo en <Link>/<button> donde <Card> (div) no aplica.
 * `min-w-0` es obligatorio: sin él, una card dentro de un grid/flex (los KPIs
 * en 3 columnas, por ejemplo) nunca se deja encoger por debajo del ancho de
 * su contenido, así que un label largo como "ENTRENAMIENTOS" se desborda en
 * vez de hacer wrap — es el bug clásico de min-width:auto en flex/grid items.
 */
export function cardClasses({
  variant = "flat",
  padding = "md",
}: { variant?: CardVariant; padding?: CardPadding } = {}) {
  return cn("min-w-0 rounded-md", VARIANT[variant], PADDING[padding]);
}

/** Superficie base: borde + fondo + elevación, en 3 variantes de jerarquía. */
export function Card({ variant = "flat", padding = "md", className, ...props }: CardProps) {
  return <div className={cn(cardClasses({ variant, padding }), className)} {...props} />;
}
