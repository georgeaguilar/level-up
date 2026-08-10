import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { DICTIONARIES, translate, type Dictionary, type TFunction } from "@/i18n/dictionary";

/** Idioma preferido del navegador a partir del header `Accept-Language`, sin dependencias. */
function localeFromAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) return undefined;

  const preferred = header
    .split(",")
    .map((part) => part.trim().split(";")[0]?.slice(0, 2).toLowerCase())
    .find((lang) => isLocale(lang));

  return preferred as Locale | undefined;
}

/**
 * Lee el idioma activo: cookie `NEXT_LOCALE` si existe, si no negocia con
 * `Accept-Language`, si no cae en `DEFAULT_LOCALE`. Envuelto en `cache()`
 * para no repetir la lectura de cookies/headers dentro del mismo render
 * (mismo patrón que `verifySession` en `src/lib/dal.ts`).
 */
export const getLocale = cache(async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const headerList = await headers();
  const negotiated = localeFromAcceptLanguage(headerList.get("accept-language"));
  if (negotiated) return negotiated;

  return DEFAULT_LOCALE;
});

export const getDictionary = cache(async (): Promise<{
  locale: Locale;
  dict: Dictionary;
  t: TFunction;
}> => {
  const locale = await getLocale();
  const dict = DICTIONARIES[locale];
  return { locale, dict, t: (key, vars) => translate(dict, key, vars) };
});
