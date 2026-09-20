# Bench backend marketplace

Complète `scripts/smoke-perf.mjs` (qui couvre le front) avec un banc de
charge du **backend marketplace**, exécuté sur le code de production exact
(`server/marketplace/handler.mjs`).

## Usage

```bash
# 1. Générer un store réaliste (annonces + photos) — hors du dépôt, dans /tmp
node bench/seed.mjs 3000          # 3000 annonces × 3 photos de 300 KB

# 2. Démarrer le serveur instrumenté (code de prod + sonde de lag event loop)
MARKETPLACE_DATA_DIR=/tmp/carvibes-bench/data \
MARKETPLACE_MEDIA_DIR=/tmp/carvibes-bench/media \
PORT=8787 node bench/server-wrapper.mjs

# 3. Scénarios
node bench/run.mjs baseline   # latence séquentielle /health /listings /facets
node bench/run.mjs reads      # vagues concurrentes (c = 10/50/100)
node bench/run.mjs views      # tempête de vues détail (écritures) + lectures
node bench/run.mjs media      # tempête de photos, débit + lag event loop
node bench/run.mjs all
```

Chaque worker de charge envoie un `x-forwarded-for` distinct (comme Vercel
le fait en production) pour que le rate limiter par IP ne fausse pas les
mesures.

## Repères mesurés (2026-09-20, store 3000 annonces / listings.json 8,7 Mo)

| Scénario | Avant correctif | Après correctif |
|---|---|---|
| `/listings` séquentiel, tiède | p50 2,4 ms | p50 2,6 ms (inchangé) |
| Lectures pendant 50 vues/s | p50 **582 ms**, p95 2385 ms | p50 **102 ms**, p95 153 ms |
| Détails pendant la tempête | p50 **2430 ms** | p50 **134 ms** |
| Photos (300 KB, c=50) | ~300 MB/s, ~1000 rq/s | idem |

Le « correctif » est la persistance **debouncée** des compteurs de vues/clics
(`server/marketplace/store.mjs`) : au plus une écriture du document par
seconde au lieu d'une réécriture complète par vue.

## Limite connue restante

Le flush debouncé fait un `JSON.stringify` synchrone de tout le document
(~50 ms de stall event loop par seconde à 8,7 Mo). Négligeable en dessous
de ~2000 annonces ; au-delà, déplacer les compteurs vers un log append-only
ou une base (la migration Postgres/Supabase est déjà prévue dans
`docs/MARKETPLACE.md` et ne touche que `store.mjs`).
