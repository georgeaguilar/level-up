import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { signUp } from "@/app/(auth)/actions";

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Registra tus entrenamientos y mira tu progresión.
        </p>
      </div>

      <AuthForm action={signUp} mode="signup" />

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-zinc-950 underline dark:text-white">
          Entra
        </Link>
      </p>
    </div>
  );
}
