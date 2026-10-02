# Feature Specification: Candidatures (Applications)

**Feature Branch**: `007-applications`

**Created**: 2026-10-02

**Status**: Validée le 2026-10-02 (Q1 à Q9, P1 à P5)

**Input**: User description: « Feature 007 — Applications / Rejoindre. Le Back Office doit permettre de gérer les candidatures provenant de la page publique « Rejoindre », et l'API doit fournir le socle nécessaire. Couvrir le formulaire public ; champs prénom, nom, email, téléphone, étudiant ou professionnel, CV ; pas de workflow de statut ; consultation et suppression côté Back Office ; aucun compte candidat ; aucun email automatique ; aucune décision non validée sur le stockage des CV. »

**Références** : `ARCHITECTURE.md` (sections 0, 1.6, 2, 3, 5, 6, 8, 9, 10, 11, 13, 14 décisions 7, 9, 10 et 15, décisions ouvertes, 15), `DESIGN.md` (composition de la page « Join »), `PROJECT_CONTEXT.md`, `CLAUDE.md`, `.specify/memory/constitution.md` (principes I, III, V, VI, VIII, IX), `specs/001-api-foundation/contracts/errors.md`, `specs/003-admin-auth/` (gardes, limitation de fréquence), `specs/004-members/` à `specs/006-news/` (conventions de liste et de validation), `apps/web/src/types/application.ts`, `apps/web/src/data/applications.ts`, `apps/web/src/app/rejoindre/_sections/ApplicationForm.tsx` (formulaire existant).

## Contexte et périmètre

La page publique « Rejoindre » contient déjà un formulaire de candidature : prénom, nom, email, téléphone, situation (étudiant ou professionnel) et CV. Aujourd'hui il n'est relié à rien : une candidature n'est ni envoyée ni conservée (`apps/web/src/data/applications.ts`).

Cette fonctionnalité donne à l'API de quoi **recevoir** une candidature et permettre à l'administrateur de la **consulter** et de la **supprimer**. Une candidature est simplement enregistrée : elle n'a ni état de traitement ni workflow (`ARCHITECTURE.md`, section 1.6 et décision 7 ; constitution, principe VI).

Le modèle est verrouillé par `ARCHITECTURE.md`, section 1.6. Le stockage du CV, lui, était une décision ouverte de l'architecture (section 14, « Stockage des CV ») : elle a été tranchée par le porteur du projet le 2026-10-02 (section « Clarifications »). Le CV est conservé chez **Cloudinary**, derrière l'abstraction `StorageService` de l'API.

Cette fonctionnalité est **l'API seulement**. Elle ne branche pas le formulaire de `apps/web` et ne crée aucun écran dans `apps/admin` ; elle définit les contrats dont ces deux interfaces auront besoin.

### Dans le périmètre

1. L'entité Application : prénom, nom, email, téléphone, situation du candidat, CV, date de candidature.
2. Le dépôt public d'une candidature, tel que le formulaire de la page « Rejoindre » le transmettra.
3. La consultation des candidatures par l'administrateur : liste paginée, fiche, accès au CV.
4. La suppression d'une candidature par l'administrateur, avec son CV.
5. La limitation de fréquence du dépôt public.
6. Le stockage du CV chez Cloudinary, par l'abstraction `StorageService` : envoi, lecture et suppression, côté serveur uniquement.

### Hors périmètre

- Toute modification de `apps/web` (branchement du formulaire) et de `apps/admin` (écran des candidatures) : étapes ultérieures.
- Toute suppression automatique : une candidature reste jusqu'à ce que l'administrateur la supprime.
- Le stockage des images (portraits, photographies) : le fournisseur des images reste une décision ouverte ; seul le CV est concerné ici.
- Tout état de traitement : ni « en attente », ni « acceptée », ni « refusée », ni note, ni commentaire, ni affectation.
- Toute modification d'une candidature : elle se consulte et se supprime, elle ne se modifie pas.
- Tout compte candidat, toute connexion ou tout suivi de candidature par le candidat.
- Tout email automatique : ni accusé de réception, ni notification à l'administrateur, ni réponse depuis l'API. Le contact se fait par le client de messagerie de l'administrateur (`mailto:`), côté écran, sans rien stocker (`ARCHITECTURE.md`, section 1.6).
- La transformation d'une candidature en membre.
- Toute protection anti-spam au-delà de la limitation de fréquence (captcha, champ piège) : rien n'est prévu par l'architecture (section 14).
- Toute donnée d'exemple : aucune candidature fictive n'est enregistrée.
- Toute modification de l'authentification, du socle, des années, des membres, des actions et des actualités.
- Les tests automatisés (constitution, principe IX).

## Ce qui est déjà verrouillé

### Par ARCHITECTURE.md

| Sujet | Règle | Source |
|---|---|---|
| Entité | Enregistrée, sans statut de traitement ni workflow | 1.6 ; décision 7 ; constitution VI |
| Champs | `firstName`, `lastName`, `email`, `phone`, `applicantStatus`, `cv` : tous obligatoires ; `createdAt` est la date de candidature | 1.6 |
| Situation | `applicantStatus` vaut `etudiant` ou `professionnel` ; c'est la situation de la personne, pas l'état du dossier | 1.6 |
| CV | Sous-document `FileRef` : `url`, `publicId` (facultatif), `name`, `mimeType`, `size` ; jamais exposé par l'API publique | 2 |
| Dépôt | `POST /applications`, `multipart/form-data`, limité en fréquence ; répond `201` avec `{ "received": true }`, sans rien renvoyer de la candidature | 6, 13 |
| Administration | `GET /admin/applications` (`q`, `from`, `to`, `page`, `limit`, `sort`), `GET /:id`, `GET /:id/cv` (accès au fichier), `DELETE /:id` ; ni création, ni modification, ni statut | 6 |
| Liste | Paginée, 20 par défaut ; recherche sur le prénom, le nom et l'email ; filtres `from` et `to` sur la date de candidature ; tri `-createdAt` par défaut, ou `lastName` | 9 |
| Forme | L'adresse du CV n'apparaît pas dans les réponses ; seuls son nom, son type et sa taille | 13 |
| Validation | Noms : 1 à 120 caractères ; email valide, en minuscules, 254 caractères au plus ; téléphone : chiffres, espaces, `+`, `-`, `.`, parenthèses, 8 chiffres au moins | 8 |
| Suppression | La candidature est supprimée avec son CV | 1.6 |
| Contact | Par `mailto:` côté écran ; aucun envoi depuis l'API | 1.6 |
| Appel | Le formulaire passe par le serveur du Front Office ; le navigateur ne parle jamais à l'API | 10 |
| Protection | Tout `/admin` exige jeton et rôle `ADMIN` | décision 9 |
| Stockage | Abstraction `StorageService` conservée : les modules ne connaissent que l'interface | 2 ; décision 10 |
| Codes | `413` (fichier trop lourd), `415` (type de fichier refusé), `429` (trop de tentatives) | 10 |

### Par les fonctionnalités 001 à 006

Format d'erreur commun et messages par défaut (`413` « Contenu trop volumineux. », `415` « Type de contenu non pris en charge. », `429` « Trop de requêtes. Réessayez plus tard. ») ; `400` « Identifiant invalide. » ; `404` « Ressource introuvable. » ; champ non prévu refusé ; suppression `204` sans corps ; gardes posées sur la classe du contrôleur d'administration ; contrat de pagination `{ data, meta }` ; limitation de fréquence déjà installée, appliquée route par route, compteur en mémoire.

## Clarifications

### Session 2026-10-02

Arbitrages du porteur du projet. Ils sont verrouillés et ne sont plus des questions.

- Q1 : Où le CV est-il conservé ? → A : chez Cloudinary. `StorageService` reste l'abstraction côté API. L'envoi se fait côté serveur uniquement, authentifié et signé ; le secret Cloudinary n'est jamais exposé au Front Office. Le CV est stocké comme fichier brut (`raw`), pour conserver le fichier d'origine. Supprimer la candidature supprime le CV chez Cloudinary. Aucune adresse Cloudinary, aucun identifiant de fichier ni aucune adresse de stockage n'apparaît dans une réponse de l'API. La lecture du CV passe par l'API, protégée `ADMIN`.
- Q2 : Quelle est l'étendue de la fonctionnalité ? → A : l'API uniquement. Aucun branchement de `apps/web`, aucun écran de Back Office. La spec définit les contrats dont les futures interfaces auront besoin.
- Q3 : Quelles sont les valeurs de `applicantStatus` ? → A : exactement `etudiant` et `professionnel`.
- Q4 : Quelles sont les limites du CV ? → A : PDF, DOC ou DOCX ; 5 Mo au plus ; type et contenu validés par l'API, sans se fier seulement à l'extension ni au type annoncé par le client.
- Q5 : Combien de temps une candidature est-elle conservée ? → A : aucune suppression automatique ; suppression par l'`ADMIN` seulement ; elle emporte le CV stocké.
- Q6 : Quelle est la limite de fréquence du dépôt ? → A : 20 dépôts par heure et par adresse IP, compteur partagé par adresse ; au-delà, `429` avec le message existant du socle.
- Q7 : Sous quelle forme l'administrateur obtient-il le CV ? → A : l'API renvoie le fichier lui-même ; aucune adresse ni identifiant Cloudinary dans les réponses ; accès `ADMIN` uniquement.
- Q8 : Une personne peut-elle candidater plusieurs fois ? → A : oui ; aucune unicité sur l'email.
- Q9 : Quelles sont les règles de la liste d'administration ? → A : tri sur `createdAt` et `lastName`, chacun dans les deux sens ; filtres de période sur `createdAt` en ISO 8601, bornes incluses ; recherche par mot entier, comme pour 004, 005 et 006.
- Q10 : Que fait la suppression d'une candidature quand son fichier a déjà disparu du stockage ? → A : le fichier est considéré comme déjà supprimé ; la candidature est supprimée quand même et la réponse est `204`. Seule l'information technique nécessaire est journalisée, et aucun détail du fournisseur n'est exposé. Si le stockage est indisponible ou renvoie une autre erreur qu'une absence, la candidature n'est pas supprimée et la réponse est `503` « Service indisponible. ». Pour un fichier disparu, `404` est réservé à la lecture du CV.

Précisions techniques indispensables au stockage, apparues à la clarification. Elles ne rouvrent aucun arbitrage ; chacune porte la réponse retenue, validée par le porteur du projet le 2026-10-02.

- P1 : Sous quel mode d'accès le CV est-il déposé chez Cloudinary ? → A : en accès authentifié (type `authenticated`, ressource `raw`) : le fichier n'a aucune adresse publique. Pour le lire, l'API demande elle-même à Cloudinary un accès signé de courte durée, récupère le fichier côté serveur et le renvoie ; cet accès n'est jamais transmis au client.
- P2 : Sous quel identifiant le CV est-il déposé ? → A : un identifiant aléatoire généré par l'API, dans un dossier réservé aux CV. Il ne contient ni le nom du candidat ni le nom du fichier d'origine.
- P3 : Que conserve la candidature à propos de son CV ? → A : l'identifiant du fichier chez le fournisseur (obligatoire), le nom d'origine, le type constaté par l'API et la taille. Aucune adresse n'est enregistrée, puisqu'il n'en existe pas de publique. *Écart avec `ARCHITECTURE.md`, section 2, qui décrit `url` obligatoire et `publicId` facultatif : voir « Contradictions et alignements ».*
- P4 : Que répond l'API quand le stockage est injoignable ou en erreur ? → A : `503` avec le message existant du socle (« Service indisponible. »), sans détail technique. Au dépôt : rien n'est enregistré. À la suppression : la candidature est conservée, pour ne laisser aucun CV sans candidature ; un fichier déjà absent n'est pas une erreur de stockage, et la suppression aboutit (`204`). À la lecture du CV : `503`, ou `404` si le fichier n'existe plus chez le fournisseur.
- P5 : Quelles variables d'environnement le stockage demande-t-il ? → A : trois, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` et `CLOUDINARY_API_SECRET`, toutes obligatoires : l'API refuse de démarrer si l'une manque, comme pour ses autres variables obligatoires. Leurs valeurs ne figurent dans aucun fichier versionné ni dans aucun journal.

## Contradictions et alignements

Aucune contradiction n'a été résolue en silence. Les points suivants opposent une décision validée à un texte de référence ; ils se règlent par un alignement d'`ARCHITECTURE.md`, proposé dans le plan et appliqué avant tout code.

| # | Texte de référence | Décision | Traitement |
|---|---|---|---|
| 1 | `ARCHITECTURE.md`, section 2 et décision 10 : « Aucun fournisseur n'est choisi ni intégré » | Q1 : Cloudinary pour le CV | Alignement. Le fournisseur des images reste ouvert. |
| 2 | `ARCHITECTURE.md`, section 2 : `FileRef` avec `url` obligatoire et `publicId` facultatif | P3 : identifiant obligatoire, aucune adresse enregistrée | Alignement validé. |
| 3 | `ARCHITECTURE.md`, section 2 : `StorageService` avec `upload`, `delete`, « éventuellement `signedUrl` » | Q7 : l'API renvoie le fichier, donc une lecture au lieu d'une adresse signée remise au client | Alignement. |
| 4 | `ARCHITECTURE.md`, section 15 : stockage de fichiers, puis candidatures | Q1 : le stockage du CV est livré avec les candidatures ; celui des images reste à faire | Alignement. |
| 5 | `ARCHITECTURE.md`, sections 8 et 14 : limites du CV « à confirmer », conservation « à fixer » | Q4, Q5 | Alignement : décisions fermées. |
| 6 | `ARCHITECTURE.md`, section 9 : tri `-createdAt` (défaut), `lastName` | Q9 : deux sens pour chacun | Alignement. |
| 7 | `ARCHITECTURE.md`, section 12 : « Variables du stockage : à définir » | P5 | Alignement validé. |
| 8 | `PROJECT_CONTEXT.md` : « le fournisseur de stockage n'est pas choisi » ; stockage des CV parmi les décisions ouvertes | Q1 | Mis à jour en fin d'implémentation, comme pour chaque fonctionnalité. |

`DESIGN.md` n'est pas concerné : la fonctionnalité ne touche pas le Front Office. La constitution n'est pas contredite : la dépendance nouvelle répond à un besoin réel (principe IV), et `StorageService` est une abstraction déjà décidée par l'architecture, pas une abstraction nouvelle.

Point d'attention, hors contradiction : le CV et son nom d'origine sont des données personnelles confiées à un prestataire extérieur. C'est la conséquence directe de Q1 ; `PROJECT_CONTEXT.md` le mentionnera.

## User Scenarios & Testing *(mandatory)*

Conformément à la constitution (principe IX), il n'y a pas de test automatisé : chaque récit décrit une **vérification manuelle**.

### User Story 1 - Déposer une candidature (Priority: P1)

Une personne remplit le formulaire de la page « Rejoindre » : prénom, nom, email, téléphone, situation, CV. Sa candidature est enregistrée. Elle reçoit seulement la confirmation que la candidature est bien reçue ; rien de ce qu'elle a envoyé ne lui est renvoyé.

**Why this priority** : sans dépôt, il n'y a rien à consulter.

**Independent Test** : vérification manuelle. Envoyer une candidature complète : réponse `201` avec la seule confirmation de réception ; une candidature existe, avec la date du dépôt. Envoyer des candidatures incomplètes ou mal formées : refus avec le détail du champ, et rien n'est enregistré.

**Acceptance Scenarios** :

1. **Given** une candidature complète et valide, **When** elle est déposée, **Then** elle est enregistrée avec la date du dépôt, son CV est conservé chez le fournisseur de stockage, et la réponse est `201` avec `{ "received": true }`, sans aucune donnée de la candidature.
2. **Given** un prénom, un nom, un email, un téléphone ou une situation absent ou mal formé, **When** la candidature est déposée, **Then** elle est refusée (`400`) avec le détail du champ en cause, et rien n'est enregistré, ni candidature ni fichier.
3. **Given** une situation autre que `etudiant` ou `professionnel` (par exemple « Étudiant », `student`), **When** la candidature est déposée, **Then** elle est refusée (`400`).
4. **Given** aucun CV joint, **When** la candidature est déposée, **Then** elle est refusée (`400`) avec le détail sur le CV.
5. **Given** un CV de plus de 5 Mo, **When** la candidature est déposée, **Then** elle est refusée (`413`) et rien n'est enregistré ; un CV de 5 Mo exactement est accepté.
6. **Given** un fichier dont le contenu n'est ni un PDF, ni un DOC, ni un DOCX — même s'il porte une de ces extensions ou s'annonce comme tel —, **When** la candidature est déposée, **Then** elle est refusée (`415`) et rien n'est enregistré, ni en base ni chez le fournisseur.
7. **Given** un champ non prévu (par exemple un état de traitement), **When** la candidature est déposée, **Then** elle est refusée (`400`).
8. **Given** un dépôt sans authentification, **When** il est envoyé, **Then** il est accepté : le dépôt est public.
9. **Given** 20 dépôts venus de la même adresse IP dans l'heure, réussis ou non, **When** un vingt-et-unième arrive, **Then** il est refusé (`429`, « Trop de requêtes. Réessayez plus tard. ») et rien n'est enregistré.
10. **Given** deux dépôts valides portant le même email, **When** ils sont envoyés, **Then** deux candidatures distinctes sont enregistrées.
11. **Given** un stockage injoignable, **When** une candidature valide est déposée, **Then** elle est refusée (`503`, « Service indisponible. ») et aucune candidature n'est enregistrée.

---

### User Story 2 - Consulter les candidatures (Priority: P1)

L'administrateur connecté voit les candidatures reçues, de la plus récente à la plus ancienne. Il peut chercher une personne, limiter la liste à une période, ouvrir une candidature et lire le CV.

**Why this priority** : c'est le but de la fonctionnalité côté club.

**Independent Test** : vérification manuelle. Après trois dépôts, connecté : la liste montre trois candidatures, la plus récente d'abord ; la fiche de l'une montre ses informations et la description de son CV ; le CV se récupère. Sans jeton, chacun de ces appels est refusé.

**Acceptance Scenarios** :

1. **Given** des candidatures enregistrées, **When** l'administrateur lit la liste, **Then** elle est paginée (20 par page par défaut), de la plus récente à la plus ancienne ; il peut la trier par date de candidature ou par nom, dans les deux sens.
2. **Given** une recherche d'un mot entier d'un prénom, d'un nom ou d'un email, **When** l'administrateur lit la liste, **Then** seules les candidatures correspondantes sont renvoyées.
3. **Given** une période donnée par `from`, `to` ou les deux, **When** l'administrateur lit la liste, **Then** seules les candidatures déposées dans cette période, bornes incluses, sont renvoyées ; une date sans heure couvre la journée entière en temps universel.
4. **Given** une candidature, **When** l'administrateur ouvre sa fiche, **Then** il obtient le prénom, le nom, l'email, le téléphone, la situation, la date de candidature, et pour le CV son nom, son type et sa taille — jamais son adresse ni son identifiant de stockage.
5. **Given** une candidature, **When** l'administrateur demande son CV, **Then** l'API lui renvoie le fichier déposé, à l'identique, avec son nom d'origine et son type.
6. **Given** un identifiant mal formé, **When** une candidature ou son CV est demandé, **Then** la réponse est `400` « Identifiant invalide. » ; un identifiant bien formé inconnu donne `404`.
7. **Given** un appel sans jeton valide, **When** il vise la liste, une fiche ou un CV, **Then** il est refusé (`401`) et rien n'est lu.
8. **Given** une candidature, **When** on cherche à la modifier ou à lui donner un état, **Then** aucune opération ne le permet.

---

### User Story 3 - Supprimer une candidature (Priority: P1)

L'administrateur supprime une candidature. Le CV disparaît avec elle : aucun fichier ne reste sans candidature.

**Why this priority** : une candidature contient des données personnelles ; pouvoir les retirer est une obligation, pas un confort.

**Independent Test** : vérification manuelle. Supprimer une candidature : elle disparaît de la liste, sa fiche et son CV répondent `404`, et le fichier n'existe plus dans le stockage.

**Acceptance Scenarios** :

1. **Given** une candidature, **When** l'administrateur la supprime, **Then** la réponse est `204` sans corps ; la candidature n'apparaît plus dans la liste, et sa fiche comme son CV répondent `404`.
2. **Given** une candidature supprimée, **When** on examine le stockage chez Cloudinary, **Then** son CV n'y est plus.
3. **Given** un identifiant mal formé ou inconnu, **When** la suppression est demandée, **Then** la réponse est `400` « Identifiant invalide. » ou `404`.
4. **Given** un appel sans jeton valide, **When** il demande une suppression, **Then** il est refusé (`401`) et rien n'est supprimé.
5. **Given** un stockage indisponible, ou qui renvoie une erreur autre que l'absence du fichier, **When** la suppression est demandée, **Then** la réponse est `503` « Service indisponible. », sans détail du fournisseur, et la candidature est conservée, avec son CV.
6. **Given** une candidature dont le fichier a déjà disparu du stockage, **When** la suppression est demandée, **Then** le fichier est considéré comme déjà supprimé, la candidature est supprimée et la réponse est `204` — jamais `404` ; le journal n'en garde que l'information technique nécessaire.

---

### User Story 4 - Protéger les données des candidats (Priority: P1)

Les informations d'un candidat et son CV ne sont visibles que de l'administrateur. Aucune lecture publique n'existe, et rien de sensible n'apparaît dans les journaux.

**Why this priority** : une candidature est faite de données personnelles ; une fuite serait une faute envers les personnes.

**Independent Test** : vérification manuelle. Sans jeton, aucune adresse ne renvoie de candidature, de liste ni de CV. Le journal de l'API ne contient ni email, ni téléphone, ni contenu de fichier.

**Acceptance Scenarios** :

1. **Given** un visiteur non connecté, **When** il cherche à lire une candidature, la liste ou un CV, **Then** aucune adresse publique ne le permet.
2. **Given** un dépôt réussi, **When** on lit sa réponse, **Then** elle ne contient ni identifiant de la candidature, ni aucune donnée déposée.
3. **Given** un dépôt, réussi ou refusé, **When** on lit le journal de l'API, **Then** il ne contient ni l'email, ni le téléphone, ni le nom du candidat, ni le contenu du CV.
4. **Given** un CV enregistré, **When** on cherche dans les réponses de l'API une adresse Cloudinary, un identifiant de fichier ou une adresse de stockage, **Then** rien de tel n'y figure, ni dans le corps ni dans les en-têtes.
5. **Given** le fichier d'un CV chez Cloudinary, **When** on tente de le lire sans passer par l'API, **Then** il n'a aucune adresse publique.
6. **Given** les fichiers versionnés et le journal de l'API, **When** on y cherche le secret Cloudinary, **Then** il n'y figure pas.

---

### User Story 5 - Ce que le formulaire et l'écran devront pouvoir faire (Priority: P3)

Le formulaire de la page « Rejoindre » et le futur écran « Candidatures » du Back Office devront pouvoir s'appuyer sur cette fonctionnalité sans rien y ajouter. Ce récit n'est vérifié que par relecture des contrats : ni `apps/web` ni `apps/admin` ne sont modifiés.

**Why this priority** : ni le formulaire ni l'écran ne sont construits ici. Il s'agit de vérifier que l'API leur suffit.

**Independent Test** : vérification par relecture des réponses spécifiées.

**Acceptance Scenarios** :

1. **Given** le formulaire existant, **When** il enverra ses six champs, **Then** l'API les accepte tels qu'il les collecte, la situation étant transmise sous le nom `applicantStatus` (le Front Office la nomme aujourd'hui `status`).
2. **Given** un refus de validation, **When** le formulaire le recevra, **Then** chaque message désigne son champ et peut être affiché sous lui.
3. **Given** un fichier trop lourd, d'un type refusé, ou trop de dépôts, **When** le formulaire recevra `413`, `415` ou `429`, **Then** il dispose d'un message en français affichable.
4. **Given** la fiche d'une candidature, **When** l'écran l'affichera, **Then** il dispose de l'email pour ouvrir le client de messagerie de l'administrateur ; l'API n'envoie aucun email.
5. **Given** l'écran des candidatures, **When** on y cherche une action de modification ou de changement d'état, **Then** il n'y en a pas.

---

### Edge Cases

- **Deux dépôts de la même personne** : permis ; deux candidatures distinctes.
- **Ordre des refus au dépôt** : la limite de fréquence d'abord (`429`), puis la taille du fichier (`413`), puis les champs et la présence du CV (`400`), puis le type du fichier (`415`). Le fichier n'est envoyé au stockage qu'après toutes ces vérifications.
- **Extension et contenu en désaccord** (un PDF nommé `.docx`) : refusé (`415`).
- **Période inversée** (`from` postérieur à `to`) : liste vide, `200`.
- **Dépôt refusé après réception du fichier** (validation en échec, type refusé) : aucun fichier n'est conservé.
- **Échec de l'enregistrement après le stockage du fichier** : le fichier est retiré du stockage ; il ne reste ni candidature ni CV.
- **Suppression dont le fichier est déjà absent du stockage** : la candidature est tout de même supprimée, `204`. Le journal note le fait et l'identifiant de la candidature, rien d'autre.
- **Lecture d'un CV dont le fichier a disparu du stockage** : `404`. C'est le seul cas où un fichier disparu donne `404`.
- **Nom de fichier inhabituel** (accents, espaces, très long) : le nom d'origine est conservé pour l'affichage, sans chemin, limité à 255 caractères ; il ne sert jamais d'adresse ni d'identifiant de stockage.
- **Fichier vide** : refusé comme CV absent.
- **Plusieurs fichiers envoyés** : un seul CV est attendu ; la demande est refusée.
- **Recherche de moins de deux caractères**, tri non autorisé, page ou taille hors bornes, date de période mal formée : `400`, selon le contrat commun des listes.
- **Stockage injoignable** : `503` au format commun, sans détail technique ; rien n'est enregistré à moitié.
- **Redémarrage de l'API** : le compteur de fréquence, tenu en mémoire, repart de zéro, comme celui de la connexion.

## Requirements *(mandatory)*

### Functional Requirements

**Candidature**

- **FR-001** : Une candidature MUST porter un prénom, un nom, un email, un téléphone, la situation du candidat et un CV, tous obligatoires, ainsi que la date de son dépôt, posée automatiquement.
- **FR-002** : Le prénom et le nom MUST compter de 1 à 120 caractères, espaces de début et de fin retirés. L'email MUST être valide, mis en minuscules, de 254 caractères au plus. Le téléphone MUST suivre la règle du projet : chiffres, espaces, `+`, `-`, `.`, parenthèses, au moins 8 chiffres (`ARCHITECTURE.md`, section 8).
- **FR-003** : La situation du candidat (`applicantStatus`) MUST valoir exactement `etudiant` ou `professionnel`. Elle décrit la personne, jamais l'état du dossier.
- **FR-004** : Une candidature MUST NOT porter d'état de traitement, de note, de commentaire ni d'affectation, et MUST NOT pouvoir être modifiée après son dépôt.
- **FR-005** : Le CV MUST être un fichier PDF, DOC ou DOCX de 5 Mo au plus (5 242 880 octets). La candidature MUST en conserver le nom d'origine, le type constaté par l'API, la taille et l'identifiant chez le fournisseur de stockage. Plusieurs candidatures MAY porter le même email : aucune unicité n'est imposée.

**Dépôt public**

- **FR-006** : L'API MUST offrir sans authentification le dépôt d'une candidature sur `POST /api/v1/applications`, en `multipart/form-data`.
- **FR-007** : Un dépôt réussi MUST répondre `201` avec `{ "received": true }` et MUST NOT renvoyer aucune donnée de la candidature, pas même son identifiant.
- **FR-008** : Un dépôt incomplet ou mal formé MUST être refusé (`400`) avec le détail par champ ; un CV trop lourd MUST donner `413` ; un CV d'un type refusé MUST donner `415`. Dans tous ces cas, rien MUST NOT être conservé : ni candidature, ni fichier.
- **FR-009** : Le type du CV MUST être établi par l'API à partir du contenu du fichier. Ni l'extension ni le type annoncé par le client ne suffisent ; une extension qui contredit le contenu MUST être refusée (`415`). Le type enregistré est celui que l'API a constaté.
- **FR-010** : Le dépôt MUST être limité à 20 demandes par heure et par adresse IP, réussies ou non, par le mécanisme de limitation déjà en place ; au-delà, la réponse est `429` avec le message du socle. Cette limite MUST NOT modifier celle de la connexion.
- **FR-011** : Une candidature et son CV MUST être enregistrés ensemble ou pas du tout. Si l'enregistrement de la candidature échoue après l'envoi du fichier, le fichier MUST être retiré du stockage.

**Administration** (sous `/api/v1/admin/applications`)

- **FR-012** : L'administrateur MUST disposer d'une liste paginée des candidatures, selon le contrat commun des listes, avec recherche sur le prénom, le nom et l'email, filtre par période sur la date de candidature, tri parmi `createdAt`, `-createdAt`, `lastName`, `-lastName`, `-createdAt` par défaut. La recherche porte sur des mots entiers. `from` et `to` sont des dates ISO 8601, bornes incluses ; une date sans heure couvre la journée entière en temps universel.
- **FR-013** : L'administrateur MUST pouvoir consulter la fiche d'une candidature, dans la forme de l'exemple d'`ARCHITECTURE.md`, section 13.
- **FR-014** : L'administrateur MUST pouvoir obtenir le CV d'une candidature sur `GET /api/v1/admin/applications/:id/cv` : l'API MUST renvoyer le fichier lui-même, à l'identique, avec son type et son nom d'origine, et MUST interdire sa mise en cache.
- **FR-015** : L'administrateur MUST pouvoir supprimer une candidature ; son CV MUST être supprimé du stockage avec elle. L'ordre MUST être : le fichier, puis la candidature ; réponse `204` sans corps. Si le fichier est déjà absent du stockage, il MUST être considéré comme déjà supprimé : la candidature MUST être supprimée quand même, la réponse MUST être `204`, et le journal MUST se limiter à l'information technique nécessaire (le fait et l'identifiant de la candidature). Si le stockage est indisponible ou renvoie une erreur autre que l'absence du fichier, la candidature MUST NOT être supprimée et la réponse MUST être `503` « Service indisponible. ». `DELETE` MUST NOT répondre `404` pour un fichier disparu : ce code y reste celui d'une candidature inconnue.
- **FR-016** : Aucune opération de création par l'administrateur, de modification ni de changement d'état MUST NOT exister.

**Confidentialité**

- **FR-017** : Aucune lecture publique d'une candidature, de la liste ou d'un CV MUST NOT exister.
- **FR-018** : Aucune adresse Cloudinary, aucun identifiant de fichier ni aucune adresse de stockage MUST NOT apparaître dans une réponse de l'API, corps ou en-têtes. Le fichier MUST NOT avoir d'adresse publique chez le fournisseur.
- **FR-019** : Le journal de l'API MUST NOT contenir de donnée personnelle d'un candidat ni de contenu de fichier.
- **FR-020** : Aucune candidature MUST NOT être supprimée automatiquement : seule une suppression demandée par l'`ADMIN` la retire.

**Protection, erreurs, limites**

- **FR-021** : Toutes les opérations d'administration MUST exiger un jeton valide et le rôle `ADMIN`, par les gardes existantes posées sur le contrôleur d'administration. L'authentification n'est pas modifiée.
- **FR-022** : Un identifiant mal formé MUST donner `400` « Identifiant invalide. » ; une ressource inexistante MUST donner `404`.
- **FR-023** : Toutes les erreurs MUST suivre le format commun du socle, en français. Les messages par défaut du socle s'appliquent à `413`, `415` et `429`. Les messages de validation par champ reprennent ceux déjà définis quand ils existent (email, téléphone) ; les autres sont proposés au plan et soumis à validation.
- **FR-024** : L'API MUST NOT envoyer d'email, ni au candidat ni à l'administrateur.
- **FR-025** : Cette fonctionnalité MUST NOT modifier `apps/web`, `apps/admin` ni `DESIGN.md`.
- **FR-026** : Cette fonctionnalité MUST NOT inventer de donnée : aucune candidature d'exemple, aucun script d'insertion (constitution, principes III et VIII).

**Stockage**

- **FR-027** : Le CV MUST être conservé chez Cloudinary, comme fichier brut, en accès authentifié, sous un identifiant aléatoire qui ne contient aucune donnée du candidat.
- **FR-028** : L'envoi, la lecture et la suppression du fichier MUST se faire côté serveur, par des appels signés. Le secret Cloudinary MUST NOT être transmis à un client, écrit dans un fichier versionné ni journalisé.
- **FR-029** : Le code des candidatures MUST NOT connaître le fournisseur : il n'utilise que l'abstraction `StorageService` (envoyer, lire, supprimer).
- **FR-030** : Une erreur du stockage MUST donner `503` au format commun, avec le message du socle et sans détail du fournisseur ; un fichier introuvable MUST donner `404` à la lecture du CV, et à la lecture seulement (voir FR-015 pour la suppression).
- **FR-031** : Les trois variables d'environnement du stockage MUST être obligatoires et validées au démarrage ; le message d'erreur nomme la variable, jamais sa valeur.

### Key Entities

- **Application** : une candidature au club. Prénom, nom, email, téléphone, situation du candidat, CV, date de candidature. Ni état de traitement, ni modification.
- **FileRef** : la description d'un fichier conservé, embarquée dans la candidature : nom d'origine, type, taille, et l'identifiant du fichier chez le fournisseur. Seuls le nom, le type et la taille sont exposés.
- **ApplicantStatus** : la situation de la personne. Liste fermée de deux valeurs, sans entité propre.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** : Une personne dépose sa candidature en une seule demande, avec six informations.
- **SC-002** : 100 % des dépôts incomplets, mal formés, trop lourds ou d'un type refusé sont rejetés, et aucun ne laisse de donnée ni de fichier.
- **SC-003** : Il n'existe jamais de candidature sans CV ni de CV sans candidature.
- **SC-004** : L'administrateur retrouve une candidature par le nom ou l'email de la personne, et lit son CV, sans quitter l'administration.
- **SC-005** : Après la suppression d'une candidature, il ne reste rien d'elle : ni ses informations, ni son fichier.
- **SC-006** : 100 % des appels d'administration sans jeton valide sont refusés, sans lecture ni écriture.
- **SC-007** : Aucune réponse publique et aucune ligne de journal ne contient une donnée personnelle d'un candidat.
- **SC-008** : Aucune candidature ne porte d'état de traitement, et aucune opération ne permet de la modifier.
- **SC-009** : Les routes existantes (santé, authentification, années Rotary, membres, mandats, actions, actualités) répondent comme avant.
- **SC-010** : Aucun CV n'est accessible autrement que par l'API, avec un jeton d'administrateur.
- **SC-011** : Le secret du stockage n'apparaît dans aucun fichier versionné, aucune réponse et aucun journal.

## Assumptions

- **Branche.** La branche `007-applications` a été créée à la main depuis `main`, à la demande explicite du porteur du projet, après la fusion de `006-news`. Le hook Spec Kit de création de branche n'a donc pas été exécuté.
- **Ordre des étapes.** `ARCHITECTURE.md`, section 15, place le stockage de fichiers avant les candidatures. Le stockage du CV est livré ici, avec les candidatures ; celui des images reste une étape à part.
- **Nom du champ de situation.** Le Front Office le nomme `status` ; l'API le nomme `applicantStatus`. `ARCHITECTURE.md`, section 10, prévoit ce renommage à la migration.
- **Limitation de fréquence existante.** La bibliothèque installée par `003-admin-auth` est appliquée route par route, sans garde globale ; cette fonctionnalité l'applique au dépôt de la même façon.
- **Adresse de l'appelant.** Le formulaire sera envoyé par le serveur du Front Office : tous les dépôts viendront de la même adresse et partageront le même compteur. C'est ce qui a motivé la limite de 20 par heure.
- **Contact du candidat.** Par `mailto:`, côté écran, sans rien stocker. La route d'envoi depuis l'API, mentionnée comme réservée par l'architecture, n'est pas créée.
- **Dépendances.** La réception d'un formulaire avec fichier s'appuie sur ce que NestJS fournit déjà. Le stockage demande une dépendance, le client officiel de Cloudinary ; elle est établie au plan et soumise à validation.
- **Compte Cloudinary.** Le porteur du projet crée le compte et renseigne lui-même les trois variables dans `apps/api/.env`. Tant qu'elles manquent, l'API ne démarre pas.
- **Reconnaissance du type.** Un fichier DOC est reconnu à la signature commune aux anciens documents Office : un ancien classeur ou une ancienne présentation renommé en `.doc` passerait. Cette limite est acceptée ; elle n'ouvre aucun risque d'exécution, le fichier n'étant jamais interprété par l'API.
- **Vérification.** Elle suppose une base joignable, le compte d'administration et un compte Cloudinary. Les candidatures de vérification sont déposées avec des données factices et un fichier de vérification, puis supprimées par l'API, ce qui retire aussi leurs fichiers de Cloudinary.
