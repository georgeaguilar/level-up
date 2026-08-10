"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/i18n/config";
import { translate, type Dictionary, type TFunction } from "@/i18n/dictionary";

type I18nContextValue = { locale: Locale; t: TFunction };

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Provee el diccionario ya resuelto en servidor a los pocos client components
 * que lo necesitan (`auth-form.tsx`, `progress-chart.tsx`, `exercise-picker.tsx`).
 * Se monta una sola vez en `src/app/layout.tsx`.
 */
export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nContextValue>(
    () => ({ locale, t: (key, vars) => translate(dictionary, key, vars) }),
    [locale, dictionary],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n debe usarse dentro de <I18nProvider>.");
  }
  return ctx;
}
