# Data Model: Pages de détail

Aucune entité nouvelle, aucun champ nouveau. Les pages lisent les vues publiques existantes de l'API (`ARCHITECTURE.md`, section 13).

## Action (lecture `GET /actions/:slug`)

| Champ API | Type Front Office (`types/action.ts`) | Affichage sur la page |
|---|---|---|
| `slug` | `slug` | Adresse `/actions/<slug>` |
| `title` | `title` | Titre (h1) |
| `summary` | `summary?` | Accroche ; description de partage |
| `description` | `description?: string[]` (paragraphes) | Récit |
| `date` | `date` (ISO 8601, date sans heure) | Jour, mois, année en marge, **sans conversion de fuseau** (lecture en temps universel) |
| `rotaryYear` | `rotaryYear` | Marge |
| `focusAreas` | `focusAreas` | Marge, libellés de `content/home.ts` (`focusAreas`) |
| `impact.objective`, `beneficiaries`, `location`, `period`, `results` | `impact?` | Fiche d'impact, rubrique par rubrique, seulement si renseignée |
| `impact.partners` | `impact?.partners` | Partenaires, sous la fiche |
| `photos[]` | `photos: Photo[]` | Ouverture (la première) et planche (les suivantes) |

## Actualité (lecture `GET /news/:slug`)

| Champ API | Type Front Office (`types/news.ts`) | Affichage sur la page |
|---|---|---|
| `slug` | `slug` | Adresse `/actualites/<slug>` |
| `title` | `title` | Titre (h1) |
| `type` | `type` | Étiquette (`newsTypeLabels`) |
| `date` | `date` (ISO 8601 avec heure) | Jour monumental, mois et année, **en heure de Madagascar** (`lib/dates.ts`) |
| `rotaryYear` | `rotaryYear` | Métadonnée |
| `location` | `location?` | Métadonnée sous le titre |
| `summary` | `summary?` | Chapeau ; description de partage |
| `content` | `body?: string[]` | Texte |
| `photos[]` | `photos: Photo[]` | Grande photographie (la première) et marge (les suivantes) |

## Ajouts à `lib/dates.ts`

- `formatFullDate(isoDate)` : « 14 mars 2026 », en heure de Madagascar (actualité).
- `formatCalendarDate(isoDate)` : « 14 mars 2026 », en temps universel (date sans heure d'une action). `lib/dates.ts` reste le seul fichier qui porte un fuseau.

## États

| Cas | Résultat |
|---|---|
| Contenu publié | `200`, page de détail |
| `404` de l'API (non publié, supprimé, slug inconnu) | `notFound()` → page introuvable, statut `404` |
| Autre erreur de l'API | Version en cache si elle existe ; sinon frontière d'erreur du site |
