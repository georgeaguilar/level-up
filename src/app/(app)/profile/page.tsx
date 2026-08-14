import { getProfile, verifySession } from "@/lib/dal";
import { signOut } from "@/app/(auth)/actions";
import { getDictionary } from "@/i18n/server";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default async function ProfilePage() {
  const [profile, { email }, { locale, dict, t }] = await Promise.all([
    getProfile(),
    verifySession(),
    getDictionary(),
  ]);

  return (
    <div className="enter flex flex-col gap-4">
      <h1 className="font-display text-2xl tracking-wide">{t("profile.title")}</h1>

      <section className="flex flex-col gap-1 border border-iron bg-surface p-4">
        <h2 className="text-xs font-medium tracking-wide text-chalk-dim uppercase">
          {t("profile.account")}
        </h2>
        <p className="text-chalk">{profile?.display_name}</p>
        <p className="text-sm text-chalk-dim">{email}</p>
      </section>

      <section className="flex items-center justify-between border border-iron bg-surface p-4">
        <h2 className="text-xs font-medium tracking-wide text-chalk-dim uppercase">
          {t("profile.language")}
        </h2>
        <LocaleSwitcher locale={locale} dict={dict} />
      </section>

      <form action={signOut} className="border border-iron bg-surface p-4">
        <button
          type="submit"
          className="text-sm font-medium tracking-wide text-plate-red transition-colors hover:text-chalk"
        >
          {t("profile.signOut")}
        </button>
      </form>
    </div>
  );
}
