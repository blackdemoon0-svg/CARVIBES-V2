import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { marketplaceApiPlugin } from "../server/marketplace/vite-plugin.mjs";

const previewDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(previewDir, "..");

const visualOnlyStylesheet = {
  name: "carvibes-visual-only-preview",
  transformIndexHtml: {
    order: "post",
    handler(html) {
      // One stylesheet only: no application scripts or markup are injected.
      if (html.includes("/preview-v2/visual-only.css")) return html;
      return html.replace(
        "</head>",
        '  <link rel="stylesheet" href="/preview-v2/visual-only.css?v=decor-car-1" data-carvibes-visual-preview="true" />\n  </head>',
      );
    },
  },
};

// Use the real app source/routes and regular Vite/React/Tailwind/Marketplace
// pipeline. The preview process receives separate /tmp data/media locations
// so it cannot read or write the project's real marketplace runtime data.
export default defineConfig({
  root: projectRoot,
  base: "/",
  plugins: [marketplaceApiPlugin(), react(), tailwindcss(), visualOnlyStylesheet],
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    allowedHosts: [".e2b.app"],
    watch: { ignored: ["**/public/marketplace-media/**", "**/data/**"] },
  },
  resolve: {
    alias: { "@": path.resolve(projectRoot, "src") },
  },
});
