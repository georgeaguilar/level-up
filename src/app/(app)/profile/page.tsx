import { getProfile, verifySession } from "@/lib/dal";
import { signOut } from "@/app/(auth)/actions";
import { getDictionary } from "@/i18n/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Card } from "@/components/ui/card";

export default async function ProfilePage() {
  const [profile, { email }, { locale, dict, t }] = await Promise.all([
    getProfile(),
    verifySession(),
    getDictionary(),
  ]);

  return (
    <div className="enter flex flex-col gap-4">
      <h1 className="font-display text-2xl tracking-wide">{t("profile.title")}</h1>

      <Card className="flex flex-col gap-1">
        <h2 className="text-label text-chalk-dim">{t("profile.account")}</h2>
        <p className="text-chalk">{profile?.display_name}</p>
        <p className="text-sm text-chalk-dim">{email}</p>
      </Card>

      <Card className="flex items-center justify-between">
        <h2 className="text-label text-chalk-dim">{t("profile.language")}</h2>
        <LocaleSwitcher locale={locale} dict={dict} />
      </Card>

      <Card className="p-0">
        <form action={signOut} className="p-4">
          <button
            type="submit"
            className="cursor-pointer text-sm font-medium tracking-wide text-plate-red transition-colors duration-fast ease-brand hover:text-chalk"
          >
            {t("profile.signOut")}
          </button>
        </form>
      </Card>
    </div>
  );
}
