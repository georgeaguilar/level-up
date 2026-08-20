"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/client";
import type { TranslationKey } from "@/i18n/dictionary";

const LINKS: { href: string; labelKey: TranslationKey }[] = [
  { href: "/", labelKey: "nav.today" },
  { href: "/history", labelKey: "nav.history" },
  { href: "/progress", labelKey: "nav.progress" },
  { href: "/profile", labelKey: "nav.profile" },
];

/** Links del header en escritorio, con estado activo — el bottom nav ya lo tenía, esto lo iguala. */
export function DesktopNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <>
      {LINKS.map(({ href, labelKey }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`transition-colors duration-fast ease-brand ${isActive ? "text-chalk" : "hover:text-chalk"}`}
          >
            {t(labelKey)}
          </Link>
        );
      })}
    </>
  );
}
