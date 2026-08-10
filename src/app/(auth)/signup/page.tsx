import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { signUp } from "@/app/(auth)/actions";
import { getDictionary } from "@/i18n/server";

export default async function SignupPage() {
  const { t } = await getDictionary();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl tracking-wide">{t("auth.signup.title")}</h1>
        <p className="mt-1 text-sm text-chalk-dim">{t("auth.signup.subtitle")}</p>
      </div>

      <AuthForm action={signUp} mode="signup" />

      <p className="text-center text-sm text-chalk-dim">
        {t("auth.signup.haveAccount")}{" "}
        <Link href="/login" className="font-medium text-chalk underline hover:text-plate-red">
          {t("auth.signup.signInLink")}
        </Link>
      </p>
    </div>
  );
}
