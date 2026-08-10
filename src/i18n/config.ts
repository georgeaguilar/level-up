export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Locale BCP-47 concreto para `toLocaleDateString`/`toLocaleString`/`Intl.*`. */
export const BCP47: Record<Locale, string> = {
  es: "es-ES",
  en: "en-US",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
