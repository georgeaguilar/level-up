"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "install-prompt-dismissed";

function isIos(): boolean {
  const isIphoneOrIpad = /iPad|iPhone|iPod/.test(navigator.userAgent);
  // iPadOS 13+ se anuncia como "Macintosh" en el user agent; se distingue
  // de un Mac real por soportar touch.
  const isTouchMac =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return isIphoneOrIpad || isTouchMac;
}

function isStandalone(): boolean {
  // `navigator.standalone` es una extensión de Safari sin tipos en el DOM lib.
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    Boolean(nav.standalone) || window.matchMedia("(display-mode: standalone)").matches
  );
}

/**
 * Banner que explica cómo instalar la PWA en iOS: Safari no dispara
 * `beforeinstallprompt` ahí, así que no hay botón nativo de instalación.
 * Sólo se muestra en iOS/iPadOS, fuera de modo standalone, y sólo si el
 * usuario no lo cerró antes.
 */
export function InstallPrompt() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (!isIos()) return;
    if (localStorage.getItem(DISMISSED_KEY) === "true") return;
    // Deliberadamente en un efecto: `navigator`/`localStorage` no existen en
    // el servidor, así que el primer render (SSR e hidratación) debe
    // devolver `null` y sólo mostrar el banner en un segundo pase en
    // cliente — mismo patrón que el `InstallPrompt` de la guía oficial de
    // Next.js para PWAs.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3">
      <Card padding="sm" className="flex items-start gap-3 text-sm">
        <div className="flex-1">
          <p className="font-medium text-chalk">{t("install.title")}</p>
          <p className="mt-1 text-chalk-dim">{t("install.instructions")}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            localStorage.setItem(DISMISSED_KEY, "true");
            setVisible(false);
          }}
          className="shrink-0 text-plate-gold hover:text-chalk"
        >
          {t("install.dismiss")}
        </Button>
      </Card>
    </div>
  );
}
