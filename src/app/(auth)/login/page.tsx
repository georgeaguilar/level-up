import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { signIn } from "@/app/(auth)/actions";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Level Up</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Entra para registrar tu entrenamiento.
        </p>
      </div>

      <AuthForm action={signIn} mode="login" />

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        ¿No tienes cuenta?{" "}
        <Link href="/signup" className="font-medium text-zinc-950 underline dark:text-white">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
