# Data Model : intégration du Front Office avec l'API

Le Front Office ne possède aucune donnée. Ce document fixe ce qu'il lit de l'API et les types que ses composants reçoivent. Les contrats de l'API font foi ; en cas d'écart, c'est ce document qui est faux.

## Formes publiques lues (API)

| Forme | Champs | Contrat |
|---|---|---|
| Année Rotary | `id`, `startYear`, `label`, `startDate`, `endDate`, `isCurrent` | 002 |
| Membre d'une année | `id`, `firstName`, `lastName`, `occupation?`, `rotaryYear` (libellé), `roles[]`, `order` | 004 |
| Action | `id`, `slug`, `title`, `summary?`, `description?`, `date`, `rotaryYear` (libellé), `focusAreas[]`, `impact?` | 005 |
| Impact | `objective?`, `beneficiaries?`, `location?`, `period?`, `partners?[]`, `results?` | 005 |
| Actualité | `id`, `slug`, `title`, `type`, `date`, `rotaryYear` (libellé), `location?`, `summary?`, `content?` | 006 |
| Archive | `rotaryYear` (année Rotary), `count` | 006 |
| Liste paginée | `data[]`, `meta: { page, limit, total, totalPages }` | 001 |
| Liste simple | `data[]` | 001 |
| Erreur | `statusCode`, `error`, `message`, `details?[{ field, message }]` | 001 |

Un champ facultatif vide est absent de la réponse. Aucune forme ne porte de photographie, de portrait, d'email, de téléphone, d'état de publication ni de référence de stockage.

## Types du Front Office (`apps/web/src/types/`)

| Type | Avant | Après | Origine de la valeur |
|---|---|---|---|
| `RotaryYear` | libellé `"2026-2027"` | inchangé | `label` |
| `Action.focusArea?: string` | un domaine | **`focusAreas: string[]`** | `focusAreas` |
| `Action.description?` | absent | **ajouté** : paragraphes (`string[]`) | `description`, découpée sur les lignes vides |
| `Action.date` | absent | **ajouté** (chaîne ISO) | `date` — non affichée |
| `Action.rotaryYear` | libellé | inchangé | `rotaryYear` |
| `Action.photos` | tableau | inchangé, **toujours vide** | fourni par la couche de données |
| `Action.impact?` | six rubriques facultatives | inchangé | `impact` |
| `ImpactIndicator` | ligne du registre | **supprimé** | — |
| `NewsItem.body?: string[]` | paragraphes | inchangé | `content`, découpé sur les lignes vides |
| `NewsItem.rotaryYear` | absent (déduit de la date) | **ajouté** | `rotaryYear` |
| `NewsItem.date` | chaîne ISO | inchangé | `date` (instant UTC) |
| `NewsItem.photos` | tableau | inchangé, **toujours vide** | fourni par la couche de données |
| `Member.mandates[]` | une entrée par année | **supprimé** | — |
| `Member.roles` | absent | **ajouté** : fonctions de l'année demandée | `roles` |
| `Member.order` | absent | **ajouté** | `order` |
| `Member.isDemo?` | profil fictif | **supprimé** | — |
| `Member.portrait?` | photographie | inchangé, **toujours absent** | — |
| `MembershipApplication.status` | situation | **`applicantStatus`** | — (envoi) |

`MemberRole`, `NewsType`, `ActionImpact`, `ApplicantStatus` et `Photo` ne changent pas.

## Conversions faites par la couche de données

| Conversion | Règle |
|---|---|
| Texte long → paragraphes | Découpage sur une ou plusieurs lignes vides ; paragraphes vides retirés. Sert au contenu d'une actualité et à la description d'une action. |
| Photographies | `photos: []` pour chaque action et chaque actualité : l'API n'en fournit pas. |
| Année en cours | L'année dont `isCurrent` est vrai ; à défaut le libellé de l'année du calendrier. |
| Filtres d'adresse | `annee` → `year`, `domaine` → `focusArea`, `rubrique` → `type`. |
| Liste longue | Pages de 100 assemblées dans l'ordre de l'API, avec l'indication « complète » ou « incomplète » (plan, B4). |
| Échec de lecture | Valeur vide de la fonction : liste vide, 0, aucune année. |

Aucune conversion n'invente de valeur : un champ absent reste absent.

## Dates

| Donnée | Affichage | Fuseau |
|---|---|---|
| Date d'une actualité | Jour et mois ; regroupement par mois ; jamais l'heure | Madagascar |
| Date d'une action | Non affichée | — |
| Bornes d'une année Rotary | Non affichées | — |

## Résultat d'un envoi de candidature

Type renvoyé par la Server Action au formulaire ; aucun corps de réponse de l'API n'atteint le navigateur.

| Issue | Contenu |
|---|---|
| Acceptée | rien d'autre que le fait |
| Refus par champ | un message par champ (`firstName`, `lastName`, `email`, `phone`, `applicantStatus`, `cv`) |
| Refus d'ensemble | un motif parmi : trop de demandes, service indisponible |

## Transitions

Aucune. Le site lit des contenus publiés et envoie une candidature ; il ne conserve aucun état.
