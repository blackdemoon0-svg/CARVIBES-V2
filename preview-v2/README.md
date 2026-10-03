# CarVibes V2 — Aperçu visuel (Phase 1)

**Ce dossier est un aperçu isolé. Aucun fichier du projet CarVibes n'a été modifié,
supprimé ou déplacé.** `git diff` sur les fichiers suivis est vide : tout le travail
de cette étape est contenu dans `preview-v2/`.

---

## 1. Comment le regarder

**Option A — la prévisualisation live** (recommandé) : ouvrez le serveur lancé pour
cette session (l'aperçu s'affiche directement dans le navigateur).

**Option B — en local, sans rien installer :**

```bash
cd preview-v2
python3 -m http.server 8080
# puis ouvrez http://localhost:8080
```

Vous pouvez aussi ouvrir directement `preview-v2/index.html` dans un navigateur
(aucune compilation, aucune dépendance, aucun appel réseau externe).

Une **barre de navigation « PREVIEW »** flotte en bas de l'écran pour passer d'un
écran à l'autre. Elle se met en retrait quand vous faites défiler la page, et se
ferme avec la croix. Elle fait partie de l'aperçu, pas du design : elle disparaîtra
en Phase 2.

---

## 2. Ce que contient l'aperçu

| # | Demande | Où le voir |
|---|---------|-----------|
| 1 | **Homepage complète** | `index.html` |
| 2 | **Navbar** | présente sur toutes les pages (sticky, translucide, blur léger) |
| 3 | **Hero** | haut de `index.html` (voiture cinématique + parallaxe) |
| 4 | **Section de voitures** | `index.html#cars` (+ filtres fonctionnels) |
| 5 | **CarVibes Advisor** | `index.html#advisor` (démo cliquable) et `advisor.html` |
| 6 | **Compare** | `index.html#compare` et `compare.html` (comparateur complet) |
| 7 | **Explore** | `index.html#explore` et `explore.html` (mosaïque éditoriale) |
| 8 | **Carte de voiture** | partout + `design-system.html` (états normal / survol) |
| 9 | **Page voiture exemple** | `car.html` — 8 voitures disponibles via `?car=<id>` |
| 10 | **Footer** | bas de chaque page |
| 11 | **Version mobile** | réellement responsive + `mobile.html` (3 maquettes 1:1) |

Écran bonus : `design-system.html` — la palette, la typographie, les boutons, les
cartes, les blocs de données, les animations, le RTL et l'accessibilité.

---

## 3. L'identité visuelle

- **Palette** : noir profond `#04060C`, bleu nuit `#0A1020`, bleu électrique `#3B82F6`,
  cyan `#22D3EE` (couleur de lumière principale), violet `#7C5CFF` et magenta
  `#E048A0` en accents rares, blanc cassé `#EEF2F8` pour le texte. Le fond reste
  très sombre : ce sont les voitures et la lumière qui portent le premium.
- **Typographie** : Archivo (uppercase, tracking serré) pour les titres, Inter pour
  le texte — les deux polices déjà utilisées par le produit.
- **Profondeur** : halos radiaux, grille masquée, grain de film et 34 particules
  très discrètes, répartis en calques fixes.
- **Glassmorphism modéré** : navbar, badges, panneaux de l'assistant. Jamais du verre partout.
- **Cartes** : grande image, marque, modèle, prix, trois informations essentielles.
  Au survol : montée légère, glow cyan, zoom très léger (1.055), apparition discrète
  du moteur / 0–100 / vitesse max.
- **Animations** : fade-in + slide-up à l'apparition, parallaxe du hero (5,5 % du
  scroll, desktop uniquement), micro-interactions rapides (180–620 ms). Tout est
  désactivé sous `prefers-reduced-motion`.
- **Ancien accent rouge** `#E3262E` remplacé par la lumière cyan/bleu + accents violet.

---

## 4. Ce qui est réel dans l'aperçu (à tester)

Boutons, filtres par catégorie, favoris (❤ stockés en local), sélection Compare
(tray flottant), recherche plein écran (`/` ou l'icône loupe), tiroir mobile,
navigation clavier, **assistant Advisor cliquable de bout en bout** (3 questions →
résultats classés avec score), galerie de la page voiture, changement de langue
**EN / FR / DE / AR (RTL)** depuis la navbar ou le tiroir mobile.

Les données de démonstration (8 voitures) sont dans `assets/js/data.js` : ce sont de
vraies fiches (M4 Competition, M3 Competition, 911 Carrera S, AMG GT 63, RS6 Avant
Performance, RS e-tron GT, GR Supra, X5 M Competition) avec leurs caractéristiques
publiées. **Elles ne touchent pas la base réelle des 509 voitures.**

---

## 5. Vérifications effectuées

Testé avec Chrome headless sur **21 combinaisons** (7 pages × desktop 1440 / tablette
834 / mobile 390) :

- ✅ aucune erreur JavaScript
- ✅ aucun défilement horizontal, sur aucune page ni aucune largeur
- ✅ aucune image cassée (lazy loading compris)
- ✅ aucune clé de traduction non résolue (EN, FR, DE, AR/RTL)
- ✅ navbar sticky conforme sur les trois formats
- ✅ un seul `<h1>` par écran, skip-link, focus visible, `aria-pressed` sur les bascules
- ✅ `prefers-reduced-motion` respecté
- ✅ poids total de l'aperçu ≈ 1,3 Mo (dont 936 Ko d'images déjà optimisées)

---

## 6. Structure

```
preview-v2/
├── index.html            Homepage complète
├── car.html              Page voiture (8 voitures via ?car=<id>)
├── advisor.html          CarVibes Advisor — expérience complète
├── compare.html          Comparateur visuel
├── explore.html          Découverte éditoriale + marques
├── mobile.html           3 maquettes mobiles 1:1 + règles mobile
├── design-system.html    Tokens, composants, motion, RTL, a11y
└── assets/
    ├── css/carvibes.css  L'identité visuelle complète (~1 200 lignes)
    ├── js/data.js        Données de démo + dictionnaires EN/FR/DE
    ├── js/main.js        Chrome partagé, cartes, Advisor, Compare, interactions
    ├── fonts/            Archivo + Inter (copies locales, comme le produit)
    └── img/              9 visuels automobiles cinématiques (générés pour l'aperçu)
```

---

## 7. Phase 2 — après votre validation

Rien ne sera intégré avant votre message explicite **« VALIDÉ — INTÉGRE LE DESIGN »**.

L'intégration consistera à :

1. porter les tokens de `carvibes.css` dans `src/index.css` (remplacement de la
   palette rouge par la lumière cyan/bleu, en conservant les utilitaires existants) ;
2. adapter les composants existants à la nouvelle hiérarchie visuelle :
   `Hero`, `Navigation`, `Logo`, `Footer`, `universe/CarCard`, `CarDetail`,
   `compare/*`, `advisor/*`, `FindMyCarSection`, `stories/*` ;
3. réutiliser la vraie base (`src/lib/db.ts` — 509 voitures), les vraies images, les
   10 traductions, le SEO, le sitemap, l'authentification, le marketplace et l'API
   **sans modification de logique, de routes ni de données** ;
4. re-tester toutes les routes, le responsive et les langues.

Points à trancher ensemble lors de cette phase :

- passage des images Pexels actuelles aux visuels cinématiques (le dossier
  `preview-v2/assets/img` peut servir de banque de départ) ;
- conservation ou non des cadres rouges restants (RacingVibes, badges « LIVE ») ;
- politique d'images hero sur mobile (poids réseau en 4G).

---

*Aperçu préparé en Phase 1 — Phase 1 uniquement : aucun composant, route,
traduction, donnée, fichier SEO ou fichier de configuration du projet n'a été
touché.*
