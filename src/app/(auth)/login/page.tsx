import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { signIn } from "@/app/(auth)/actions";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl tracking-wide">Entra</h1>
        <p className="mt-1 text-sm text-chalk-dim">
          Entra para registrar tu entrenamiento.
        </p>
      </div>

      <AuthForm action={signIn} mode="login" />

      <p className="text-center text-sm text-chalk-dim">
        ¿No tienes cuenta?{" "}
        <Link href="/signup" className="font-medium text-chalk underline hover:text-plate-red">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
