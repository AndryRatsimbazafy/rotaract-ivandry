# Data Model: Réglages du site

## SiteSettings (collection `site_settings`)

Un seul document, d'identifiant fixe. Il n'existe pas tant que rien n'a été enregistré ; sa lecture renvoie alors l'état vide (research, R1).

| Champ | Type | Règle |
|---|---|---|
| `_id` | `string` | Toujours `"site"` |
| `social.facebook` | `string`, facultatif | `https://`, domaine Facebook (R4), 300 caractères au plus |
| `social.instagram` | `string`, facultatif | `https://`, domaine Instagram (R4), 300 caractères au plus |
| `club.foundedYear` | `number`, facultatif | Entier de 1968 à l'année en cours (temps universel) |
| `club.sponsorClub` | `string`, facultatif | 1 à 120 caractères, espaces de bord retirés |
| `club.memberCount` | `number`, facultatif | Entier de 1 à 999 |
| `club.meetingPlace` | `string`, facultatif | 1 à 160 caractères |
| `club.meetingRhythm` | `string`, facultatif | 1 à 160 caractères |
| `faq.<question>` | `string`, facultatif | 1 à 1000 caractères ; paragraphes séparés par une ligne vide. `<question>` ∈ `FaqQuestion` |
| `photos.<slot>` | `MediaRef`, facultatif | Image de 011 (adresse, `publicId`, dimensions, `alt` obligatoire, `caption`, `credit`, `focus`, métadonnées de fichier). `<slot>` ∈ `SitePhotoSlot` |
| `updatedAt` | `Date` | Horodatage Mongoose |

Un champ vide n'est pas stocké : une écriture à `null` retire le champ (`$unset`). Aucune chaîne vide n'est enregistrée.

### FaqQuestion (liste fermée, identique aux `id` de `apps/web/src/content/join.ts`)

| Valeur | Question | Peut rester vide |
|---|---|---|
| `qui` | Qui peut candidater ? | Oui |
| `rencontre` | Comment se déroule une première rencontre ? | Non |
| `sympathisant` | Qu'est-ce qu'un sympathisant ? | Non |
| `avant` | Peut-on participer aux actions avant de devenir membre ? | Non |
| `membre` | Comment devient-on officiellement membre ? | Non |
| `frequence` | À quelle fréquence le club se réunit-il ? | Oui |

« Non » : une écriture qui vide la réponse est refusée (`400`, research R3). Tant que la réponse n'a jamais été enregistrée, le Front Office affiche celle du code.

### SitePhotoSlot (liste fermée)

| Valeur | Page | Format | Largeur conseillée | Repli du Front Office |
|---|---|---|---|---|
| `accueil-ouverture` | Accueil | 16:9 ou plus large | 2400 px | Photographie livrée avec le site |
| `accueil-club` | Accueil, « Le club » | 4:5 | 1600 px | Gabarit |
| `accueil-rejoindre` | Accueil, appel « Nous rejoindre » | 4:5 | 1600 px | Gabarit |
| `actions-ouverture` | Actions, grande | 4:5 | 1600 px | Gabarit |
| `actions-detail` | Actions, détail | 3:2 | 1600 px | Gabarit |
| `membres-ouverture` | Membres | 2:1 | 2400 px | Gabarit |
| `rejoindre-ouverture` | Nous rejoindre | 4:5 | 1600 px | Ouverture de l'accueil en vigueur |

Stockage des fichiers : dossier `site/pages/` chez le fournisseur (`ImageFolder` `'pages'`).

## Vues

- **Vue d'administration** (`AdminSiteSettingsView`) : tous les champs présents ; `photos.<slot>` sous la forme `AdminImage` de 011 (`id`, `url`, dimensions, `alt`, `caption`, `credit`, `focus`, `name`, `mimeType`, `size`) ; `publicId` jamais renvoyé. `updatedAt` en ISO 8601, ou `null` si le document n'existe pas.
- **Vue publique** (`PublicSiteSettingsView`) : `social`, `club`, `faq` avec seulement les champs présents ; `photos.<slot>` sous la forme `PublicImage` de 011 (`url`, `width`, `height`, `alt`, `caption`, `credit`, `focus`). Ni `publicId`, ni nom, ni poids, ni `updatedAt`.

## Relations

Aucune. Les réglages ne référencent aucune autre entité et ne sont référencés par aucune.

## Transitions

Aucun état. Chaque champ passe de vide à renseigné et inversement ; une image d'emplacement passe de vide à occupée, est remplacée (l'ancien fichier est retiré après l'écriture) ou retirée (le fichier est retiré avant l'écriture ; stockage indisponible : rien ne change).
