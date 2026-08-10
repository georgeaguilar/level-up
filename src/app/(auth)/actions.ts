"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n/server";
import type { TFunction } from "@/i18n/dictionary";

export type AuthFormState = { error?: string } | undefined;

// Los esquemas dependen del idioma activo (mensajes traducidos), así que se
// construyen dentro de cada acción en vez de vivir como constantes de módulo.
function makeCredentialsSchema(t: TFunction) {
  return z.object({
    email: z.string().trim().email(t("auth.errors.invalidEmail")),
    password: z.string().min(6, t("auth.errors.passwordMin")),
  });
}

function makeSignUpSchema(t: TFunction) {
  return makeCredentialsSchema(t).extend({
    displayName: z.string().trim().min(1, t("auth.errors.nameRequired")).max(60),
  });
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { t } = await getDictionary();
  const parsed = makeCredentialsSchema(t).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("auth.errors.invalidData") };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: t("auth.errors.wrongCredentials") };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { t } = await getDictionary();
  const parsed = makeSignUpSchema(t).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("auth.errors.invalidData") };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { display_name: parsed.data.displayName } },
  });

  if (error) {
    // Supabase devuelve `error.message` en inglés; no se muestra tal cual
    // (quedaría en inglés dentro de una UI traducida) — se loguea en servidor
    // y al usuario se le da un mensaje genérico traducido.
    console.error("[signUp] Supabase error:", error.message);
    return { error: t("auth.errors.generic") };
  }

  if (!data.session) {
    return { error: t("auth.errors.accountCreated") };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
