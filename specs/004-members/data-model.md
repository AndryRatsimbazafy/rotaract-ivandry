# Data Model: Membres et mandats

Source : `ARCHITECTURE.md`, sections 1.2, 1.3, 3 et 8 ; décisions de la [spec](./spec.md).

## Member

Collection : `members`.

| Champ | Type | Obligatoire | Public | Règle |
|---|---|---|---|---|
| `_id` | ObjectId | oui | oui | Exposé en `id` (chaîne). |
| `firstName` | chaîne | oui | oui | 1 à 120 caractères, espaces de début et de fin retirés. |
| `lastName` | chaîne | oui | oui | 1 à 120 caractères, espaces de début et de fin retirés. |
| `occupation` | chaîne | non | oui | Profession ou études. 1 à 120 caractères. |
| `email` | chaîne | non | **non** | Email valide, 254 caractères au plus, mis en minuscules. |
| `phone` | chaîne | non | **non** | Chiffres, espaces, `+`, `-`, `.`, parenthèses ; au moins 8 chiffres. |
| `createdAt`, `updatedAt` | date | oui | non | Gérés automatiquement. Exposés à l'administration seulement. |

Index : `(lastName, firstName)` ; texte sur `firstName`, `lastName`.

Règles :

- Aucun champ de fonction, aucun champ actif ou inactif, **aucun portrait** dans cette fonctionnalité.
- Aucune unicité : homonymes et emails en double sont permis.
- Un membre sans mandat existe dans l'administration et n'apparaît dans aucun annuaire.

## MemberMandate

Collection : `membermandates`.

| Champ | Type | Obligatoire | Règle |
|---|---|---|---|
| `_id` | ObjectId | oui | Exposé en `id`. |
| `member` | ObjectId → Member | oui | Membre existant. Non modifiable. |
| `rotaryYear` | ObjectId → RotaryYear | oui | Année existante. Non modifiable. Aucune donnée de l'année n'est recopiée. |
| `roles` | MemberRole[] | oui | Zéro, une ou plusieurs fonctions, sans doublon. Vide par défaut. |
| `order` | entier | oui | Supérieur ou égal à 1, **unique dans son année**. Attribué par le système à la création. |
| `createdAt`, `updatedAt` | date | oui | Gérés automatiquement. |

Index :

| Index | Rôle |
|---|---|
| **`(member, rotaryYear)` unique** | Un seul mandat par couple. |
| **`(rotaryYear, order)` unique** | Ordre strict dans l'année. Tri de l'annuaire. |
| `(rotaryYear, roles)` | Filtre par fonction. |

Règles de l'ordre :

- À la création : plus grand ordre de l'année plus un ; 1 pour le premier mandat de l'année. Jamais fourni par l'appelant.
- À la modification : un ordre déjà pris dans l'année est refusé (`409`).
- Les trous sont permis (après une suppression ou une modification).
- Le réordonnancement de l'année réécrit les ordres de 1 à n.
- Le même ordre peut exister dans deux années différentes.

## MemberRole

Liste fermée de valeurs, sans collection.

| Valeur | Libellé |
|---|---|
| `president` | Président |
| `vice-president` | Vice président |
| `tresorier` | Trésorier |
| `responsable-action` | Responsable action |
| `responsable-image-publique` | Responsable Image publique |
| `responsable-camaraderie` | Responsable camaraderie |
| `responsable-effectif` | Responsable effectif |
| `responsable-fondation` | Responsable fondation |
| `protocole` | Protocole |
| `secretaire` | Secrétaire |

Aucune hiérarchie entre elles. Une même fonction peut être tenue par plusieurs membres la même année. Les libellés ne sont pas enregistrés ni renvoyés par l'API.

## RotaryYear

Inchangée : `specs/002-rotary-years/data-model.md`. Désormais référencée par les mandats.

## Relations et intégrité

```text
Member 1 ──── 0..n MemberMandate n..0 ──── 1 RotaryYear
```

| Opération | Effet |
|---|---|
| Supprimer un membre | Ses mandats sont supprimés avec lui. Les années restent. |
| Supprimer un mandat | Seul le mandat disparaît. |
| Supprimer une année référencée par un mandat | Refusé, `409`. |
| Supprimer une année sans mandat | Acceptée. |
| Créer un mandat pour un membre ou une année inexistants | Refusé, `400`. |

L'intégrité est assurée par les services : MongoDB ne l'assure pas.
