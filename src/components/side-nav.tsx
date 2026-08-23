"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { NAV_ITEMS, NAV_SHARED, isActivePath } from "@/components/nav-items";

/** Rail vertical de navegación — solo visible en escritorio, reemplaza el header horizontal. */
export function SideNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="sticky top-0 z-10 hidden h-dvh w-18 shrink-0 flex-col items-center gap-1 border-r border-iron bg-floor/95 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] pl-[env(safe-area-inset-left)] backdrop-blur sm:flex">
      <Link
        href="/"
        aria-label="Level Up"
        className="mb-4 flex flex-col items-center font-display text-lg leading-none tracking-wide text-chalk"
      >
        <span>LEVEL</span>
        <span className="text-plate-red">UP</span>
      </Link>

      {NAV_ITEMS.map(({ href, labelKey, icon }) => {
        const isActive = isActivePath(pathname, href);
        const label = t(labelKey);

        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={`group relative flex h-12 w-12 items-center justify-center rounded-md transition-[background-color,color,transform] duration-fast ease-brand active:scale-90 ${
              isActive ? "bg-surface-raised text-chalk shadow-elev-1" : "text-chalk-dim hover:bg-surface hover:text-chalk"
            }`}
          >
            <svg {...NAV_SHARED}>{icon}</svg>
            <span
              aria-hidden
              className="text-label pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-sm border border-iron bg-surface-raised px-2 py-1 text-chalk opacity-0 shadow-elev-2 transition-opacity duration-fast ease-brand group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
