"use client";

import { useActionState } from "react";
import type { AuthFormState } from "@/app/(auth)/actions";
import { useI18n } from "@/i18n/client";

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
        <div className="flex flex-col gap-1">
          <label htmlFor="displayName" className="text-xs tracking-wide text-chalk-dim uppercase">
            {t("auth.form.nameLabel")}
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            autoComplete="name"
            className="border border-iron bg-floor px-3 py-2 text-base text-chalk"
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-xs tracking-wide text-chalk-dim uppercase">
          {t("auth.form.emailLabel")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          className="border border-iron bg-floor px-3 py-2 text-base text-chalk"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-xs tracking-wide text-chalk-dim uppercase">
          {t("auth.form.passwordLabel")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="border border-iron bg-floor px-3 py-2 text-base text-chalk"
        />
      </div>

      {state?.error && (
        <p aria-live="polite" className="text-sm text-plate-red">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 border border-plate-red bg-plate-red px-4 py-2.5 text-base font-medium text-chalk transition-colors disabled:opacity-60 active:bg-plate-red-dim"
      >
        {pending
          ? t("auth.form.pending")
          : mode === "signup"
            ? t("auth.form.createAccount")
            : t("auth.form.signIn")}
      </button>
    </form>
  );
}
