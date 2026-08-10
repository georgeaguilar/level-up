"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale, LOCALE_COOKIE } from "@/i18n/config";

/** Cambia el idioma activo guardando la cookie `NEXT_LOCALE` (1 año). */
export async function setLocale(formData: FormData) {
  const locale = formData.get("locale");

  if (typeof locale !== "string" || !isLocale(locale)) {
    throw new Error(`Locale inválido: ${String(locale)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });

  revalidatePath("/", "layout");
}
