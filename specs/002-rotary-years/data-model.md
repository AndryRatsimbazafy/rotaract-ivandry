# Data Model: Années Rotary (RotaryYear)

Source : `ARCHITECTURE.md`, sections 1.1 et 3. Une seule entité, une seule collection.

## RotaryYear

Collection : `rotaryyears`.

### Enregistré

| Champ | Type | Obligatoire | Notes |
|---|---|---|---|
| `_id` | ObjectId | oui | Exposé en `id` (chaîne). |
| `startYear` | nombre | oui | L'année de début, par exemple `2026`. **Unique.** Identifie l'année Rotary. |
| `createdAt` | date | oui | Géré automatiquement. Non exposé. |
| `updatedAt` | date | oui | Géré automatiquement. Non exposé. |

### Index

| Index | Rôle |
|---|---|
| `startYear` unique | Garantit qu'il n'existe qu'une année par année de début, y compris pour deux écritures simultanées. Sert aussi au tri de la liste. |

### Calculé, jamais enregistré

| Champ | Valeur pour `startYear = 2026` | Règle |
|---|---|---|
| `label` | `"2026-2027"` | `startYear`, un tiret, `startYear + 1`. |
| `startDate` | `2026-07-01T00:00:00.000Z` | 1er juillet de `startYear`, 00:00:00.000 UTC. |
| `endDate` | `2027-06-30T23:59:59.999Z` | 30 juin de `startYear + 1`, 23:59:59.999 UTC. |
| `isCurrent` | selon l'instant | Vrai si l'instant de la demande est entre `startDate` et `endDate`, bornes incluses. |

### Règles

- Aucun indicateur « courant » n'est stocké : au plus une année est courante à un instant donné, et il peut n'y en avoir aucune.
- Aucune année n'est créée par le code : ni au démarrage, ni d'avance, ni comme exemple.
- Aucune continuité n'est exigée entre les années.
- Une année ne se modifie pas : il n'y a pas de transition d'état.
- Règles d'entrée de `startYear` (entier JSON de 2000 à 2100) : elles s'appliquent à la création, livrée au temps 2. Elles ne sont pas répétées dans le schéma.

### Relations

Aucune au temps 1. Plus tard, MemberMandate, Action et News porteront une référence vers RotaryYear ; une année référencée ne pourra pas être supprimée. Ces relations sont créées par leurs fonctionnalités.

### Insertion manuelle pour la vérification

Un document inséré à la main dans Atlas n'a besoin que de `startYear`, en nombre : `{ "startYear": 2026 }`. `createdAt` et `updatedAt` sont alors absents, sans effet sur la liste. Une valeur en texte (`"2026"`) n'est pas une année valide et ne doit pas être insérée.
