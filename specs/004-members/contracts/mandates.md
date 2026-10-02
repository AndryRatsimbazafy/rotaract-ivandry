# Contrat : mandats

Référence : `ARCHITECTURE.md`, sections 1.3, 6, 8 et 13. Format d'erreur : `specs/001-api-foundation/contracts/errors.md`.

Toutes ces routes exigent un jeton valide et le rôle `ADMIN` : `401` « Authentification requise. », `403` « Accès refusé. ».

## Forme d'un mandat

```json
{
  "id": "66f0c1a2b3c4d5e6f7a8b9c2",
  "member": "66f0c1a2b3c4d5e6f7a8b9c1",
  "rotaryYear": { "id": "66f0c1a2b3c4d5e6f7a8b9c0", "label": "2026-2027" },
  "roles": ["secretaire", "protocole"],
  "order": 3,
  "createdAt": "2026-10-01T08:00:00.000Z",
  "updatedAt": "2026-10-01T08:00:00.000Z"
}
```

## GET /api/v1/admin/mandates

| Paramètre | Règle |
|---|---|
| `year` | Facultatif. Label `AAAA-AAAA`. |
| `member` | Facultatif. Identifiant d'un membre. |

**Réponse `200`** : `{ "data": [...] }`, sans pagination, de l'année la plus récente à la plus ancienne, puis par ordre. Année ou membre inconnus : `{ "data": [] }`.

**Erreurs** : `400` avec le détail, pour un label ou un identifiant mal formé.

## POST /api/v1/admin/mandates

**Corps**

```json
{ "member": "66f0c1a2b3c4d5e6f7a8b9c1", "rotaryYear": "66f0c1a2b3c4d5e6f7a8b9c0", "roles": ["secretaire", "protocole"] }
```

- `member` et `rotaryYear` : obligatoires, identifiants d'un membre et d'une année existants.
- `roles` : facultatif ; absent, il vaut un tableau vide.
- `order` : **non accepté**. Il est attribué par le système : plus grand ordre de l'année plus un, ou 1.

**Réponse `201`** : le mandat créé.

**Erreurs**

| Code | Situation | Corps |
|---|---|---|
| `400` | Champ absent, identifiant mal formé, fonction hors liste ou en double, champ non prévu (dont `order`) | « Données invalides. » avec le détail |
| `400` | Membre ou année inexistants | « Données invalides. » avec le détail sur `member` ou `rotaryYear` |
| `409` | Un mandat existe déjà pour ce membre et cette année | « Conflit avec une ressource existante. » |

## PATCH /api/v1/admin/mandates/:id

**Corps** : `roles`, `order`, ou les deux. `member` et `rotaryYear` ne sont pas modifiables.

- `roles` : remplace la liste des fonctions.
- `order` : entier supérieur ou égal à 1.

**Réponse `200`** : le mandat modifié.

**Erreurs**

| Code | Situation | Message |
|---|---|---|
| `400` | Identifiant de l'adresse mal formé | « Identifiant invalide. » |
| `400` | Fonction hors liste ou en double, ordre non entier ou inférieur à 1, champ non prévu | « Données invalides. » avec le détail |
| `404` | Mandat inexistant | « Ressource introuvable. » |
| `409` | Ordre déjà porté par un autre mandat de la même année | « Conflit avec une ressource existante. » |

## DELETE /api/v1/admin/mandates/:id

**Réponse `204`**, sans corps. Le membre et l'année ne sont pas touchés ; les autres mandats gardent leur ordre.

**Erreurs** : `400` « Identifiant invalide. » ; `404`.

## PUT /api/v1/admin/mandates/order

Réordonne tous les mandats d'une année.

**Corps**

```json
{ "rotaryYear": "66f0c1a2b3c4d5e6f7a8b9c0", "mandateIds": ["66f0c1a2b3c4d5e6f7a8b9c4", "66f0c1a2b3c4d5e6f7a8b9c2", "66f0c1a2b3c4d5e6f7a8b9c3"] }
```

- `rotaryYear` : identifiant d'une année existante.
- `mandateIds` : **exactement** tous les mandats de cette année, chacun une fois, dans l'ordre voulu.

**Réponse `200`** : `{ "data": [...] }`, les mandats de l'année dans leur nouvel ordre, numérotés de 1 à n.

**Erreurs**

| Code | Situation | Corps |
|---|---|---|
| `400` | Identifiant mal formé, champ absent, champ non prévu | « Données invalides. » avec le détail |
| `400` | Année inexistante | « Données invalides. » avec le détail sur `rotaryYear` |
| `400` | Liste incomplète, mandat cité deux fois, mandat d'une autre année ou inexistant | « Données invalides. » avec le détail sur `mandateIds` |

En cas d'erreur, aucun ordre n'est modifié. L'opération est indissociable : soit tous les ordres changent, soit aucun.

## Messages de validation

Validés le 2026-10-02. `message` : « Données invalides. » ; un élément de `details` par champ en erreur.

| Champ | Message |
|---|---|
| `member` (mal formé ou absent) | « Identifiant de membre invalide. » |
| `member` (inexistant) | « Ce membre n'existe pas. » |
| `rotaryYear` (mal formé ou absent) | « Identifiant d'année Rotary invalide. » |
| `rotaryYear` (inexistante) | « Cette année Rotary n'existe pas. » |
| `roles` | « Les fonctions doivent appartenir à la liste des fonctions du club, sans doublon. » |
| `order` | « L'ordre doit être un entier supérieur ou égal à 1. » |
| `mandateIds` | « La liste doit contenir tous les mandats de l'année, chacun une seule fois. » |
| `year` (filtre) | « L'année doit être au format AAAA-AAAA, avec deux années consécutives. » |
| champ non prévu | « Champ non autorisé. » |

## Suppression d'une année Rotary

`DELETE /api/v1/admin/rotary-years/:id` répond désormais `409` « Conflit avec une ressource existante. » quand au moins un mandat référence l'année. Le reste de son contrat (`specs/002-rotary-years/contracts/rotary-years.md`) est inchangé.
