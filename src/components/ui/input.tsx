import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// text-base (no text-sm) es deliberado: evita el auto-zoom que iOS Safari
// aplica a inputs con font-size < 16px.
const FIELD_BASE =
  "w-full rounded-sm border border-iron bg-floor px-3 py-2 text-base text-chalk placeholder:text-chalk-dim transition-colors duration-fast ease-brand focus-visible:border-plate-gold";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD_BASE, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(FIELD_BASE, "cursor-pointer", className)} {...props} />;
}
