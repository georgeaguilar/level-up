import Link from "next/link";
import { getProfile, verifySession } from "@/lib/dal";
import { signOut } from "@/app/(auth)/actions";
import { getDictionary } from "@/i18n/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { InstallPrompt } from "@/components/install-prompt";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession();
  const [profile, { locale, dict, t }] = await Promise.all([getProfile(), getDictionary()]);

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-iron bg-floor/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <Link
            href="/"
            className="font-display text-2xl tracking-wide text-chalk"
          >
            LEVEL <span className="text-plate-red">UP</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-3 text-xs font-medium tracking-wide text-chalk-dim uppercase sm:gap-4">
            <Link href="/" className="transition-colors hover:text-chalk">
              {t("nav.today")}
            </Link>
            <Link href="/history" className="transition-colors hover:text-chalk">
              {t("nav.history")}
            </Link>
            <Link href="/progress" className="transition-colors hover:text-chalk">
              {t("nav.progress")}
            </Link>
            <LocaleSwitcher locale={locale} dict={dict} />
            <span className="hidden normal-case text-iron-bright sm:inline">
              {profile?.display_name}
            </span>
            <form action={signOut}>
              <button type="submit" className="transition-colors hover:text-plate-red">
                {t("nav.signOut")}
              </button>
            </form>
          </nav>
        </div>
      </header>
      <InstallPrompt />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6 pb-[calc(3rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
    </div>
  );
}
