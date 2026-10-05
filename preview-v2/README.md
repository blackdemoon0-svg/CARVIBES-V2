# CarVibes — aperçu visuel CSS-only

## Aperçu à valider

Le live preview lancé à la racine du serveur affiche **le vrai site CarVibes**, avec ses composants, sections, données et routes existants. Une feuille CSS isolée apporte uniquement le nouveau décor visuel. **Aucune intégration n'a été faite dans l'application.**

Pour le relancer en local :

```bash
npm ci
MARKETPLACE_DATA_DIR=/tmp/carvibes-visual-preview-data \\
MARKETPLACE_MEDIA_DIR=/tmp/carvibes-visual-preview-media \\
MARKETPLACE_SESSION_SECRET=visual-only-preview-secret \\
MARKETPLACE_ADMIN_EMAILS=preview-disabled@invalid.local \\
npx vite --config preview-v2/vite.visual-preview.config.mjs
```

Puis ouvrir la racine du serveur. Les routes sont celles de CarVibes (`/`, `/explore`, `/advisor`, `/compare`, `/car/:id`, etc.). La feuille de style de prévisualisation est `visual-only.css`. Les données runtime éventuelles du Marketplace restent dans `/tmp`, séparées des données du projet.

## Ce que montre le nouveau décor

- noir profond et bleu nuit, halos bleus/cyan et touche violette très discrète ;
- accent rouge remplacé visuellement par cyan/bleu électrique ;
- fonds de sections moins plats, transparence légère sur les surfaces sombres ;
- verre discret sur les éléments déjà vitrés, liserés froids, ombres et glow retenus ;
- éclairage très doux du hero existant, sans remplacer son image ;
- voiture d'ambiance distincte dans le décor de la section Find My Car : image masquée à faible opacité, flottement/lumière très subtils ; elle n'est reliée à aucune fiche ni donnée automobile.

**La géométrie, la disposition, les espacements, le contenu, les images, les animations fonctionnelles et les interactions ne sont pas redessinés.** Les styles ne masquent et ne suppriment aucune section.

## Périmètre technique

- `visual-only.css` : couche cosmétique indépendante ;
- `vite.visual-preview.config.mjs` : sert l'application actuelle et ajoute uniquement cette feuille CSS à l'HTML du serveur de preview ; le plugin API Marketplace n'est pas lancé ;
- `../src`, `../index.html`, les routes, données, traductions, composants, logique, SEO et fichiers de configuration du projet : **non modifiés** ;
- API Marketplace du serveur de preview : même code, avec stockage isolé sous `/tmp` pour éviter de toucher aux données runtime réelles.

`index.html` et les autres maquettes autonomes historiques dans ce dossier correspondent à un concept visuel antérieur. Pour juger la demande actuelle — **même site, nouveau décor** — utiliser la racine du serveur Vite avec la configuration ci-dessus, pas `/preview-v2/index.html`.

## Après votre retour

Je n'intégrerai pas la couche de style dans le projet sans approbation explicite. Aucune logique, fonctionnalité ou structure ne sera modifiée.
