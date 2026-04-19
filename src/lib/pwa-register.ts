/**
 * Registro condicional do Service Worker.
 * NUNCA registra dentro do preview do Lovable (iframe ou hostname id-preview/lovableproject).
 * Em produção (app publicado) registra normalmente para PWA + push.
 */
import { Workbox } from "workbox-window";

const isInIframe = (() => {
  try {
    return typeof window !== "undefined" && window.self !== window.top;
  } catch {
    return true;
  }
})();

const isPreviewHost =
  typeof window !== "undefined" &&
  (window.location.hostname.includes("id-preview--") ||
    window.location.hostname.includes("lovableproject.com") ||
    window.location.hostname.includes("lovable.app") === false &&
      window.location.hostname.includes("lovable.dev"));

export function registerSW() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  // Em preview / iframe: garante que NENHUM SW antigo continua ativo
  if (isPreviewHost || isInIframe) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
    return;
  }

  // Produção: registra com auto-update
  const wb = new Workbox("/sw.js");
  wb.addEventListener("waiting", () => {
    wb.messageSkipWaiting();
  });
  wb.register().catch((e) => console.warn("SW register failed:", e));
}
