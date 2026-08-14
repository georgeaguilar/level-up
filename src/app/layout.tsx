import type { Metadata, Viewport } from "next";
import { Bebas_Neue, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { getDictionary } from "@/i18n/server";
import { I18nProvider } from "@/i18n/client";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: "Level Up",
    description: t("meta.description"),
    appleWebApp: {
      capable: true,
      title: "Level Up",
      statusBarStyle: "default",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#17140f",
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale, dict } = await getDictionary();

  return (
    <html
      lang={locale}
      className={`${bebasNeue.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-floor text-chalk">
        <I18nProvider locale={locale} dictionary={dict}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
