import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

function segmentClasses(active: boolean) {
  return cn(
    "text-label cursor-pointer rounded-full border px-3 py-1.5 transition-colors duration-fast ease-brand",
    active ? "border-chalk bg-chalk text-floor" : "border-iron text-chalk-dim hover:border-iron-bright",
  );
}

export function SegmentedGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap gap-2", className)}>{children}</div>;
}

/** Item de segmented control cuyo estado vive en la URL (tabs, rangos). */
export function SegmentedLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={segmentClasses(active)}>
      {children}
    </Link>
  );
}

/** Item de segmented control con estado en cliente (métrica de un chart, filtro del picker). */
export function SegmentedButton({
  active,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) {
  return <button type="button" className={cn(segmentClasses(active), className)} {...props} />;
}
