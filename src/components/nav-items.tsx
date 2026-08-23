import type { TranslationKey } from "@/i18n/dictionary";

/** Convención de íconos del repo: trazo lineal 24x24 sin librería externa (ver equipment-icon.tsx). */
export const NAV_ICON_SIZE = 24;
export const NAV_SHARED = {
  width: NAV_ICON_SIZE,
  height: NAV_ICON_SIZE,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Fuente única de la navegación principal — consumida por el rail de escritorio y el bottom nav móvil. */
export const NAV_ITEMS: { href: string; labelKey: TranslationKey; icon: React.ReactNode }[] = [
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
    href: "/templates",
    labelKey: "nav.templates",
    icon: (
      <>
        <rect x="5" y="4.5" width="14" height="16" rx="1.5" />
        <path d="M9 4.5v-1a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v1" />
        <path d="M8.5 10h7M8.5 14h4" />
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

/** Regla de "activo" compartida: la raíz solo se marca en match exacto, el resto por prefijo. */
export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
