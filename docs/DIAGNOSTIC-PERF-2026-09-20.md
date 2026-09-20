# Diagnostic performance CarVibes — 20 septembre 2026

> Symptômes rapportés : depuis le 19/09, site très lent à charger ; parfois
> bloqué ou inaccessible ; aujourd'hui comportement aléatoire (ça marche,
> puis ça ne marche plus).

---

## 1. Résumé exécutif

| # | Constat | Verdict |
|---|---|---|
| 1 | Site, proxy Vercel → Railway et API répondent **tous** au moment du diagnostic | ✅ Aucune panne en cours |
| 2 | **Aucun incident** déclaré par Vercel le 19/09 ni par Railway en cours | ✅ Pas de cause plateforme |
| 3 | Le code serveur API est sain : lectures à **2-3 ms**, photos servies à **~1000 req/s** | ✅ |
| 4 | **Goulot trouvé et corrigé** : chaque vue d'annonce réécrivait tout le JSON du store, et bloquait toutes les lectures (jusqu'à **2,4 s** à 3000 annonces) | 🔧 Corrigé (commit `f89aaa6`) |
| 5 | Le store de production est **vide** (0 annonce) : ce goulot n'explique pas la lenteur du jour — c'était une bombe à retardement pour la croissance | ℹ️ |
| 6 | La lenteur **aléatoire** d'aujourd'hui pointe vers la chaîne réseau (DNS/fai/CDN images) ou un redémarrage Railway — à confirmer avec la checklist §5 | 🔍 À vérifier côté navigateur |

---

## 2. État de la production au moment du diagnostic

Testé depuis deux chemins indépendants (direct Railway + proxy Vercel) :

```
https://carvibes.dev/                                   → 200, page complète rendue
https://carvibes.dev/api/marketplace/health             → {"ok":true,...,"listings":0}
https://carvibes.dev/api/marketplace/listings           → 200, réponse complète
https://carvibes-v2-production.up.railway.app/health    → {"ok":true,...}
https://carvibes-v2-production.up.railway.app/api/marketplace/health → {"ok":true,...}
```

- Le proxy Vercel → Railway fonctionne (les deux chemins donnent la même réponse).
- Le store contient **0 annonce** (déploiement du 19/09 à 20:22 UTC — le commit
  « point marketplace proxies at the Railway API origin » qui a instauré
  l'architecture actuelle). La volumétrie est donc hors de cause aujourd'hui.
- Statuts fournisseurs : Vercel « No incidents » le 19/09 ; Railway aucun
  incident en cours (dernier : 31/08).

**Conclusion : le site n'est pas en panne côté serveur. Le problème est soit
intermittent côté réseau (entre les visiteurs et le site), soit résiduel du
redéploiement d'hier.**

---

## 3. Temps de réponse mesurés (banc de charge sur le code exact de production)

Nouveau harnais `bench/` (voir `bench/README.md`) : serveur instrumenté avec
sonde de latence event loop + scénarios de charge. Store de test : 3000
annonces, 9000 photos, `listings.json` de 8,7 Mo (échelle réaliste d'un
marketplace qui grandit).

### Au repos (store tiède)

| Endpoint | p50 | p95 | p99 |
|---|---|---|---|
| `/health` | 0,6 ms | 1,6 ms | 3,8 ms |
| `GET /listings` | 2,6 ms | 4,0 ms | 8,6 ms |
| `GET /facets` | 1,3 ms | 2,8 ms | 3,2 ms |

### Sous tempête de vues (50 visiteurs simultanés sur les annonces)

C'était **le vrai problème du code serveur** : chaque vue détail déclenchait
une réécriture **complète** du document JSON dans une chaîne d'écriture
sérialisée, et `load()` fait attendre **chaque lecture** derrière cette chaîne.

| Mesure | Avant correctif | Après correctif |
|---|---|---|
| Lectures `/listings` p50 | **582 ms** (×240 vs repos) | **102 ms** |
| Lectures p95 | **2385 ms** | **153 ms** (×15) |
| Détails p50 | **2430 ms** | **134 ms** (×18) |
| Débit détail | 34 req/s | 355 req/s |

### Photos (`/marketplace-media/*`, fichiers 300 KB, 50 clients)

Débit ~300 MB/s, ~1000 req/s, lag event loop max 23 ms — **sain**. Le service
de photos n'est pas un goulot en soi.

---

## 4. Ce qui a été corrigé (commit `f89aaa6`)

1. **`server/marketplace/store.mjs` — persistance debouncée des compteurs.**
   `recordView`/`recordClick` (les seules écritures à haute fréquence :
   chaque consultation d'annonce et chaque clic contact) sont désormais
   coalescés : **au plus une écriture/seconde** au lieu d'une par vue.
   Les mutations critiques (dépôt d'annonce, modération, uploads) restent
   écrites synchrone. Perte maximale en cas de crash brutal : ~1 s de
   compteurs — acceptable et documenté.
2. **`server/marketplace/serve.mjs` — flush à l'arrêt.** Un redeploy Railway
   (SIGTERM) écrit d'abord les compteurs en attente (garde 3 s) : zéro perte
   au déploiement, vérifié de bout en bout.
3. **`server/marketplace/handler.mjs` — `MARKETPLACE_RATE_READ` configurable.**
   La limite de 600 lectures/min/IP était codée en dur. Si jamais la chaîne
   Vercel → Railway effondrait les IP visiteurs en une seule, tout le site
   partagerait un bucket unique → 429 aléatoires. La variable permet de
   l'augmenter côté Railway sans redéployer de code.
4. **`vercel.json` — `Cache-Control: immutable` explicite sur la route proxy
   média**, pour garantir le cache navigateur/edge des photos même si
   l'origine répond mal.
5. **`bench/`** — le harnais de charge réutilisable (seed, serveur
   instrumenté, scénarios), complément backend de `scripts/smoke-perf.mjs`.

**Validation** : `scripts/smoke-marketplace.mjs` **45/45**, persistance des
compteurs et flush SIGTERM vérifiés de bout en bout.

### Limite connue restante

Le flush debouncé fait un `JSON.stringify` synchrone de tout le document :
~50 ms de stall event loop par seconde à 8,7 Mo (3000 annonces). Négligeable
en dessous de ~2000 annonces. Au-delà, la suite logique (déjà anticipée dans
`docs/MARKETPLACE.md`) : log append-only pour les compteurs ou migration
Postgres/Supabase — ne touche que `store.mjs`.

---

## 5. Les blocages « aléatoires » d'aujourd'hui : checklist réseau

Le serveur répond ; ce que votre navigateur voit, je ne peux pas le mesurer
depuis ici. Les suspects classiques d'un « parfois ça marche, parfois non »
apparu exactement au jour d'un redéploiement :

### A. Vérifier en 3 minutes (depuis votre machine)

1. **Quand le site « ne s'ouvre pas »**, noter CE qui échoue :
   - page blanche / spinner indéfiniment → probablement les **images Pexels**
     (tout le visuel vient de `images.pexels.com`, hors de votre infrastructure) ;
   - erreur DNS → problème de résolution de `carvibes.dev` ;
   - erreur SSL/certificat → provisionnement du certificat Vercel ;
   - « impossible de joindre le serveur » → réseau/faï.
2. **`https://checker.network/domain/carvibes.dev`** ou `dnschecker.org` :
   `carvibes.dev` doit résoudre vers `cname.vercel-dns.com` partout. Une ligne
   DNS mal propagée dans certains pays/faïs donne exactement un comportement
   aléatoire géographique.
3. **Ouvrir `https://carvibes.dev/api/marketplace/health`** quand le site
   bloque : si CE endpoint répond en < 1 s alors que la page d'accueil reste
   bloquée → le problème est côté **assets/images** (Pexels, ads), pas
   votre backend.
4. **Onglet Réseau des DevTools (F12)** lors d'un incident : la ou les
   requêtes en attente (colonne Time qui grimpe) désignent le coupable
   (`images.pexels.com` ? `/api/marketplace/...` ? `pagead2` ?).

### B. Côté Railway (2 minutes dans le dashboard)

5. **Metrics du service** sur les dernières 48 h : CPU, RAM (un dépassement
   de la limite → redémarrage → quelques secondes d'indisponibilité aléatoire
   sur `/marketplace` et les photos), et redémarrages du conteneur.
6. **Logs** : chercher `shutting down`, `unhandled handler error`, OOM.

### C. Si les incidents coïncident avec la consultation du marketplace

7. Avec le marketplace encore vide (0 annonce), la page `/marketplace`
   appelle l'API qui passe par **deux sauts** (navigateur → Vercel → Railway
   Amsterdam). Premier octet typique : 150-400 ms hors Maroc, plus si
   conteneur froid. C'est normal et ça restera raisonnable ; si un jour les
   photos vous semblent lentes en galerie, c'est ce chemin double-saut — la
   parade (cache edge) est déjà en place via le Cache-Control ajouté.

---

## 6. Actions recommandées (ordre de priorité)

1. **Déployer le commit `f89aaa6`** sur Railway (le store grandira un jour ;
   le goulot d'écriture est désamorcé avant, pas après).
2. **Activer un uptime check externe** (UptimeRobot/BetterStack gratuit) sur
   `https://carvibes.dev/` ET `https://carvibes.dev/api/marketplace/health`
   toutes les minutes — dans 48 h vous saurez si l'inaccessibilité est réelle
   et à quelles heures, ou purement locale/réseau.
3. **Vérifier les Metrics Railway** (RAM/CPU/redémarrages) sur 48 h.
4. Faire la checklist §5.A lors du prochain incident (2 min, réponse quasi
   certaine sur le coupable).
5. Plus tard (> 2000 annonces) : compteurs en append-only ou vraie base
   (§4, limite connue).
