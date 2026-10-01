# web : Front Office public

Site public du Rotaract Club Ivandry. Next.js (App Router), TypeScript, CSS Modules.

Les commandes se lancent depuis la racine du dépôt (`npm run dev:web`, `npm run build:web`, `npm run lint`). Port de développement : 3000.

`DESIGN.md` (racine du dépôt) est la source de vérité pour toute décision visuelle. Ses fondations sont implémentées (tokens dans `src/app/tokens.css`, Open Sans variable chargée par `next/font` avec l'axe de largeur, Georgia en police système). Les pages et les composants de design ne le sont pas encore.

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
| `components/scaffold/` | Affichage provisoire du plan des pages. À supprimer une fois les pages conçues. |
| `config/` | Nom du site, routes, navigation. |
| `content/` | Textes du site, séparés des composants pour faciliter une future traduction. |
| `types/` | Types du domaine côté front (action, actualité, membre, photo). Provisoires tant que le contrat de l'API n'existe pas. |

## Conventions pour la suite

- Les sections propres à une page vivent à côté de sa route, dans un dossier privé `_sections/` (par exemple `app/actions/_sections/`). Un composant ne monte dans `components/` que lorsqu'il est réellement partagé.
- L'accès à l'API sera regroupé dans `src/lib/api/`, une fonction par ressource. Les pages appelleront ces fonctions sans connaître l'URL ni le format de l'API. Ce dossier n'existe pas encore.
- Pas de bibliothèque de gestion d'état, pas de bibliothèque de composants, pas de Tailwind.
