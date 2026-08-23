"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { NAV_ITEMS, NAV_SHARED, isActivePath } from "@/components/nav-items";

// Solo 4 pestañas: a 320px no cabe una quinta. /templates vive en el rail
// de escritorio y en el atajo "+" del header móvil.
const TABS = NAV_ITEMS.filter((item) => item.href !== "/templates");

/** Barra de navegación flotante, estilo píldora — solo visible en celular. */
export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-20 flex justify-center px-4 sm:hidden">
      <nav className="shadow-elev-3 pointer-events-auto flex items-center gap-1 rounded-full border border-iron bg-surface/90 p-2 backdrop-blur">
        {TABS.map(({ href, labelKey, icon }) => {
          const isActive = isActivePath(pathname, href);
          const label = t(labelKey);

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`flex h-11 w-14 items-center justify-center rounded-full transition-[background-color,color,transform] duration-fast ease-brand active:scale-90 ${
                isActive ? "bg-surface-raised text-chalk shadow-elev-1" : "text-chalk-dim hover:text-chalk"
              }`}
            >
              <svg {...NAV_SHARED}>{icon}</svg>
              <span className="sr-only">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
