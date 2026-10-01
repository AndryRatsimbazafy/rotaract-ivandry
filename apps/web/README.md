# web : Front Office public

Site public du Rotaract Club Ivandry. Next.js (App Router), TypeScript, CSS Modules.

Les commandes se lancent depuis la racine du dépôt (`npm run dev:web`, `npm run build:web`, `npm run lint`). Port de développement : 3000.

`DESIGN.md` (racine du dépôt) est la source de vérité pour toute décision visuelle. Ses fondations sont implémentées (tokens dans `src/app/tokens.css`, Open Sans variable chargée par `next/font` avec l'axe de largeur, Georgia en police système). La page d'accueil est conçue ; les quatre autres pages affichent encore leur plan provisoire.

## Routes

| Route | Page |
|---|---|
| `/` | Accueil |
| `/actions` | Actions du club |
| `/actualites` | Actualités et événements |
| `/membres` | Membres du club |
| `/rejoindre` | Nous rejoindre |

## Organisation de `src/`

| Dossier | Rôle |
|---|---|
| `app/` | Routes, layout racine, métadonnées, tokens (`tokens.css`) et styles de base (`globals.css`). Une page compose des sections, elle ne contient ni données ni styles partagés. |
| `components/layout/` | Coque du site : en-tête, pied de page, navigation, enveloppe de section. |
| `components/media/`, `components/ui/` | Éléments partagés entre sections : cadre de photographie et son gabarit, lien fléché, étiquette de section, styles de bouton. |
| `components/scaffold/` | Affichage provisoire du plan des pages. À supprimer une fois les pages conçues. |
| `config/` | Nom du site, routes, navigation. |
| `content/` | Textes du site, séparés des composants pour faciliter une future traduction. |
| `data/` | Fonctions qui fournissent les données aux pages (actions, actualités, membres). Elles renvoient des listes vides pour l'instant et seront remplacées par les appels à l'API. |
| `types/` | Types du domaine côté front (action, actualité, membre, photo). Provisoires tant que le contrat de l'API n'existe pas. |

## Conventions pour la suite

- Les sections propres à une page vivent à côté de sa route, dans un dossier privé `_sections/` (par exemple `app/_sections/` pour l'accueil). Un composant ne monte dans `components/` que lorsqu'il est réellement partagé.
- Les pages obtiennent leurs données par les fonctions de `src/data/`, sans connaître l'URL ni le format de l'API. Le branchement à l'API se fera dans ces fonctions.
- Pas de bibliothèque de gestion d'état, pas de bibliothèque de composants, pas de Tailwind.
