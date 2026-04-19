import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: false, // we register manually with iframe guard
        devOptions: { enabled: false },
        includeAssets: ["icon-512.png"],
        manifest: {
          name: "Barriga Zero — Transformação",
          short_name: "Barriga Zero",
          description: "Treino, dieta e acompanhamento corporal",
          theme_color: "#1a1a2e",
          background_color: "#0a0a14",
          display: "standalone",
          orientation: "portrait",
          start_url: "/",
          scope: "/",
          lang: "pt-BR",
          icons: [
            { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
        workbox: {
          navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//],
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.origin === self.location.origin && url.pathname.startsWith("/assets/"),
              handler: "StaleWhileRevalidate",
              options: { cacheName: "assets-cache" },
            },
          ],
        },
      }),
    ],
  },
});
