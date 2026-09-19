import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// Marketplace API (listings, uploads, admin moderation). Mounted into the
// dev + preview server so the marketplace is fully functional in the
// preview; production runs the same handler via `npm run marketplace:serve`.
import { marketplaceApiPlugin } from "./server/marketplace/vite-plugin.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  // Keep absolute asset paths (e.g. /assets/index-*.js, /favicon.svg) so
  // files resolve correctly on deep SPA routes (/car/:id) served by the
  // Vercel rewrite — and so every prerendered HTML copy can share them.
  base: "/",
  plugins: [marketplaceApiPlugin(), react(), tailwindcss()],
  // Uploaded listing photos live in public/marketplace-media (git-ignored,
  // written by the API). Watching it would restart the server on every upload.
  server: {
    watch: { ignored: ["**/public/marketplace-media/**", "**/data/**"] },
    // Live-preview hosts (e.g. *.e2b.app) must be allowed to view the app.
    allowedHosts: [".e2b.app"],
  },
  build: {
    // Route-aware <link rel="modulepreload"> injection in
    // scripts/prerender.mjs reads this manifest to know which hashed
    // chunk belongs to which page (deep links stop waterfailing).
    manifest: true,
    // Multi-asset build (no inlining): each prerendered HTML page stays a
    // ~15 KB shell that shares the same hashed JS/CSS chunks, instead of
    // duplicating a 1.3 MB inlined bundle 548 times.
    assetsInlineLimit: 0,
    cssCodeSplit: true,
    // Emit <link rel="modulepreload"> for the entry's static chunks so the
    // browser fetches vendor + entry in parallel with HTML parsing.
    modulePreload: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // One stable vendor chunk (React, router, …) shared by the entry
        // and every lazy route — hashed filename => immutable caching.
        manualChunks(id) {
          if (id.includes("node_modules")) return "vendor";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
