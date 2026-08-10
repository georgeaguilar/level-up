import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { signIn } from "@/app/(auth)/actions";
import { getDictionary } from "@/i18n/server";

export default async function LoginPage() {
  const { t } = await getDictionary();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl tracking-wide">{t("auth.login.title")}</h1>
        <p className="mt-1 text-sm text-chalk-dim">{t("auth.login.subtitle")}</p>
      </div>

      <AuthForm action={signIn} mode="login" />

      <p className="text-center text-sm text-chalk-dim">
        {t("auth.login.noAccount")}{" "}
        <Link href="/signup" className="font-medium text-chalk underline hover:text-plate-red">
          {t("auth.login.signUpLink")}
        </Link>
      </p>
    </div>
  );
}
