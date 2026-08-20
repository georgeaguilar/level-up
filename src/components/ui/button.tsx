import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "border border-plate-red bg-plate-red text-chalk shadow-elev-1 hover:shadow-elev-2 active:bg-plate-red-dim",
  secondary:
    "border border-iron bg-surface-raised text-chalk shadow-elev-1 hover:border-iron-bright active:bg-iron",
  // Ghost/danger recrean el truco de -m-2/p-2: agrandan el área táctil a 44px
  // sin desplazar el layout de alrededor (regla de "stable interaction states").
  ghost: "-m-2 min-h-11 px-2 py-2 text-sm text-chalk-dim hover:text-chalk",
  danger: "-m-2 min-h-11 px-2 py-2 text-sm text-chalk-dim hover:text-plate-red",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-base",
  lg: "px-4 py-5 font-display text-3xl tracking-wide uppercase",
};

/** Botón base: variantes semánticas de color/peso + tamaño, con feedback táctil consistente. */
export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  const isGhostLike = variant === "ghost" || variant === "danger";

  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-medium",
        "transition-[transform,background-color,color,border-color,box-shadow] duration-fast ease-brand",
        "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60",
        !isGhostLike && SIZE[size],
        VARIANT[variant],
        className,
      )}
      {...props}
    />
  );
}
