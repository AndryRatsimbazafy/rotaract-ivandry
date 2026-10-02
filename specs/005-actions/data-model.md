# Data Model: Actions

Source : `ARCHITECTURE.md`, sections 1.4, 3 et 8 ; décisions de la [spec](./spec.md).

## Action

Collection : `actions`.

| Champ | Type | Obligatoire | Public | Règle |
|---|---|---|---|---|
| `_id` | ObjectId | oui | oui | Exposé en `id` (chaîne). |
| `title` | chaîne | oui | oui | 1 à 120 caractères, espaces de début et de fin retirés. |
| `slug` | chaîne | oui | oui | **Unique.** `^[a-z0-9]+(-[a-z0-9]+)*$`, 120 caractères au plus. Généré depuis le titre s'il n'est pas fourni. |
| `summary` | chaîne | non | oui | 1 à 500 caractères. |
| `description` | chaîne | non | oui | Texte brut, paragraphes séparés par une ligne vide. 1 à 20 000 caractères. |
| `date` | date | oui | oui | ISO 8601. Date de l'action, ou de son début. |
| `rotaryYear` | ObjectId → RotaryYear | oui | oui (label) | Année existante, choisie par l'administrateur, modifiable. Jamais déduite de la date. |
| `focusAreas` | FocusArea[] | oui | oui | Zéro, un ou plusieurs domaines, sans doublon. Vide par défaut. |
| `impact` | ActionImpact | non | oui | Absent quand aucune rubrique n'est renseignée. |
| `isPublished` | booléen | oui | non | Faux par défaut. |
| `publishedAt` | date | non | non | Posé à la première publication, jamais modifié ensuite. Jamais fourni par l'appelant. |
| `order` | entier | non | non | Supérieur ou égal à 1. Global, doublons permis. |
| `createdAt`, `updatedAt` | date | oui | non | Gérés automatiquement. |

**Aucun champ `photos`** dans cette fonctionnalité.

Index : `slug` unique ; `(isPublished, date)` ; `(rotaryYear, isPublished)` ; `focusAreas` ; texte sur `title`, `summary`.

### Règles du slug

- Sans slug fourni à la création : généré depuis le titre (sans accents, minuscules, mots séparés par des tirets) ; en cas de collision, suffixe `-2`, puis `-3`.
- Slug fourni : écrit tel quel ; déjà pris, `409`.
- Modifier le titre ne change pas le slug.
- Un titre dont aucun slug ne peut être tiré, sans slug fourni : `400`.
- `years` est réservé à la route `/actions/years` : la génération automatique donne `years-2`, puis `years-3` ; fourni explicitement, il est refusé (`400`).

### États de publication

```text
brouillon ──publier──► publié ──dépublier──► brouillon ──publier──► publié
```

| Transition | Effet sur `publishedAt` |
|---|---|
| Création en brouillon | Absent. |
| Création directement publiée | Instant de la création. |
| Première publication | Instant de la publication. |
| Dépublication | Conservé. |
| Republication | Conservé. |

Seules les actions publiées sont visibles du public.

### Effacement

`null` efface `summary`, `description`, `order` et `impact`. `title`, `slug`, `date`, `rotaryYear` et `focusAreas` ne s'effacent pas. Une chaîne vide est refusée.

## ActionImpact

Sous-document embarqué dans l'action, sans identifiant propre.

| Rubrique | Type | Règle |
|---|---|---|
| `objective` | chaîne | 1 à 500 caractères. |
| `beneficiaries` | chaîne | 1 à 500 caractères. |
| `location` | chaîne | 1 à 500 caractères. |
| `period` | chaîne | 1 à 500 caractères. |
| `partners` | chaîne[] | 20 éléments au plus, chacun de 1 à 120 caractères. |
| `results` | chaîne | 1 à 500 caractères. |

- Toutes les rubriques sont facultatives ; aucune n'est estimée ni remplie par défaut.
- Seules les rubriques fournies sont enregistrées et renvoyées.
- Un impact envoyé remplace l'objet entier : pas de fusion rubrique par rubrique.
- Un impact sans aucune rubrique n'est pas enregistré.

## FocusArea

Liste fermée de valeurs, sans collection.

| Valeur | Libellé |
|---|---|
| `paix` | Construction de paix et prévention des conflits |
| `maladies` | Prévention et traitement des maladies |
| `eau` | Eau, assainissement et hygiène |
| `sante` | Santé des mères et des enfants |
| `education` | Alphabétisation et éducation de base |
| `economie` | Développement économique local |
| `environnement` | Environnement |

Les libellés ne sont pas enregistrés ni renvoyés par l'API.

## RotaryYear

Inchangée. Désormais référencée par les mandats et par les actions.

## Relations et intégrité

```text
Action n..0 ──── 1 RotaryYear
```

| Opération | Effet |
|---|---|
| Supprimer une action | Seule l'action disparaît. |
| Supprimer une année référencée par une action, publiée ou non | Refusé, `409`. |
| Créer ou modifier une action avec une année inexistante | Refusé, `400`. |

## Tri public

1. Les actions qui ont un `order`, par `order` croissant.
2. Puis par `date` décroissante (à ordre égal, et pour celles qui n'ont pas d'ordre).
3. Puis par identifiant, pour une pagination stable.
