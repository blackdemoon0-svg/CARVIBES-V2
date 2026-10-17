# Diagnostic accès CarVibes — 17 octobre 2026

> Symptôme rapporté : « quand je recherche CarVibes sur Google et que
> j'ouvre le résultat, la page se bloque ou affiche “Site inaccessible” ».

---

## 1. Résumé exécutif

| # | Constat | Verdict |
|---|---|---|
| 1 | `https://carvibes.dev/` répond **200**, servi par Vercel, HSTS actif | ✅ Sain |
| 2 | `https://www.carvibes.dev/` répond **308 → `https://carvibes.dev/`** puis 200 | ✅ Sain |
| 3 | DNS : NS Vercel, A `64.29.17.65` / `216.198.79.1`, pas d'AAAA parasite, CAA compatible Let's Encrypt | ✅ Sain |
| 4 | Dernier déploiement production **READY** sur `5da0d4d` ; hashes d'assets identiques à un build local de ce commit | ✅ Sain |
| 5 | Routes testées (`/explore`, `/car/:id`, `/analyze`, `/marketplace`, 404) : codes corrects, pas de boucle | ✅ Sain |
| 6 | **`carvibes-coral.vercel.app` répond `404 DEPLOYMENT_NOT_FOUND` sur tous les chemins** — et c'est l'hôte que le `robots.txt` + `sitemap.xml` de la v1 désignaient aux moteurs | ❌ **Cause racine** |
| 7 | 75 URLs publiées par la v1 tombaient encore dans les catch-alls 404 du domaine canonique | ❌ Corrigé ici |
| 8 | Les alias `*.vercel.app` de production sont derrière Vercel Authentication (page de login) | ⚠️ À décider |
| 9 | Jeton de vérification Google incohérent : meta `Q9IY…` vs TXT DNS `MJUUF…` | ⚠️ À corriger dans Search Console |

**Le domaine, le DNS, le certificat, le déploiement et le routage ne sont
pas en cause.** Le seul hôte CarVibes réellement inaccessible est
`carvibes-coral.vercel.app`, l'ancien domaine de la v1.

---

## 2. Ce qui a été mesuré

### Domaine et transport

```
https://carvibes.dev/          200 OK   Server: Vercel   Strict-Transport-Security: max-age=63072000
https://www.carvibes.dev/      308      Location: https://carvibes.dev/   (puis 200)
```

DNS public (`dns.google`) :

```
carvibes.dev      NS   ns1.vercel-dns.com
carvibes.dev      A    64.29.17.65, 216.198.79.1        (anycast Vercel)
carvibes.dev      AAAA (aucun)
carvibes.dev      CAA  0 issue "letsencrypt.org" / "pki.goog" / "sectigo.com"
carvibes.dev      TXT  google-site-verification=MJUUF7Hy3FvVKh47DupHNDuzLPQobdG40MqeNFwON7E
```

Vercel : `carvibes.dev` et `www.carvibes.dev` sont vérifiés et rattachés
au **seul** projet `carvibesv2` (aucun conflit avec `carvibes-v2`).
Le dernier déploiement production (`dpl_9hCWynujVUPxsmwNWrEdXsVnXfr7`,
target `production`, état `READY`) a été construit depuis `node 24.x` /
`main` @ `5da0d4d`.

Les assets servis en production (`/assets/index-DzW4E4QA.js`,
`/assets/index-CgVMJfpx.css`) portent **exactement** les hashes produits
par `npm run build` sur ce commit : la production sert bien ce code-là.

### Routes

| URL | Résultat |
|---|---|
| `/` | 200, HTML pré-rendu |
| `/explore` | 200 |
| `/car/tesla-model-3` | 200 (`tesla-model-3.html`) |
| `/analyze` | 200 (`analyze.html`) |
| `/marketplace` | 200 |
| `/api/marketplace/health` | 200 `{"ok":true,…}` |
| `/cars/audi-a3-2024` | 301 → `/car/audi-a3` → 200 |
| `/cars/mercedes-benz-g-class-g63-amg-2024` | 301 → `/car/mercedes-g63-amg` → 200 |
| `/this-route-does-not-exist` | 404 réel, `X-Robots-Tag: noindex` |

Aucune boucle de redirection, aucun 5xx.

### L'hôte mort

```
https://carvibes-coral.vercel.app/                     404: NOT_FOUND
https://carvibes-coral.vercel.app/cars/audi-a3-2024    404: NOT_FOUND
                                          → 404 DEPLOYMENT_NOT_FOUND (Vercel)
```

Ce nom n'est rattaché à aucun projet : le projet `carvibes` (v1) n'a
**aucun** domaine, `carvibes-v2` n'a que son alias généré, et `carvibesv2`
ne porte que `carvibes.dev` + `www.carvibes.dev`. C'est un alias orphelin
qui pointe vers un déploiement supprimé. **Vercel répond avant d'atteindre le
`vercel.json`** — aucune règle de ce dépôt ne peut donc intercepter ces
requêtes.

### Pourquoi Google

Le dépôt v1 (`blackdemoon0-svg/CARVIBES.`) contient :

```ts
// src/app/sitemap.ts
const BASE_URL = "https://carvibes-coral.vercel.app";
// src/app/robots.ts
sitemap: "https://carvibes-coral.vercel.app/sitemap.xml",
```

Son sitemap énumère **141 URLs `/cars/<marque-modèle-année>`** et son
`robots.txt` ne cite que cet hôte. Tous les fichiers SEO de la v1 ont
donc envoyé les robots vers un nom qui ne sert plus rien aujourd'hui.

L'alias v1 encore vivant (`carvibes-blackdemoon0-2303s-projects.vercel.app`)
sert toujours l'ancien site et renvoie encore ce sitemap mort : la
blessure est entretenue à chaque crawl.

### Ce qui manquait sur le domaine canonique

En comparant l'inventaire v1 complet à la table de routes de
`vercel.json`, **75 URLs de la v1 tombaient dans les 404** :

| Famille v1 | URLs cassées |
|---|---|
| `/cars/<slug>` (voitures absentes du catalogue v2) | 11 |
| `/brands/<slug>` | 39 |
| `/news/<slug>` | 14 |
| `/rankings` + `/rankings/<slug>` | 11 |

Les 130 redirections `/cars/*` déjà présentes étaient correctes ; il en
manquait 11, et les trois autres familles n'étaient pas couvertes.

---

## 3. Correction appliquée

`vercel.json` — 75 redirections **301** ajoutées avant les catch-alls,
sans modifier aucune route existante (0 ligne supprimée) :

- 11 `/cars/<slug>` v1 → `/explore?brand=<Marque>` (les modèles n'existent
  pas dans le catalogue v2 ; Rivian, absent de la base, pointe vers `/brands`) ;
- 39 `/brands/<slug>` → `/explore?brand=<Marque>` ;
- 14 `/news/<slug>` → `/news` ;
- 11 `/rankings*` → `/explore` ou la catégorie v2 correspondante.

`scripts/verify-legacy-routes.mjs` (nouveau, `npm run verify:legacy`)
rejoue l'inventaire v1 complet — 220 URLs — contre la table de routes
réelle : **75 problèmes sur la configuration précédente, 0 après**.

`scripts/verify-seo.mjs` résout désormais la cible d'une 301 sur son
pathname (une redirection legacy peut porter une query string).

`scripts/verify-hydrated.mjs` : constante obsolète corrigée
(12 → 13 pages statiques ; `/analyze` a été ajouté en PR #28).

Aucune page, aucun composant, aucun design, aucune fonctionnalité
(auth, marketplace, moteur Analyse, quiz, advisor) n'a été modifié.

---

## 4. Vérifications exécutées

```
npm run build            ✅ 555 fichiers HTML → dist/ (19 statiques, 509 voitures, 25 stories, 1 page 404)
npm run verify:seo       ✅ 555 pages, canonicals, sitemap en phase, toutes les cibles de 301 résolvent
npm run verify:legacy    ✅ 220 URLs v1 résolvent (141 cars, 39 brands, 14 news, 10 rankings, 11 statiques)
npm run verify:hydrated  ✅ 130/130
npm run typecheck        ✅
npm run smoke:perf       ✅
npm run smoke:analyze    ✅ 150 checks
```

Non testable depuis cet environnement : le rendu dans un vrai navigateur
mobile et la position exacte de Google (pas d'accès Search Console ; les
requêtes `site:` ne sont pas disponibles ici). Les tests jsdom couvrent
le boot React, le routage profond, le RTL, l'advisor et le 404.

---

## 5. Actions manuelles restantes

Ces actions ne peuvent pas être faites depuis le dépôt.

### Google Search Console (propriété `carvibes.dev`)

1. **Sitemaps** → soumettre / re-soumettre `https://carvibes.dev/sitemap.xml`.
2. **Inspection d'URL** → « Demander l'indexation » pour `/`, `/explore`,
   `/brands`, `/analyze` et les 5–6 fiches voitures les plus fortes.
3. **Suppressions → Suppression temporaire** pour
   `carvibes-coral.vercel.app/` : les URLs mortes sortent du résultat en
   quelques heures au lieu d'attendre des semaines, et Google les
   supprimera durablement au prochain crawl (404).
4. **Paramètres → Validation** : le jeton DNS
   (`MJUUF7Hy3FvVKh47DupHNDuzLPQobdG40MqeNFwON7E`) et le jeton meta de
   `index.html` (`Q9IY-30MOLsIMVPW3h8IKngR6DfnOZYC8vP09WKBwcY`) sont
   différents. Aligner sur celui qui possède réellement la propriété.

### Vercel

1. **Ancien projet `carvibes`** (dépôt `CARVIBES.`) : il sert encore la v1
   sur `carvibes-blackdemoon0-2303s-projects.vercel.app` et référence le
   sitemap mort. Le supprimer, ou le redéployer avec une redirection 308
   vers `https://carvibes.dev/:path*`.
2. **Deployment Protection** : la protection est réglée sur
   « all except custom domains », et les alias `*.vercel.app` testés
   (production comme preview) renvoient une page de connexion Vercel. Si
   ces URL sont partagées ou indexées, ce sont des impasses. Passer à
   « Only Preview Deployments » (Settings → Deployment Protection).
3. `carvibes-coral.vercel.app` **ne peut pas être récupéré** : les
   sous-domaines `*.vercel.app` ne sont pas attribuables à un projet. La
   seule sortie est côté Google (point 5.1.3) et côté ancien projet
   (point 5.2.1).

---

## 6. Limites

- `get_domain_config` / `get_domain` de l'API Vercel ont échoué
  (schéma d'outil / permissions) : DNS et TLS ont donc été vérifiés via
  résolveurs publics et sondes d'en-têtes, pas via le tableau de bord.
- L'index Google lui-même n'est pas interrogeable depuis cet
  environnement. Le lien entre l'hôte mort et le résultat Google est
  l'inférence la plus solide disponible : c'est le seul hôte CarVibes en
  erreur, et c'est exactement celui que tous les fichiers SEO de la v1
  désignaient.
