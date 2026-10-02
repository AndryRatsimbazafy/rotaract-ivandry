# Data Model: Actualités (News)

Source : `ARCHITECTURE.md`, sections 1.5, 3 et 8 ; décisions de la [spec](./spec.md).

## News

Collection : `news`.

| Champ | Type | Obligatoire | Public | Règle |
|---|---|---|---|---|
| `_id` | ObjectId | oui | oui | Exposé en `id` (chaîne). |
| `title` | chaîne | oui | oui | 1 à 120 caractères, espaces de début et de fin retirés. |
| `slug` | chaîne | oui | oui | **Unique parmi les actualités.** `^[a-z0-9]+(-[a-z0-9]+)*$`, 120 caractères au plus. Généré depuis le titre s'il n'est pas fourni. |
| `type` | NewsType | oui | oui | Une des cinq valeurs. Modifiable. |
| `date` | date | oui | oui | ISO 8601. Un seul champ de date et heure. |
| `rotaryYear` | ObjectId → RotaryYear | oui | oui (label) | Année existante, choisie par l'administrateur, modifiable. Jamais déduite de la date. |
| `location` | chaîne | non | oui | 1 à 120 caractères. |
| `summary` | chaîne | non | oui | 1 à 500 caractères. |
| `content` | chaîne | non | oui | Texte brut, paragraphes séparés par une ligne vide. 1 à 20 000 caractères. |
| `isPublished` | booléen | oui | non | Faux par défaut. |
| `publishedAt` | date | non | non | Posé à la première publication, jamais modifié ensuite. Jamais fourni par l'appelant. |
| `createdAt`, `updatedAt` | date | oui | non | Gérés automatiquement. |

**Aucun champ** `photos`, d'impact, de domaine, d'ordre, de mise en avant, d'heure séparée ni de date de fin.

Index : `slug` unique ; `(isPublished, date)` ; `(rotaryYear, isPublished)` ; `type` ; texte sur `title`, `summary`.

### Règles du slug

- Sans slug fourni à la création : généré depuis le titre (sans accents, minuscules, mots séparés par des tirets) ; en cas de collision, suffixe `-2`, puis `-3`.
- Slug fourni : écrit tel quel ; déjà pris, `409`.
- Modifier le titre ne change pas le slug.
- Un titre dont aucun slug ne peut être tiré, sans slug fourni : `400`.
- `archives` est réservé à la route `/news/archives` : la génération automatique donne `archives-2`, puis `archives-3` ; fourni explicitement, il est refusé (`400`).
- L'unicité vaut parmi les actualités : une action peut porter le même slug.

### États de publication

```text
brouillon ──publier──► publié ──dépublier──► brouillon ──publier──► publié
```

| Transition | Effet sur `publishedAt` |
|---|---|
| Création en brouillon | Absent. |
| Création directement publiée | Le même instant que `createdAt`. |
| Première publication | Instant de la publication. |
| Dépublication | Conservé. |
| Republication | Conservé. |

Il n'existe que ces deux états. Seules les actualités publiées sont visibles du public.

### Champs facultatifs

| Demande | Effet |
|---|---|
| Champ absent, à la création | Non enregistré. |
| Champ absent, à la modification | Inchangé. |
| `null`, à la modification | Effacé (`location`, `summary`, `content`). |
| Chaîne vide | Refusée, `400`. |

`title`, `slug`, `type`, `date` et `rotaryYear` ne s'effacent pas.

## NewsType

Liste fermée de valeurs, sans collection.

| Valeur | Libellé |
|---|---|
| `evenement` | Événement |
| `participation` | Participation |
| `reunion` | Réunion |
| `formation` | Formation |
| `annonce` | Annonce |

Les libellés ne sont pas enregistrés ni renvoyés par l'API.

## RotaryYear

Inchangée. Désormais référencée par les mandats, les actions et les actualités.

## Relations et intégrité

```text
News n..0 ──── 1 RotaryYear
```

| Opération | Effet |
|---|---|
| Supprimer une actualité | Seule l'actualité disparaît. |
| Supprimer une année référencée par une actualité, publiée ou non | Refusé, `409`. |
| Créer ou modifier une actualité avec une année inexistante | Refusé, `400`. |

## Tris

- Public : `date` décroissante, puis identifiant.
- Administration : `date`, `title` ou `createdAt`, dans les deux sens ; `-date` par défaut.

## Entrée d'archives

Non stockée : calculée à la lecture.

| Champ | Contenu |
|---|---|
| `rotaryYear` | Une année Rotary, dans la forme de `/rotary-years`. |
| `count` | Le nombre d'actualités **publiées** rattachées à cette année. |
