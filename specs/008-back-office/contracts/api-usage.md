# Contrat : opérations de l'API consommées par le Back Office

Le Back Office appelle **uniquement** les opérations ci-dessous, depuis son serveur, avec `Authorization: Bearer <jeton>` (sauf la connexion). Préfixe : `API_URL`, par exemple `http://localhost:4000/api/v1`. Champs, règles, codes et messages : les contrats cités, qui font foi.

29 opérations. Aucune n'est ajoutée à l'API ; aucune route publique de contenu n'est appelée.

## Authentification — `specs/003-admin-auth/contracts/auth.md`

| Opération | Écran | Réponses traitées |
|---|---|---|
| `POST /auth/login` | `/connexion` | `200` → cookie ; `400` → message sous le champ ; `401` → « Email ou mot de passe incorrect. » ; `429` → message de l'API |
| `GET /auth/me` | layout de l'espace protégé | `200` → compte affiché ; `401` → fin de session |

## Années Rotary — `specs/002-rotary-years/contracts/rotary-years.md`

| Opération | Écran | Réponses traitées |
|---|---|---|
| `GET /admin/rotary-years` | `/annees` ; listes déroulantes et filtres d'année des autres écrans | `200` |
| `POST /admin/rotary-years` | `/annees` | `201` ; `400` → sous le champ ; `409` → « Cette année Rotary existe déjà. » |
| `DELETE /admin/rotary-years/:id` | `/annees` | `204` ; `404` ; `409` → message d'année utilisée |

## Membres — `specs/004-members/contracts/members.md`

| Opération | Écran | Paramètres utilisés |
|---|---|---|
| `GET /admin/members` | `/membres` ; `/membres/ordre` (noms) | `page`, `limit`, `q`, `year`, `role`, `sort` (`lastName`, `-lastName`, `createdAt`, `-createdAt`) |
| `GET /admin/members/:id` | `/membres/[id]` | |
| `POST /admin/members` | `/membres/nouveau` | |
| `PATCH /admin/members/:id` | `/membres/[id]` | `null` pour effacer `occupation`, `email`, `phone` |
| `DELETE /admin/members/:id` | `/membres`, `/membres/[id]` | |

## Mandats — `specs/004-members/contracts/mandates.md`

| Opération | Écran | Remarque |
|---|---|---|
| `GET /admin/mandates` | `/membres/ordre` | `year` |
| `POST /admin/mandates` | `/membres/[id]` | `member`, `rotaryYear`, `roles` ; `409` → mandat déjà existant |
| `PATCH /admin/mandates/:id` | `/membres/[id]` | `roles` seulement ; `order` n'est jamais envoyé |
| `DELETE /admin/mandates/:id` | `/membres/[id]` | |
| `PUT /admin/mandates/order` | `/membres/ordre` | `rotaryYear`, `mandateIds` complets ; `400` sur `mandateIds` → liste à recharger |

## Actions — `specs/005-actions/contracts/actions.md`

| Opération | Écran | Paramètres utilisés |
|---|---|---|
| `GET /admin/actions` | `/actions` | `page`, `limit`, `q`, `year`, `focusArea`, `published`, `sort` (`date`, `title`, `createdAt`, dans les deux sens) |
| `GET /admin/actions/:id` | `/actions/[id]` | |
| `POST /admin/actions` | `/actions/nouvelle` | `409` → slug déjà utilisé |
| `PATCH /admin/actions/:id` | `/actions/[id]` ; publication depuis `/actions` | `null` pour effacer `summary`, `description`, `order`, `impact` |
| `DELETE /admin/actions/:id` | `/actions`, `/actions/[id]` | |

## Actualités — `specs/006-news/contracts/news.md`

| Opération | Écran | Paramètres utilisés |
|---|---|---|
| `GET /admin/news` | `/actualites` | `page`, `limit`, `q`, `year`, `type`, `published`, `sort` (`date`, `title`, `createdAt`, dans les deux sens) |
| `GET /admin/news/:id` | `/actualites/[id]` | |
| `POST /admin/news` | `/actualites/nouvelle` | `date` : instant UTC ; `409` → slug déjà utilisé |
| `PATCH /admin/news/:id` | `/actualites/[id]` ; publication depuis `/actualites` | `null` pour effacer `location`, `summary`, `content` |
| `DELETE /admin/news/:id` | `/actualites`, `/actualites/[id]` | |

## Candidatures — `specs/007-applications/contracts/applications.md`

| Opération | Écran | Remarque |
|---|---|---|
| `GET /admin/applications` | `/candidatures` | `page`, `limit`, `q`, `from`, `to`, `sort` (`createdAt`, `lastName`, dans les deux sens). **Aucun autre paramètre** : pas de filtre par situation |
| `GET /admin/applications/:id` | `/candidatures/[id]` | |
| `GET /admin/applications/:id/cv` | `/candidatures/[id]/cv` | Flux relayé avec `Content-Type`, `Content-Length`, `Content-Disposition`, `Cache-Control` ; `404` → fichier introuvable ; `503` → service indisponible |
| `DELETE /admin/applications/:id` | `/candidatures/[id]` | `204` (fichier présent ou déjà absent) ; `503` → candidature conservée |

## Ce que le Back Office n'appelle pas

- Les lectures publiques (`/rotary-years`, `/members`, `/actions`, `/news`, leurs variantes), `POST /applications`, `GET /health`.
- `PATCH /admin/mandates/:id` avec `order`.
- Toute opération de média (`/admin/media`) : inexistante à ce jour.

## Traitement commun des réponses

| Code | Traitement |
|---|---|
| `401` | Fin de session, retour à `/connexion?motif=expiree` |
| `403` | `/acces-refuse` |
| `404`, `400` « Identifiant invalide. » | Page « introuvable », ou retour à la liste avec le message |
| `400` avec `details` | Messages sous les champs |
| `409` | Message en tête, précisé selon l'opération |
| `503` | Message de l'API, nouvel essai possible |
| réseau, délai, `5xx` | Message générique, saisie conservée |
