import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { signUp } from "@/app/(auth)/actions";

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl tracking-wide">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-chalk-dim">
          Registra tus entrenamientos y mira tu progresión.
        </p>
      </div>

      <AuthForm action={signUp} mode="signup" />

      <p className="text-center text-sm text-chalk-dim">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-chalk underline hover:text-plate-red">
          Entra
        </Link>
      </p>
    </div>
  );
}
