# Research: Candidatures (Applications)

Phase 0 du plan. Chaque point donne la décision, sa raison et les alternatives écartées. Les arbitrages Q1 à Q9 et les précisions P1 à P5 de la [spec](./spec.md) ne sont pas rediscutés ici : ce document dit comment les réaliser.

## R1. Réception du fichier

- **Décision** : l'intercepteur de fichier de NestJS (`FileInterceptor`, fourni par `@nestjs/platform-express`, déjà installé avec `multer` 2.4), en mémoire, sur le seul champ `cv`. Limites posées à la réception : un fichier, 5 242 880 octets, un petit nombre de champs texte de taille bornée.
- **Raison** : mécanisme natif du framework (constitution, principe IV), sans dépendance. La mémoire suffit : 5 Mo au plus, 20 dépôts par heure. Rien n'est écrit sur le disque, donc rien à nettoyer après un refus.
- **Alternatives écartées** : écriture sur disque (fichiers temporaires à nettoyer) ; envoi direct du navigateur vers Cloudinary (interdit par Q1 : envoi côté serveur seulement).
- **Vérifié dans le code installé** : les types de `FileInterceptor` ne dépendent pas de `@types/multer`. Le fichier reçu est décrit par un type local (`originalname`, `mimetype`, `size`, `buffer`). **Aucune dépendance de types à ajouter.**

## R2. Messages des erreurs de réception

- **Constat** : NestJS convertit les erreurs de `multer` en exceptions HTTP avec un message anglais (« File too large », « Unexpected file field »). Le filtre commun ne remplace que les libellés standard du framework : ces deux messages passeraient tels quels.
- **Décision** : un intercepteur propre au module `applications`, qui enveloppe `FileInterceptor` et relance ces erreurs sans message (`413`) ou avec le message français du contrat (`400`). Le filtre fournit alors « Contenu trop volumineux. ».
- **Raison** : ne pas modifier le filtre du socle pour un besoin d'un seul module.
- **Alternative écartée** : étendre `isFrameworkMessage` dans le filtre (modifie le socle validé).

## R3. Vérification du contenu du fichier

- **Décision** : lecture des premiers octets, sans bibliothèque.

| Type | Signature | Type enregistré | Extensions admises |
|---|---|---|---|
| PDF | commence par `%PDF-` | `application/pdf` | `.pdf` |
| DOC | commence par `D0 CF 11 E0 A1 B1 1A E1` | `application/msword` | `.doc` |
| DOCX | archive ZIP (`PK 03 04`) contenant l'entrée `word/document.xml` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `.docx` |

- L'extension du nom d'origine doit correspondre au type constaté, sans tenir compte de la casse ; sinon `415`. Le type annoncé par le client n'est pas utilisé.
- **Raison** : trois signatures stables, quelques lignes de code. La présence de `word/document.xml` distingue un DOCX d'une autre archive (XLSX, ZIP quelconque) ; les noms d'entrées d'une archive ZIP y figurent en clair.
- **Limite acceptée** (dans la spec) : la signature DOC est celle de tous les anciens documents Office.
- **Alternative écartée** : la bibliothèque `file-type` (dépendance de plus, et elle ne distingue pas mieux un DOC).

## R4. Fournisseur : dépendance

- **Décision** : le client officiel `cloudinary` (2.11 à ce jour, une seule dépendance transitive, `lodash`), installé dans `apps/api` seulement. **C'est l'unique dépendance nouvelle.**
- **Raison** : signature des appels, envoi par flux et génération des accès signés sont fournis et maintenus par l'éditeur.
- **Alternative écartée** : appels HTTP signés écrits à la main (zéro dépendance, mais la signature et le multipart d'envoi seraient à écrire et à maintenir ; risque d'erreur sur un point de sécurité).

## R5. Envoi, lecture et suppression chez Cloudinary

- **Envoi** : envoi par flux depuis la mémoire, ressource `raw`, type `authenticated`, identifiant fourni par l'API, sans écrasement. L'appel est signé par le client à partir du secret : c'est un envoi authentifié, pas un préréglage non signé.
- **Identifiant** : `candidatures/cv/<UUID aléatoire>`, généré par `crypto.randomUUID()`. Aucune donnée du candidat.
- **Lecture** : l'API génère une adresse de téléchargement signée, à durée de vie courte (60 secondes), la consomme elle-même avec le `fetch` de Node 22 et renvoie le contenu. L'adresse ne quitte jamais le serveur et n'est pas journalisée.
- **Suppression** : destruction de la ressource par son identifiant, avec invalidation. Réponse « introuvable » : traitée comme un succès.
- **Délai** : chaque appel au fournisseur est borné (10 secondes) ; au-delà, erreur de stockage.

**Deux points à confirmer par la première tâche de stockage, avant d'écrire le reste** (je ne peux pas les vérifier sans compte) :

1. La forme exacte de l'adresse de téléchargement signée pour une ressource `raw` de type `authenticated`. Si elle ne convient pas, repli sur une adresse de livraison signée, consommée de la même façon côté serveur. Le contrat de l'API ne change dans aucun des deux cas.
2. Les comptes gratuits de Cloudinary peuvent bloquer par défaut la livraison de fichiers PDF (réglage de sécurité du compte). Si la lecture d'un CV PDF est refusée, le porteur du projet active ce réglage dans la console ; cela n'ouvre aucun accès public, la ressource restant de type `authenticated`.

## R6. Abstraction StorageService

- **Décision** : dans `media/`, une classe abstraite `StorageService` (sert de jeton d'injection) avec trois opérations — envoyer, lire, supprimer — et une erreur propre, `StorageError`. Une implémentation, `CloudinaryStorageService`. `MediaModule` lie l'une à l'autre et exporte la seule abstraction.
- **Raison** : c'est l'abstraction décidée par `ARCHITECTURE.md`, section 2. Le module `applications` n'importe rien de Cloudinary ; le mot n'y apparaît pas.
- L'interface ne porte que ce que le CV demande. Rien n'est prévu d'avance pour les images (pas d'abstraction prématurée).
- **Alternative écartée** : une méthode `signedUrl` remise à l'appelant (Q7 : l'API renvoie le fichier).

## R7. Ordre des opérations et cohérence

| Opération | Ordre | En cas d'échec |
|---|---|---|
| Dépôt | limite de fréquence → réception (taille) → champs → présence du CV → type → envoi au stockage → enregistrement en base | Échec de l'envoi : `503`, rien en base. Échec de la base après l'envoi : suppression du fichier, puis l'erreur d'origine. Si cette suppression échoue aussi : l'identifiant du fichier orphelin est journalisé (il ne contient aucune donnée personnelle). |
| Suppression | stockage, puis base | Stockage indisponible ou erreur autre qu'une absence : `503`, candidature conservée. Fichier déjà absent : considéré comme supprimé, la candidature est supprimée, `204` ; le fait et l'identifiant de la candidature sont journalisés. |
| Lecture du CV | base, puis stockage | Fichier absent : `404`. Stockage en erreur : `503`. |

- **Raison** : aucun fichier n'est envoyé avant que tout soit validé ; la suppression commence par le fichier pour ne jamais laisser un CV sans candidature. Le cas inverse (candidature sans fichier, si la base échoue après la suppression du fichier) se répare en relançant la suppression.
- Il n'existe pas de transaction entre la base et le fournisseur : la compensation est explicite, et son échec est journalisé, pas ignoré.

## R8. Limitation de fréquence

- **Décision** : `ThrottlerGuard` sur la seule route de dépôt, avec `@Throttle` pour remplacer le réglage par défaut : 20 demandes par 3 600 000 ms. Le réglage global (5 par minute) et la route de connexion ne sont pas modifiés.
- **Raison** : c'est le fonctionnement existant, route par route, sans garde globale. Le compteur est tenu par route : celui du dépôt et celui de la connexion ne se mélangent pas. La garde s'exécute avant l'intercepteur de fichier : une demande refusée n'est pas lue.
- Compteur en mémoire, par adresse IP vue par l'API ; il repart de zéro au redémarrage.

## R9. Configuration

- **Décision** : `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, ajoutées à la validation existante (`config/env.validation.ts`) et à `AppConfig`, obligatoires. `.env.example` reçoit les trois noms, sans valeur.
- **Raison** : même règle que `MONGODB_URI` et `JWT_SECRET` (`ARCHITECTURE.md`, section 12 : une variable obligatoire absente arrête le démarrage).
- **Conséquence à connaître** : après cette fonctionnalité, l'API ne démarre plus sans compte Cloudinary.
- **Alternative écartée** : la variable unique `CLOUDINARY_URL`, lue implicitement par le client (échappe à la validation du projet et place le secret dans une adresse).

## R10. Journalisation

- Le service de stockage ne journalise que le type d'une erreur, jamais son message ni l'adresse appelée (qui contient la clé d'API).
- Aucun champ de la candidature n'est journalisé. Le filtre commun ne journalise déjà que le type et la trace des erreurs internes.

## R11. Liste d'administration

- Recherche par l'index texte (`firstName`, `lastName`, `email`), langue neutre, comme les membres : mots entiers.
- Tri : `createdAt`, `-createdAt`, `lastName`, `-lastName`, puis identifiant pour une pagination stable.
- Période : `from` et `to` convertis en instants ; une date sans heure donne le début (`from`) ou la fin (`to`) de la journée en temps universel.

## R12. Renvoi du fichier

- `StreamableFile` de NestJS, avec `Content-Type` (le type constaté au dépôt), `Content-Length`, `Content-Disposition: attachment` portant le nom d'origine (forme ASCII de repli et forme encodée UTF-8), et `Cache-Control: no-store`. `X-Content-Type-Options: nosniff` est déjà posé par le socle.
- Le fichier est toujours proposé en téléchargement, jamais affiché en ligne.
