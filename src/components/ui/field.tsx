import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type FieldProps = {
  label: ReactNode;
  htmlFor: string;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Label + control + error opcional, con asociación explícita htmlFor/id (accesible por defecto). */
export function Field({ label, htmlFor, error, className, children }: FieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <label htmlFor={htmlFor} className="text-label text-chalk-dim">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-sm text-plate-red">
          {error}
        </p>
      )}
    </div>
  );
}
