# Contrat : Front Office

Aucune route d'API nouvelle. Le site lit `GET /api/v1/actions/:slug` et `GET /api/v1/news/:slug` (`ARCHITECTURE.md`, section 6) par `src/data/*`, depuis son serveur.

## Adresses

| Adresse | Fichier | Rendu |
|---|---|---|
| `/actions` | `app/actions/(liste)/page.tsx` (+ `loading.tsx`) | Inchangé, déplacé dans un groupe de routes (research R2) |
| `/actions/<slug>` | `app/actions/[slug]/page.tsx` | À la demande ; `404` si l'API répond `404` |
| `/actualites` | `app/actualites/(liste)/page.tsx` (+ `loading.tsx`) | Inchangé, déplacé |
| `/actualites/<slug>` | `app/actualites/[slug]/page.tsx` | À la demande ; `404` si l'API répond `404` |
| toute adresse inconnue | `app/not-found.tsx` | Page introuvable, `404` |
| erreur de rendu | `app/error.tsx` | Page d'erreur, « Réessayer » |

## Couche de données

```ts
// lib/api.ts
apiGetOrNull<T>(path: string): Promise<T | null>   // 404 → null ; autre statut ≠ 200 → erreur

// data/actions.ts
getActionBySlug(slug: string): Promise<Action | null>

// data/news.ts
getNewsBySlug(slug: string): Promise<NewsItem | null>

// config/routes.ts
actionPath(slug: string): string      // "/actions/<slug encodé>"
newsItemPath(slug: string): string    // "/actualites/<slug encodé>"
```

## Page d'une action

Ordre de lecture (composition : `DESIGN.md`, ajout de R7) :

1. Marge : étiquette « Action », « Année Rotary 2025-2026 », date (« 14 mars 2026 », sans fuseau), domaines (libellés de `focusAreas`).
2. `h1` : titre.
3. Photographie principale (`PhotoFrame`, 3:2, `priority`) ; sans photographie, gabarit 3:2 « Photographie à venir ».
4. Accroche : résumé, s'il existe.
5. Récit : paragraphes de la description, s'il y en a.
6. Fiche d'impact (`<dl>`), une ligne par rubrique renseignée, intitulés de `actionsIndex.impactLabels` ; puis « Partenaires » si la liste n'est pas vide. Aucune ligne vide.
7. Planche : photographies 2 à n, chacune avec légende et crédit.
8. Sortie : `ArrowLink` « Toutes les actions » (`/actions`), `Onward`, `JoinReminder`.

## Page d'une actualité

1. Marge : jour monumental (« 14 »), « mars 2026 » et le type en étiquettes (heure de Madagascar).
2. `h1` : titre ; dessous, le lieu et « Année Rotary … » en métadonnées.
3. Photographie principale en 16:9 à bord perdu, si elle existe (aucun gabarit sinon).
4. Chapeau : résumé, s'il existe.
5. Texte : paragraphes du contenu.
6. Marge photographique : photographies 2 à n, légende et crédit.
7. Sortie : `ArrowLink` « Toutes les actualités » (`/actualites`), `Onward`.

## Métadonnées (`generateMetadata`)

| Clé | Valeur |
|---|---|
| `title` | titre du contenu (gabarit racine « %s \| Rotaract Club Ivandry ») |
| `description` | résumé, sinon premier paragraphe ; ≤ 160 caractères, coupé sur un mot, « … » |
| `openGraph.type` | `"article"` |
| `openGraph.images` | photographie principale (`url`, `width`, `height`, `alt`) ; sinon ouverture de l'accueil des réglages du site ; sinon aucune |

## Listes et accueil

| Où | Avant | Après |
|---|---|---|
| Accueil, `LatestActions` | lien vers `/actions` | lien vers `actionPath(slug)` |
| Accueil, `LatestNews` | lien vers `/actualites` | lien vers `newsItemPath(slug)` |
| Actions, `ActionsIndex` | titre et image non cliquables ; `details` « Lire la suite » (description, impact, photographies) | titre et image principale liés ; `ArrowLink` « Lire la suite » ; description, impact et photographies suivantes retirés de la liste |
| Actualités, `NewsFeature` | `details` « Lire la suite » | titre lié ; `ArrowLink` « Lire la suite » |
| Actualités, `NewsRegister` | `details` « Lire la suite » dans la ligne | titre de la ligne lié ; état de survol de la ligne conservé ; texte et photographies retirés de la ligne |

Filtres, ancre `#liste`, ordre et lecture complète des listes : inchangés.

## Page introuvable et page d'erreur

- `not-found.tsx` : « 404 » monumental au trait en marge, `h1` « Cette page n'existe pas, ou plus. », phrase « L'adresse est peut-être ancienne, ou le contenu a été retiré. », liens fléchés Accueil, Actions, Actualités. Métadonnées : titre « Page introuvable ».
- `error.tsx` : `h1` « Le contenu n'a pas pu être chargé. », phrase « Réessayez dans un instant. », bouton « Réessayer », lien fléché vers l'accueil.
