// ============================================================
// CARVIBES / MARKETVIBES — Vite dev + preview middleware
//
// Mounts the marketplace API inside the Vite server itself, so
// `npm run dev` and `npm run preview` give a COMPLETE marketplace —
// persistent storage, uploads, admin session — on the same origin as
// the UI (no CORS, no second process, no proxy config, and therefore
// nothing that can break behind the preview proxy).
//
// Production on Vercel is static: run the same API with
// `npm run marketplace:serve` (see docs/MARKETPLACE.md) and point the
// UI at it with VITE_MARKETPLACE_API_URL.
// ============================================================

import { DEV_ADMIN, GOOGLE_CLIENT_ID, IS_PRODUCTION, paths } from "./config.mjs";

const PREFIX = "/api/marketplace";

export function marketplaceApiPlugin() {
  return {
    name: "carvibes-marketplace-api",
    apply: () => true,
    configureServer(server) {
      attach(server, "dev");
    },
    configurePreviewServer(server) {
      attach(server, "preview");
    },
  };
}

function attach(server, mode) {
  const loaded = import("./handler.mjs").then((m) => m.createMarketplaceHandler());
  let announced = false;

  server.middlewares.use(async (req, res, next) => {
    const url = req.url ?? "";
    if (!url.startsWith(PREFIX)) return next();
    try {
      const handler = await loaded;
      await handler(req, res);
      if (!announced) {
        announced = true;
        announce(mode);
      }
    } catch (error) {
      console.error("[marketplace] middleware failure:", error);
      if (!res.headersSent) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "server_error" }));
      }
    }
  });

  // Announce the bootstrap admin the first time the API is touched (and
  // immediately on boot in dev, so the credentials are easy to find).
  if (mode === "dev") announce(mode);
}

function announce(mode) {
  if (IS_PRODUCTION) return;
  console.log(
    `\n[marketplace] API mounted at ${PREFIX} (${mode}) · storage: ${paths.dataDir} · media: ${paths.mediaDir}`
  );
  if (DEV_ADMIN) {
    console.log(`[marketplace] ADMIN sign-in (dev bootstrap):`);
    console.log(`[marketplace]   e-mail   : ${DEV_ADMIN.email}`);
    console.log(`[marketplace]   passcode : ${DEV_ADMIN.passcode}`);
    console.log(`[marketplace]   url      : /admin/marketplace`);
  }
  if (GOOGLE_CLIENT_ID) {
    console.log("[marketplace] Google Sign-In enabled (GOOGLE_CLIENT_ID is set).");
  } else {
    console.log("[marketplace] Google Sign-In NOT configured — set GOOGLE_CLIENT_ID + MARKETPLACE_ADMIN_EMAILS to use Google as the admin identity.");
  }
  console.log("");
}
