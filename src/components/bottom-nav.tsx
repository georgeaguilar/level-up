"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/client";
import type { TranslationKey } from "@/i18n/dictionary";

const SIZE = 24;
const SHARED = {
  width: SIZE,
  height: SIZE,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const TABS: { href: string; labelKey: TranslationKey; icon: React.ReactNode }[] = [
  {
    href: "/",
    labelKey: "nav.today",
    icon: (
      <>
        <path d="M4 11.5 12 4l8 7.5" />
        <path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" />
      </>
    ),
  },
  {
    href: "/history",
    labelKey: "nav.history",
    icon: (
      <>
        <rect x="3.5" y="4.5" width="17" height="16" rx="1.5" />
        <path d="M3.5 9.5h17M8 3v3M16 3v3" />
        <path d="M7.5 13.5h3M7.5 17h6" />
      </>
    ),
  },
  {
    href: "/progress",
    labelKey: "nav.progress",
    icon: (
      <>
        <path d="M4 19V5" />
        <path d="M4 15l5-5 4 3 7-8" />
        <path d="M13 5h4v4" />
      </>
    ),
  },
  {
    href: "/profile",
    labelKey: "nav.profile",
    icon: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" />
      </>
    ),
  },
];

/** Barra de navegación flotante, estilo píldora — solo visible en celular. */
export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-20 flex justify-center px-4 sm:hidden">
      <nav className="shadow-elev-3 pointer-events-auto flex items-center gap-1 rounded-full border border-iron bg-surface/90 p-2 backdrop-blur">
        {TABS.map(({ href, labelKey, icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
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
              <svg {...SHARED}>{icon}</svg>
              <span className="sr-only">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
