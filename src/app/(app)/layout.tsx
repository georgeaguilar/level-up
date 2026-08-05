import Link from "next/link";
import { getProfile, verifySession } from "@/lib/dal";
import { signOut } from "@/app/(auth)/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession();
  const profile = await getProfile();

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-iron bg-floor/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="font-display text-2xl tracking-wide text-chalk"
          >
            LEVEL <span className="text-plate-red">UP</span>
          </Link>
          <nav className="flex items-center gap-4 text-xs font-medium tracking-wide text-chalk-dim uppercase">
            <Link href="/" className="transition-colors hover:text-chalk">
              Hoy
            </Link>
            <Link href="/history" className="transition-colors hover:text-chalk">
              Historial
            </Link>
            <Link href="/progress" className="transition-colors hover:text-chalk">
              Progreso
            </Link>
            <span className="hidden normal-case text-iron-bright sm:inline">
              {profile?.display_name}
            </span>
            <form action={signOut}>
              <button type="submit" className="transition-colors hover:text-plate-red">
                Salir
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
