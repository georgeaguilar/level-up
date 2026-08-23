import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { InstallPrompt } from "@/components/install-prompt";
import { BottomNav } from "@/components/bottom-nav";
import { SideNav } from "@/components/side-nav";
import { getDictionary } from "@/i18n/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession();
  const { t } = await getDictionary();

  return (
    <div className="flex flex-1 flex-col sm:flex-row">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-iron bg-floor/95 pt-[env(safe-area-inset-top)] backdrop-blur sm:hidden">
          <div className="relative mx-auto flex w-full max-w-2xl items-center justify-center px-4 py-3">
            {/* Atajo a /templates en móvil: sin quinta pestaña en el bottom
                nav (no cabe a 320px), así que vive aquí, a la izquierda del
                wordmark centrado. En escritorio ya está en <SideNav>. */}
            <Link
              href="/templates"
              aria-label={t("nav.newTemplate")}
              className="absolute left-1.5 flex h-11 w-11 items-center justify-center rounded-full text-chalk-dim transition-colors duration-fast ease-brand hover:text-chalk active:scale-90"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="sr-only">{t("nav.newTemplate")}</span>
            </Link>
            <Link
              href="/"
              className="font-display text-2xl tracking-wide text-chalk"
            >
              LEVEL <span className="text-plate-red">UP</span>
            </Link>
          </div>
        </header>
        <InstallPrompt />
        {/* max-w-2xl es el ancho por defecto de toda la app (registro con una
            mano, en el gym). /progress marca su raíz con data-page="wide" para
            pedir más aire en escritorio — el resto de pantallas no lo hace. */}
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] transition-[max-width] duration-base ease-brand sm:pb-[calc(3rem+env(safe-area-inset-bottom))] lg:has-[[data-page=wide]]:max-w-5xl">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
