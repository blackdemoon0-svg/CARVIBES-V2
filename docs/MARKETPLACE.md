# Marketplace CarVibes — déploiement (Vercel + Railway)

> Guide opérationnel pour l'architecture **A2** : le site statique reste sur
> **Vercel**, l'API Marketplace tourne sur **Railway** (un seul processus Node,
> volume persistant), et Vercel **proxyfie** deux chemins vers Railway.
>
> Aucune valeur de secret ne doit jamais être écrite dans ce fichier ni dans le
> dépôt : les exemples utilisent uniquement des jetons du type
> `YOUR_MARKETPLACE_SESSION_SECRET`.

---

## 1. Architecture

```
Navigateur
   │  https://carvibes.dev/…                      (une seule origine pour le navigateur)
   ▼
Vercel  ─────────────────────────────────────────────────────────────
   │  dist/  (site statique : 551 pages pré-rendues, /marketplace, /marketplace/sell…)
   │
   ├── /api/marketplace/(.*)     ──proxy──┐
   └── /marketplace-media/(.*)   ──proxy──┤
                                          ▼
                            Railway (1 process Node 22, 1 replica)
                              node server/marketplace/serve.mjs
                              ├── /api/marketplace/*   → API (listings, uploads, admin)
                              └── /marketplace-media/* → photos (lecture seule)
                                          │
                                          ▼
                              Volume persistant monté sur /data
                              ├── /data/marketplace/listings.json  (+ session-secret)
                              └── /data/marketplace-media/<publicId>/1.webp
```

**Pourquoi cette forme** — le navigateur ne parle qu'à `carvibes.dev` :

| Conséquence | Détail |
|---|---|
| Cookie admin **first-party** | `cv_mk_admin` (`SameSite=Lax`, HttpOnly) fonctionne tel quel : **aucune** modification de l'authentification |
| **Aucun CORS** côté navigateur | pas de préflight, pas de `SameSite=None` |
| CSRF inchangé | `sameSiteRequest()` compare `Origin` (`https://carvibes.dev`) au `Host` reçu (hôte Railway) : on satisfait la garde en déclarant `MARKETPLACE_CORS_ORIGINS=https://carvibes.dev` |
| Client inchangé | `src/lib/marketplace/api.ts` garde sa base relative `/api/marketplace` et `credentials: "same-origin"` ; les URLs de photos restent relatives et passent par le proxy |

---

## 2. Ce qui a été adapté dans le dépôt

| Fichier | Rôle |
|---|---|
| `server/marketplace/serve.mjs` | sert désormais les photos (`MARKETPLACE_MEDIA_DIR`) sous `MARKETPLACE_MEDIA_URL_PREFIX`, en lecture seule, avec garde anti-traversal, types MIME images et cache immuable |
| `vercel.json` | 2 règles de proxy **placées avant** la règle `^/api(/.*)?$ → 404` (conservée en repli) |
| `.nvmrc` | `22` — version Node du service API (Railway/Nixpacks la lit) |
| `docs/MARKETPLACE.md` | ce guide |

Rien d'autre n'a changé : ni React, ni auth, ni cookies, ni CSRF, ni store, ni données, ni SEO, ni sitemap.

---

## 3. Prérequis (à faire AVANT de déployer)

1. Un compte **Railway** (plan Hobby recommandé).
2. Le dépôt poussé sur **GitHub** (Railway déploie depuis le dépôt).
3. ⚠️ **Créer la variable `MARKETPLACE_API_ORIGIN` sur Vercel avant de déployer
   `vercel.json`.** Si elle est absente, Vercel laisse `${MARKETPLACE_API_ORIGIN}`
   littéral dans la destination (comportement documenté) et le proxy ne peut pas
   aboutir. Vercel → Project → Settings → Environment Variables → ajouter pour
   **Production** et **Preview** :
   `MARKETPLACE_API_ORIGIN = https://VOTRE-APP.up.railway.app` (sans slash final).

---

## 4. Créer le service Railway

1. **New Project → Deploy from GitHub repo** → sélectionner le dépôt CarVibes.
2. Ouvrir le service → **Settings** :
   - **Build Command** : *(laisser vide — le serveur n'a aucune dépendance npm à installer : uniquement des modules `node:` et 2 JSON du dépôt)*.
     Si Railway refuse un build vide, mettre `echo "no build step"`.
   - **Start Command** : `node server/marketplace/serve.mjs`
   - **Healthcheck Path** : `/health`
   - **Replicas** : **1** — ne jamais activer l'autoscaling (le store JSON est mono-processus ; plusieurs instances corrompraient les écritures).
   - **Region** : Europe de l'Ouest (Amsterdam) — le plus proche du Maroc.
   - **Restart policy** : on failure.
3. Onglet **Variables** → saisir les variables du §6.
4. Onglet **Volume** → **Add Volume**, point de montage **`/data`**, 1 Go
   (largement suffisant : 37 Ko d'annonces + les photos).

Le service expose automatiquement une URL HTTPS du type
`https://VOTRE-APP.up.railway.app` — c'est la valeur de `MARKETPLACE_API_ORIGIN`.

---

## 5. Node 22

- Le dépôt contient `.nvmrc` (`22`) : Railway/Nixpacks l'utilise pour choisir Node.
- Ajouter **aussi** `NODE_VERSION=22` dans les variables Railway (double sécurité).
- **Pourquoi ≥ 20.10 est obligatoire** : `server/marketplace/*.mjs` utilise les
  attributs d'import JSON (`import … with { type: "json" }`) introduits en
  Node 20.10. Sur Node 18 non patché, le service ne démarre pas.
- `package.json` n'a **pas** été modifié (pas de champ `engines`) pour ne pas
  toucher au build Vercel.

---

## 6. Variables d'environnement Railway

À saisir dans **Variables** (valeurs d'exemple = jetons à remplacer) :

| Variable | Valeur | Rôle |
|---|---|---|
| `NODE_ENV` | `production` | active le mode production : **désactive le bootstrap dev** et ajoute `Secure` au cookie admin |
| `NODE_VERSION` | `22` | version Node |
| `MARKETPLACE_ADMIN_EMAILS` | `YOUR_ADMIN_EMAIL` | **seule** source d'autorisation (allowlist). Sans elle, aucun admin (fail-closed) |
| `GOOGLE_CLIENT_ID` | `YOUR_GOOGLE_CLIENT_ID` | activation du bouton Google Sign-In |
| `MARKETPLACE_SESSION_SECRET` | `YOUR_MARKETPLACE_SESSION_SECRET` | signature HMAC du cookie admin. Générer : `openssl rand -hex 32` |
| `MARKETPLACE_DATA_DIR` | `/data/marketplace` | annonces + secret de session |
| `MARKETPLACE_MEDIA_DIR` | `/data/marketplace-media` | photos uploadées |
| `MARKETPLACE_SITE_URL` | `https://carvibes.dev` | URLs absolues (og:image, JSON-LD) |
| `MARKETPLACE_CORS_ORIGINS` | `https://carvibes.dev` | **requis** derrière le proxy (la garde CSRF compare `Origin` à `Host`) |
| `MARKETPLACE_MAX_PHOTO_BYTES` | `4194304` | 4 Mo par photo (les photos sont déjà compressées côté navigateur) |
| `MARKETPLACE_MAX_BODY_BYTES` | `12582912` | 12 Mo par requête d'upload |

Optionnelles :

| Variable | Défaut | Usage |
|---|---|---|
| `MARKETPLACE_MEDIA_URL_PREFIX` | `/marketplace-media` | à ne changer que si vous changez aussi le proxy Vercel |
| `MARKETPLACE_RATE_SUBMIT` | `12` | soumissions/heure/IP |
| `MARKETPLACE_TURNSTILE_SECRET` | — | CAPTCHA Cloudflare (off par défaut) |
| `MARKETPLACE_ADMIN_PASSCODE` | — | à éviter en production (connexion par mot de passe, limitée à la 1re adresse de l'allowlist) |
| `PORT` | injecté par Railway | le serveur lit `MARKETPLACE_PORT` puis `PORT` |

> Ne jamais coller ces valeurs dans un fichier du dépôt, une capture d'écran ou
> un ticket. En cas de fuite d'un secret : régénérer `MARKETPLACE_SESSION_SECRET`
> (déconnecte les sessions admin) et faire tourner `GOOGLE_CLIENT_ID` côté Google.

---

## 7. Proxy Vercel

`vercel.json` contient déjà les deux règles, **avant** la règle historique
`^/api(/.*)?$ → 404` et **avant** les règles de disque :

```json
{
  "src": "^/api/marketplace/(.*)$",
  "dest": "${MARKETPLACE_API_ORIGIN}/api/marketplace/$1",
  "env": ["MARKETPLACE_API_ORIGIN"]
},
{
  "src": "^/marketplace-media/(.*)$",
  "dest": "${MARKETPLACE_API_ORIGIN}/marketplace-media/$1",
  "env": ["MARKETPLACE_API_ORIGIN"]
}
```

- `${MARKETPLACE_API_ORIGIN}` est résolu à l'exécution depuis les variables
  d'environnement du projet Vercel (syntaxe officielle `$VAR` / `${VAR}` + tableau `env`).
- `^/api(/.*)?$ → 404` reste le repli : `/api` et `/api/<autre>` répondent
  toujours 404, comme avant.
- Effet volontaire : le proxy passe **avant** le disque, donc
  `/marketplace-media/*` est servi par Railway (photos à jour) et jamais par la
  copie figée dans `dist/`.

Déployer, puis vérifier depuis un poste avec accès Internet :

```bash
curl -s https://carvibes.dev/api/marketplace/health
# attendu : {"ok":true,"storage":"json-file","production":true,"listings":N,"approved":M}

curl -s -o /dev/null -w '%{http_code}\n' https://carvibes.dev/api/marketplace/listings   # 200
curl -s -o /dev/null -w '%{http_code}\n' https://carvibes.dev/api/blabla                 # 404 (repli inchangé)
curl -s -D - -o /dev/null https://carvibes.dev/marketplace-media/<publicId>/1.webp | head -5
# attendu : 200, content-type: image/webp, cache-control: public, max-age=31536000, immutable
```

Si `health` renvoie du HTML (page 404 du site) → le proxy n'a pas été pris en
compte : vérifier que `MARKETPLACE_API_ORIGIN` est bien définie **puis redéployer**
(les règles sont lues au déploiement).

---

## 8. Google OAuth (identité admin)

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) →
   **Créer des identifiants → ID client OAuth → Application Web**.
2. **Origines JavaScript autorisées** : `https://carvibes.dev`
   (+ l'URL du preview Vercel si vous testez l'admin dessus).
   **Aucun URI de redirection n'est nécessaire** : le jeton est vérifié côté serveur.
3. Copier l'ID client → variable **Railway** `GOOGLE_CLIENT_ID`
   (jamais de secret client : il n'est pas utilisé).
4. Dans `MARKETPLACE_ADMIN_EMAILS`, mettre l'adresse exacte du compte Google
   (minuscules). C'est cette liste, et elle seule, qui décide qui est admin.
5. Vérifier : `/admin/marketplace` doit afficher le bouton Google ;
   après connexion, `/api/marketplace/admin/session` répond
   `{"authenticated":true,"email":"votre@adresse", …}`.

---

## 9. Tests post-déploiement

À exécuter dans l'ordre, sur le domaine public :

1. **Vitrine** — `https://carvibes.dev/marketplace` s'ouvre, bandeau de
   lancement visible, `curl …/api/marketplace/health` répond en JSON avec
   `production: true`.
2. **Dépôt d'annonce** — `/marketplace/sell`, téléverser 2 photos : les
   miniatures apparaissent, la soumission renvoie une référence.
3. **PENDING** — l'annonce n'apparaît **pas** sur `/marketplace` et **pas** dans
   `sitemap.xml`.
4. **Connexion admin** — `/admin/marketplace` avec le compte Google de
   l'allowlist → tableau de bord + compteurs (Total / Pending / Published /
   Rejected / Total views).
5. **Bouton Creator Dashboard** — visible sur `/marketplace` **uniquement**
   connecté ; invisible en navigation privée.
6. **Approbation** — APPROVE → l'annonce devient PUBLISHED et apparaît
   immédiatement sur `/marketplace` (photo incluse).
7. **Refus** — REJECT avec motif → REJECTED, motif affiché, non publique.
8. **Statistiques** — ouvrir une annonce publiée : `Total views` augmente.
9. **Persistance** — redémarrer le service Railway (Deployments → Restart) :
   annonces, photos, vues et compteurs de clics sont toujours là.
10. **Sécurité** — en navigation privée : `/api/marketplace/admin/listings` → `401`
    et aucune trace d'admin dans la page publique.

---

## 10. Sauvegarde du volume

Tout ce qui compte tient dans `/data` (`listings.json` + photos) :

```bash
# Sauvegarde (Railway CLI installée et projet lié) :
railway ssh -- "tar czf - -C /data ." > carvibes-marketplace-$(date +%F).tar.gz
```

- Si `railway ssh` n'est pas disponible sur votre plan, utilisez les snapshots de
  volume proposés dans le dashboard Railway (Volume → Backups) ou un job planifié
  qui copie l'archive vers un stockage objet.
- **Restauration** : uploader l'archive dans le volume puis redémarrer le service.

```bash
cat carvibes-marketplace-2026-09-19.tar.gz | railway ssh -- "tar xzf - -C /data"
```

- Fréquence conseillée : quotidienne + avant chaque mise à jour importante.
- Le volume n'est **jamais** supprimé lors d'un redéploiement ; supprimer le
  volume efface annonces et photos.

---

## 11. Rollback

| Situation | Procédure |
|---|---|
| Nouveau code API cassé | Railway → **Deployments** → choisir le déploiement précédent → **Redeploy** (le volume est conservé) |
| Mauvais déploiement front | Vercel → **Deployments** → déploiement précédent → **Promote to Production** |
| Le proxy pose problème | Retirer les 2 règles de `vercel.json` (ou revenir à la version précédente du fichier) et redéployer : le site redevient purement statique, `/api/*` repart en 404 comme avant. Le contenu déjà approuvé reste consultable si les pages pré-rendues existent ; l'admin et les nouvelles annonces ne sont plus servis. |
| Session admin à invalider | Régénérer `MARKETPLACE_SESSION_SECRET` (Railway → Variables) → toutes les sessions tombent |

⚠️ Ne jamais supprimer le volume ni changer son point de montage pour « réparer ».

---

## 12. Dépannage

| Symptôme | Cause probable |
|---|---|
| `/api/marketplace/*` → 404 du site | `MARKETPLACE_API_ORIGIN` absente sur Vercel (la référence reste littérale) ou `vercel.json` non déployé |
| `/api/marketplace/*` → 502/504 | service Railway arrêté (crash) : lire les logs (`NODE_VERSION` manquant ? volume non monté ?) |
| `403 cross_site` au login / à la modération | `MARKETPLACE_CORS_ORIGINS` manquante ou différente de `https://carvibes.dev` |
| Login OK mais `/admin/session` → `authenticated:false` | `MARKETPLACE_SESSION_SECRET` absent/rotaté, ou volume non monté (le secret est alors régénéré à chaque démarrage) |
| Photos en 404 | `MARKETPLACE_MEDIA_DIR` mal monté, volume vide, ou fichier réellement absent |
| Annonces perdues après redéploiement | volume non monté sur `/data` (les données étaient dans le conteneur éphémère) |
| `429` au dépôt d'annonce | limitation de débit (`MARKETPLACE_RATE_SUBMIT`) |

---

## 13. Limites connues & points de vigilance

1. **Un seul processus.** Le store est un fichier JSON avec écritures sérialisées
   en mémoire : ne jamais passer à 2 réplicas (corruption). Au-delà de quelques
   milliers d'annonces, migrer vers une base (le store est isolé dans un module).
2. **SEO des nouvelles annonces.** `dist/sitemap.xml` et les pages
   `/marketplace/car/<slug>.html` sont générés **au build**. Une annonce approuvée
   après le dernier déploiement Vercel est visible dans l'application (données API)
   mais n'a ni page pré-rendue ni entrée de sitemap. Solutions ultérieures :
   redéployer après approbation (deploy hook Vercel) ou servir le sitemap
   dynamiquement depuis l'API.
3. **Photos en attente.** Les photos d'une annonce non publiée sont servies sous
   une URL non devinable (`/marketplace-media/<publicId>/…`). Si une
   confidentialité stricte est exigée, les sortir du préfixe public et les servir
   via une route API authentifiée (changement de code à prévoir).
4. **Rate limiting en mémoire** : suffisant sur un seul processus ; un redémarrage
   remet les compteurs à zéro.
5. **Coût indicatif** : Railway Hobby ≈ 5 $/mois (crédit d'usage inclus) + le
   volume (0,15 $/GB) ; Vercel selon votre plan existant.

---

## 14. Aide-mémoire

```bash
# Démarrage local identique à la production (store dans /tmp pour ne rien casser) :
NODE_ENV=production PORT=8789 \
MARKETPLACE_DATA_DIR=/tmp/carvi/data \
MARKETPLACE_MEDIA_DIR=/tmp/carvi/media \
MARKETPLACE_ADMIN_EMAILS=YOUR_ADMIN_EMAIL \
MARKETPLACE_SESSION_SECRET=YOUR_MARKETPLACE_SESSION_SECRET \
node server/marketplace/serve.mjs

# Sans NODE_ENV=production, le serveur démarre en mode dev (compte bootstrap) :
npm run marketplace:serve
```
