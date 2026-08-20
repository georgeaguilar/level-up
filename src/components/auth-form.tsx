"use client";

import { useActionState } from "react";
import type { AuthFormState } from "@/app/(auth)/actions";
import { useI18n } from "@/i18n/client";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type AuthFormProps = {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  mode: "login" | "signup";
};

export function AuthForm({ action, mode }: AuthFormProps) {
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {mode === "signup" && (
        <Field label={t("auth.form.nameLabel")} htmlFor="displayName">
          <Input id="displayName" name="displayName" type="text" required autoComplete="name" />
        </Field>
      )}

      <Field label={t("auth.form.emailLabel")} htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="email" inputMode="email" />
      </Field>

      <Field label={t("auth.form.passwordLabel")} htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />
      </Field>

      {state?.error && (
        <p aria-live="polite" role="alert" className="text-sm text-plate-red">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending
          ? t("auth.form.pending")
          : mode === "signup"
            ? t("auth.form.createAccount")
            : t("auth.form.signIn")}
      </Button>
    </form>
  );
}
