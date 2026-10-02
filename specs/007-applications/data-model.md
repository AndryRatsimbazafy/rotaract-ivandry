# Data Model: Candidatures (Applications)

Source : `ARCHITECTURE.md`, sections 1.6, 2, 3 et 8 ; décisions de la [spec](./spec.md).

## Application

Collection : `applications`.

| Champ | Type | Obligatoire | Exposé à l'administrateur | Règle |
|---|---|---|---|---|
| `_id` | ObjectId | oui | oui | Exposé en `id` (chaîne). |
| `firstName` | chaîne | oui | oui | 1 à 120 caractères, espaces de début et de fin retirés. |
| `lastName` | chaîne | oui | oui | 1 à 120 caractères, espaces de début et de fin retirés. |
| `email` | chaîne | oui | oui | Email valide, en minuscules, 254 caractères au plus. **Non unique.** |
| `phone` | chaîne | oui | oui | Chiffres, espaces, `+`, `-`, `.`, parenthèses ; au moins 8 chiffres. |
| `applicantStatus` | ApplicantStatus | oui | oui | `etudiant` ou `professionnel`. |
| `cv` | FileRef | oui | en partie | Voir ci-dessous. |
| `createdAt` | date | oui | oui | Posée automatiquement : la date de candidature. |

**Aucun champ** d'état de traitement, de note, de commentaire, d'affectation ni de date de modification. Le schéma ne garde que `createdAt` (pas de `updatedAt` : une candidature ne se modifie pas).

Aucune forme publique : aucune lecture publique n'existe.

Index : `createdAt` ; texte sur `firstName`, `lastName`, `email` (langue neutre). Aucun index unique.

## FileRef (CV)

Sous-document embarqué dans la candidature, sans identifiant propre.

| Champ | Type | Obligatoire | Exposé | Règle |
|---|---|---|---|---|
| `publicId` | chaîne | oui | **jamais** | Identifiant du fichier chez le fournisseur. Aléatoire, sans donnée du candidat. |
| `name` | chaîne | oui | oui | Nom d'origine, sans chemin, 255 caractères au plus. Sert à l'affichage et au téléchargement, jamais d'adresse. |
| `mimeType` | chaîne | oui | oui | Le type **constaté par l'API**, parmi trois valeurs (voir ci-dessous). |
| `size` | entier | oui | oui | Octets. 1 à 5 242 880. |

Aucune adresse (`url`) n'est enregistrée : le fichier n'a pas d'adresse publique. C'est l'écart P3 avec `ARCHITECTURE.md`, section 2 (alignement n° 2 du plan).

| Type accepté | `mimeType` |
|---|---|
| PDF | `application/pdf` |
| DOC | `application/msword` |
| DOCX | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |

## ApplicantStatus

Liste fermée de valeurs, sans collection.

| Valeur | Libellé |
|---|---|
| `etudiant` | Étudiant |
| `professionnel` | Professionnel |

Les libellés ne sont ni enregistrés ni renvoyés par l'API.

## Cycle de vie

```text
(dépôt public) ──► enregistrée ──(suppression par l'ADMIN)──► supprimée, fichier compris
```

Il n'existe aucun autre état ni aucune transition : pas de modification, pas d'état de traitement, pas de suppression automatique.

## Cohérence entre la base et le stockage

| Situation | Résultat |
|---|---|
| Dépôt refusé (validation, taille, type, fréquence) | Rien en base, rien au stockage. |
| Envoi au stockage en échec | Rien en base ; `503`. |
| Enregistrement en base en échec après l'envoi | Le fichier est retiré du stockage. |
| Suppression, stockage en échec | Candidature et fichier conservés ; `503`. |
| Suppression, fichier déjà absent | Candidature supprimée. |

## Relations

Aucune. Une candidature ne référence ni membre, ni année Rotary, ni administrateur. Les modèles existants ne sont pas modifiés.

## Stockage (hors base)

| Élément | Valeur |
|---|---|
| Fournisseur | Cloudinary, derrière `StorageService`. |
| Ressource | `raw` : le fichier d'origine, sans transformation. |
| Accès | `authenticated` : aucune adresse publique. |
| Identifiant | `candidatures/cv/<UUID aléatoire>`. |
| Conservation | Jusqu'à la suppression de la candidature par l'`ADMIN`. |
