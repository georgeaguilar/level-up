import type { MetadataRoute } from "next";
import { getDictionary } from "@/i18n/server";

// Web app manifest para instalar Level Up desde la pantalla de inicio
// (Safari en iOS, Chrome en Android). Se sirve en `/manifest.webmanifest`;
// ver `src/proxy.ts`, cuyo matcher lo excluye del check de sesión —
// si no, Safari lo pide sin cookie y recibe un redirect a /login en vez
// del manifest.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { locale, t } = await getDictionary();

  return {
    name: "Level Up",
    short_name: "Level Up",
    description: t("meta.description"),
    lang: locale,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#17140f", // --floor en globals.css
    theme_color: "#17140f",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
