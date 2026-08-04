import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 * `setAll` puede fallar si se llama desde un Server Component puro (no puede
 * escribir cookies) — se ignora porque `src/proxy.ts` ya se encarga de
 * refrescar la sesión en cada request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Component: no puede escribir cookies, el proxy refresca la sesión.
          }
        },
      },
    },
  );
}
