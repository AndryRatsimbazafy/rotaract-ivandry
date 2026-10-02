# Data Model : Back Office

Le Back Office ne possède aucune donnée et ne crée aucune entité : il manipule les formes d'administration de l'API. Ce document fixe les types que `apps/admin/src/types/` déclarera et les quelques états propres à l'interface. Les contrats font foi ; en cas d'écart, c'est ce document qui est faux.

## Formes reçues de l'API

| Type | Champs | Contrat |
|---|---|---|
| `RotaryYear` | `id`, `startYear`, `label`, `startDate`, `endDate`, `isCurrent` | 002 |
| `YearRef` | `id`, `label` | 004 |
| `Member` | `id`, `firstName`, `lastName`, `occupation \| null`, `email \| null`, `phone \| null`, `createdAt`, `updatedAt` | 004 |
| `MemberWithMandates` | `Member` + `mandates: { id, rotaryYear: YearRef, roles, order }[]` | 004 |
| `Mandate` | `id`, `member` (identifiant), `rotaryYear: YearRef`, `roles: MemberRole[]`, `order`, `createdAt`, `updatedAt` | 004 |
| `Action` | `id`, `title`, `slug`, `summary \| null`, `description \| null`, `date`, `rotaryYear: YearRef`, `focusAreas: FocusArea[]`, `impact?`, `isPublished`, `publishedAt \| null`, `order \| null`, `createdAt`, `updatedAt` | 005 |
| `ActionImpact` | `objective?`, `beneficiaries?`, `location?`, `period?`, `partners?: string[]`, `results?` | 005 |
| `News` | `id`, `title`, `slug`, `type: NewsType`, `date`, `rotaryYear: YearRef`, `location \| null`, `summary \| null`, `content \| null`, `isPublished`, `publishedAt \| null`, `createdAt`, `updatedAt` | 006 |
| `Application` | `id`, `firstName`, `lastName`, `email`, `phone`, `applicantStatus`, `cv: { name, mimeType, size }`, `createdAt` | 007 |
| `Paginated<T>` | `data: T[]`, `meta: { page, limit, total, totalPages }` | 001 |
| `Listed<T>` | `data: T[]` | 001 |
| `Admin` | `id`, `email`, `role` | 003 |
| `ApiErrorBody` | `statusCode`, `error`, `message`, `details?: { field, message }[]` | 001 |

Les dates sont des chaînes ISO 8601 en temps universel. Aucun type ne porte de photographie, de portrait, ni de référence de stockage : l'API n'en renvoie pas.

## Valeurs fermées et libellés

Recopiés d'`ARCHITECTURE.md`, section 1, dans `lib/labels.ts`. La valeur technique n'est jamais affichée.

| Type | Valeurs | Libellés |
|---|---|---|
| `MemberRole` | dix valeurs | section 1.3 |
| `FocusArea` | sept valeurs | section 1.4 |
| `NewsType` | cinq valeurs | section 1.5 |
| `ApplicantStatus` | `etudiant`, `professionnel` | « Étudiant », « Professionnel » |

## Saisies envoyées à l'API

| Opération | Champs envoyés | Règle du Back Office |
|---|---|---|
| Créer une année | `startYear` (entier) | Converti en nombre : l'API refuse un texte |
| Créer un membre | `firstName`, `lastName`, + `occupation`, `email`, `phone` s'ils sont renseignés | Champ vide : non envoyé |
| Modifier un membre | les cinq champs | Champ vidé : `null` |
| Créer un mandat | `member`, `rotaryYear`, `roles` | Jamais `order` |
| Modifier un mandat | `roles` | Jamais `order`, `member`, `rotaryYear` |
| Réordonner une année | `rotaryYear`, `mandateIds` (tous, dans l'ordre) | |
| Créer une action | `title`, `date` (`AAAA-MM-JJ`), `rotaryYear`, + `slug`, `summary`, `description`, `focusAreas`, `impact`, `isPublished`, `order` s'ils sont renseignés | `impact` : seulement les rubriques renseignées ; omis si aucune |
| Modifier une action | les mêmes | Champ vidé : `null` (`summary`, `description`, `order`, `impact`) ; `slug` seulement s'il a changé |
| Créer une actualité | `title`, `type`, `date` (instant UTC), `rotaryYear`, + `slug`, `location`, `summary`, `content`, `isPublished` | `date` convertie depuis l'heure de Madagascar |
| Modifier une actualité | les mêmes | Champ vidé : `null` ; jamais de chaîne vide ; `slug` seulement s'il a changé |
| Publier, dépublier | `isPublished` | |

Jamais envoyés : `photos`, `portrait`, `publishedAt`, `order` d'un mandat, ni aucun champ hors contrat (l'API les refuse).

## États propres à l'interface

**Session** — un cookie, rien d'autre.

| Élément | Valeur |
|---|---|
| Nom | `rci_admin_session` |
| Contenu | le jeton reçu de `POST /auth/login` |
| Attributs | `httpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age` = `expiresIn` ; `Secure` (plan, P1) |
| Fin | expiration, déconnexion, ou `401` de l'API |

**État d'un formulaire** (`lib/form-state.ts`) — renvoyé par chaque Server Action.

| Champ | Rôle |
|---|---|
| `message?` | Message en tête : conflit, service indisponible, erreur générique |
| `fieldErrors?` | Message de l'API par champ, depuis `details` |
| `values` | Valeurs saisies, réaffichées après un échec |

**État d'une liste** — dans l'adresse, jamais ailleurs.

| Liste | Paramètres d'adresse | Paramètres de l'API |
|---|---|---|
| Membres | `q`, `annee`, `fonction`, `tri`, `page` | `q`, `year`, `role`, `sort`, `page` |
| Actions | `q`, `annee`, `domaine`, `publie`, `tri`, `page` | `q`, `year`, `focusArea`, `published`, `sort`, `page` |
| Actualités | `q`, `annee`, `type`, `publie`, `tri`, `page` | `q`, `year`, `type`, `published`, `sort`, `page` |
| Candidatures | `q`, `du`, `au`, `tri`, `page` | `q`, `from`, `to`, `sort`, `page` |
| Ordre des mandats | `annee` | `year` |

**Avis** — `?avis=` suivi d'un code d'une liste fermée (`cree`, `modifie`, `supprime`, `publie`, `depublie`, `ordre`) ; `?motif=expiree` sur la connexion ; `?cv=introuvable|indisponible` sur la fiche d'une candidature. Aucun texte libre ne transite par l'adresse.

## Transitions

- **Publication** (action, actualité) : brouillon ⇄ publié, par `isPublished`. `publishedAt` est géré par l'API ; le Back Office l'affiche.
- **Session** : absente → active (connexion) → absente (déconnexion, expiration, `401`).
- Aucun autre état : une candidature n'a pas d'état de traitement.
