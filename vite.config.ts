import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

// Identifiant de build affiché dans Réglages : sert à vérifier sans
// ambiguïté quelle version tourne réellement sur un appareil donné, plutôt
// que de deviner si un correctif a été pris en compte ou si le service
// worker sert encore une version en cache.
const appVersion =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
  new Date().toISOString().slice(0, 16).replace("T", " ");

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // On enregistre le service worker nous-mêmes (src/lib/pwaUpdate.ts)
      // pour garder une référence à l'enregistrement : nécessaire pour le
      // bouton "Vérifier les mises à jour" dans Réglages.
      injectRegister: false,
      includeAssets: [
        "icons/apple-touch-icon.png",
        "icons/favicon-16.png",
        "icons/favicon-32.png",
        "icons/splash.png",
      ],
      manifest: {
        id: "/",
        name: "BoardScore AI",
        short_name: "BoardScore",
        description:
          "Trouvez votre jeu, jouez, on s'occupe des points. Calcul automatique du score pour vos jeux de société.",
        theme_color: "#1EA39C",
        background_color: "#ECE8DC",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        lang: "fr",
        categories: ["games", "entertainment", "utilities"],
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
