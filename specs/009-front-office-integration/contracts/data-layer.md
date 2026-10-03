# Contrat : couche de données du Front Office

Les pages de `apps/web` ne lisent leurs données que par ces fonctions de `apps/web/src/data/`. Chacune appelle l'API depuis le serveur du site, avec une revalidation de 60 secondes, et **ne lève jamais d'erreur** : en cas d'échec elle renvoie sa valeur vide. Préfixe de l'API : `API_URL`, par exemple `http://localhost:4000/api/v1`. Champs et règles : les contrats de l'API, qui font foi.

Huit opérations de l'API. Aucune n'est ajoutée ; aucune route `/admin/*` n'est appelée.

## Années Rotary — `data/rotary-years.ts`

| Fonction | Opération | Renvoie | Valeur vide |
|---|---|---|---|
| `getCurrentRotaryYear()` | `GET /rotary-years` | Le libellé de l'année dont `isCurrent` est vrai | Le libellé de l'année du calendrier |

## Actions — `data/actions.ts`

| Fonction | Opération | Renvoie | Valeur vide |
|---|---|---|---|
| `getActions({ rotaryYear?, focusArea? })` | `GET /actions?year=&focusArea=&limit=100&page=n`, toutes les pages | Les actions publiées du filtre, dans l'ordre de l'API, **et l'indication que la liste est complète ou non** | Liste vide, complète |
| `getLatestActions(limit)` | `GET /actions?limit=<limit>` | Les premières actions dans l'ordre public | `[]` |
| `getActionYears()` | `GET /actions/years` | Les libellés des années qui ont une action publiée, de la plus récente à la plus ancienne | `[]` |
| `getActionCount()` | `GET /actions?limit=1` | `meta.total` | `0` |

`getImpactIndicators()` est supprimée.

## Actualités — `data/news.ts`

| Fonction | Opération | Renvoie | Valeur vide |
|---|---|---|---|
| `getNews({ type?, rotaryYear? })` | `GET /news?type=&year=&limit=100&page=n`, toutes les pages | Les actualités publiées du filtre, de la plus récente à la plus ancienne, **et l'indication que la liste est complète ou non** | Liste vide, complète |
| `getLatestNews(limit)` | `GET /news?limit=<limit>` | Les plus récentes | `[]` |
| `getNewsCount()` | `GET /news?limit=1` | `meta.total` | `0` |
| `getNewsArchives()` | `GET /news/archives` | `{ rotaryYear: libellé, count }[]` | `[]` |

## Membres — `data/members.ts`

| Fonction | Opération | Renvoie | Valeur vide |
|---|---|---|---|
| `getMembers(year)` | `GET /members?year=<libellé>` | Les membres de l'année, dans l'ordre du club, avec leurs fonctions de l'année | `[]` |
| `getMemberYears()` | `GET /members/years` | Les libellés des années qui ont au moins un membre | `[]` |
| `getFeaturedMembers(limit)` | `GET /members?limit=<limit>` | Les premiers membres de l'année en cours | `[]` |

`rolesForYear()` est supprimée : les fonctions sont portées par le membre.

## Candidature — `data/applications.ts`

| Fonction | Opération | Renvoie |
|---|---|---|
| `submitApplication(formData)` (Server Action) | `POST /applications`, `multipart/form-data`, sans cache | Le résultat typé de [application-form.md](./application-form.md) |

## Règles communes des lectures

| Sujet | Règle |
|---|---|
| Cache | Revalidation par durée, réglée à 60 (secondes), par adresse d'API ; la valeur est écrite une fois, dans `lib/api.ts`. Objectif de fraîcheur : environ 60 secondes, sans garantie à la seconde près. Une visite ne déclenche pas systématiquement une lecture. |
| Délai | 10 secondes par lecture. |
| Réponse autre que `200` | Traitée comme un échec : non mise en cache, valeur vide. Un `400` sur un filtre mal formé donne donc une liste vide. |
| Revalidation qui échoue | Elle ne remplace pas volontairement par un état vide un contenu déjà correctement mis en cache : l'entrée existante reste servie (comportement de Next.js), tant que le cache existe. |
| Lecture multi-pages | Page 1, puis les pages 2 à `totalPages` en parallèle ; assemblage dans l'ordre. Chaque page a sa propre entrée de cache. |
| Première page illisible, sans entrée en cache | Valeur vide : la page affiche son état de repli. |
| Page périmée dont la revalidation échoue | Sa dernière réponse correcte est servie : la liste est le dernier contenu complet lu. |
| Page suivante illisible, sans entrée en cache | Les éléments lus sont renvoyés avec l'indication **incomplète** ; la page le signale par une phrase unique et garde `meta.total` comme nombre. Jamais une liste vide, jamais un partiel présenté comme complet. |
| Journal | Aucune donnée n'est journalisée. |
| Navigateur | N'appelle jamais l'API ; ne reçoit ni son adresse ni une réponse brute. |

## Ce que le Front Office n'appelle pas

`GET /actions/:slug`, `GET /news/:slug` (le détail est déplié dans la liste), `GET /health`, toute route `/admin/*` et `/auth/*`.
