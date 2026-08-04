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
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-semibold">
            Level Up
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">
              Hoy
            </Link>
            <Link href="/history" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">
              Historial
            </Link>
            <Link href="/progress" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">
              Progreso
            </Link>
            <span className="hidden text-zinc-400 sm:inline">
              {profile?.display_name}
            </span>
            <form action={signOut}>
              <button type="submit" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">
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
