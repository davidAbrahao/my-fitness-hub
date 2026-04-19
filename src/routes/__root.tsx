import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { BottomNav } from "../components/BottomNav";
import { AuthProvider, useAuth } from "../lib/auth-context";
import { AuthGate } from "../components/AuthGate";
import { migrateLocalToCloud } from "../lib/cloud-sync";
import { initOfflineQueue } from "../lib/offline-queue";
import { registerSW } from "../lib/pwa-register";
import { startReminderLoop } from "../lib/reminders";
import { Toaster } from "../components/ui/sonner";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Barriga Zero — Projeto de Transformação" },
      { name: "description", content: "Sistema completo de treino, dieta e acompanhamento corporal" },
      { name: "theme-color", content: "#1a1a2e" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Barriga Zero" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-512.png" },
      { rel: "icon", href: "/icon-512.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <AuthGate>
        <AuthedShell />
      </AuthGate>
    </AuthProvider>
  );
}

function AuthedShell() {
  const { user } = useAuth();

  // Init offline retry queue + PWA SW + reminder loop once
  useEffect(() => {
    initOfflineQueue();
    registerSW();
    startReminderLoop();
  }, []);

  // Auto-migrate localStorage → cloud once per user
  useEffect(() => {
    if (user) {
      migrateLocalToCloud(user.id).catch(console.error);
    }
  }, [user]);

  return (
    <div className="min-h-screen pb-20">
      <Outlet />
      <BottomNav />
      <Toaster position="top-center" theme="dark" />
    </div>
  );
}
