# Feature Specification: Stockage des images

**Feature Branch**: `011-image-storage`

**Created**: 2026-10-13

**Status**: Clarifications closes le 2026-10-13 (Q1 à Q3) — en attente de validation avant le plan

**Input**: User description: « Fonctionnalité 011 : stockage des images, étape 10 d'ARCHITECTURE.md. Portrait des membres, photographies des actions et des actualités : stockage chez Cloudinary derrière StorageService (mêmes variables que les CV), envoi par le Back Office à l'API, jamais directement du navigateur vers le fournisseur. JPEG, PNG ou WebP, 5 Mo au plus. Modèle MediaRef (alt obligatoire). Endpoints `POST /admin/media` et `DELETE /admin/media`, forme à fixer. Saisie dans le Back Office (`apps/admin/DESIGN.md`), affichage dans le Front Office (`DESIGN.md`) à la place des emplacements actuels. La spec doit dire comment une image de 5 Mo passe malgré la limite du corps des Server Actions (1 Mo par défaut) et de Vercel (environ 4,5 Mo). Pas de tests automatisés, aucune dépendance sans justification. »

**Références** :
- `ARCHITECTURE.md` : section 1 (Member `portrait`, Action et News `photos`) ; section 2 (`MediaRef`, `StorageService`) ; sections 6 (Médias), 8 (Images, Tableaux), 10 (correspondance `Photo` ← `MediaRef`) et 11 (envoi de fichiers) ; section 13 (exemples JSON) ; section 14, décision 10.
- `DESIGN.md` : section 7 (Photographie : formats, largeurs minimales, légende, point d'intérêt) et section 8 (emplacements sans contenu).
- `apps/admin/DESIGN.md`.
- `.specify/memory/constitution.md` : principes V, VI, VIII.
- `specs/007-applications/` : stockage du CV, même module `media`.

## Contexte et périmètre

Le site affiche aujourd'hui, à la place de chaque photographie, un gabarit « Photographie à venir » (`DESIGN.md`, section 8) :
- le Front Office sait déjà afficher une image dès qu'il en reçoit une ;
- l'API ne stocke encore aucune image, et le Back Office ne permet pas d'en envoyer.

Cette fonctionnalité ferme la boucle pour trois usages : le portrait d'un membre, et les photographies d'une action et d'une actualité.

### Dans le périmètre

1. **Stockage** : dépôt chez Cloudinary, par l'API, derrière l'abstraction de stockage existante ; contrôle du type et du poids.
2. **Données** : le portrait d'un membre (une image au plus) ; les photographies d'une action et d'une actualité (20 au plus, la première est la principale), avec texte alternatif, légende et crédit.
3. **Back Office** : ajout, remplacement, retrait et ordre des images, sur la fiche d'un membre, d'une action et d'une actualité, et leur aperçu dans les listes.
4. **Front Office** : les images réelles remplacent les gabarits partout où le contenu correspondant les porte.
5. **Ménage** : une image retirée, remplacée ou appartenant à un contenu supprimé est retirée du stockage.

### Hors périmètre

- Les photographies du site lui-même : l'ouverture de l'accueil, les images « Le club » et « Nous rejoindre ». Elles ne sont rattachées à aucun contenu de l'API.
- Une médiathèque partagée, une image réutilisée par plusieurs contenus, une recherche dans les images.
- La retouche dans le Back Office : rognage, rotation, filtres.
- L'envoi direct du navigateur vers le fournisseur et l'ouverture de CORS (décision 10).
- Le déploiement : la limite de Vercel est prise en compte dans la conception, mais rien n'est déployé.
- Les tests automatisés (constitution, principe IX).

## Ce qui est déjà verrouillé

- **Fournisseur et chemin** (décision 10) : Cloudinary, même compte et mêmes variables que les CV ; l'image va du navigateur au serveur du Back Office, puis à l'API, puis au fournisseur.
- **Formats** (section 8) : JPEG, PNG ou WebP ; 5 Mo au plus (5 242 880 octets) ; type constaté sur le contenu ; `alt`, `width`, `height` obligatoires ; `photos` : 20 au plus.
- **Forme** (section 2, `MediaRef`) : une image est embarquée dans son contenu, sans collection à part.
- **Front Office** (section 10) : `Photo.src` ← `MediaRef.url` ; les autres champs sont identiques.
- **Règles visuelles** (`DESIGN.md`, section 7) :
  - largeur minimale de 1200 px pour un portrait, 1600 px pour une image de contenu ;
  - « la qualité décide du poids visuel » ;
  - légende réelle sous une photographie de contenu ;
  - crédit seulement s'il y a un auteur ;
  - point d'intérêt gardé au recadrage ;
  - aucun agrandissement au-delà de la taille d'origine.
- **Back Office** : le navigateur n'appelle jamais l'API ; écritures par actions côté serveur.

## Points signalés avant rédaction

- **Variables d'environnement** : `ARCHITECTURE.md`, section 12, dit encore « Les variables du stockage des images restent à définir ». Elles sont désormais les mêmes `CLOUDINARY_*` ; la phrase est à corriger.
- **Identifiants du fournisseur** : pour le CV, aucune référence de stockage n'apparaît dans les réponses de l'API. Pour une image, l'adresse est forcément publique, puisque le site l'affiche. L'identifiant interne (`publicId`), lui, n'a pas besoin d'être exposé aux lectures publiques (FR-007).

## Clarifications

### Session 2026-10-13

- Q: Comment une image de 5 Mo passe-t-elle du navigateur jusqu'à l'API ? → A: Les deux mécanismes à la fois : réduction dans le navigateur avant l'envoi (côté le plus long limité à environ 3000 px, ré-encodage JPEG ou WebP, sans dépendance) et limite d'envoi du serveur du Back Office relevée à environ 6 Mo par sécurité (FR-004).
- Q: Le Back Office permet-il de choisir le point d'intérêt d'une image ? → A: Oui : un clic sur la vignette, dans le panneau de saisie, place le repère ; centre par défaut ; « Recentrer » le remet au centre (FR-009).
- Q: Les photographies peuvent-elles s'ajouter dès le formulaire de création, ou seulement sur la fiche d'un contenu enregistré ? → A: Seulement sur la fiche, une fois le contenu créé ; il en va de même pour le portrait d'un membre (FR-012).

## User Scenarios & Testing *(mandatory)*

Vérifications manuelles uniquement (constitution, principe IX).

### User Story 1 - Ajouter les photographies d'une action (Priority: P1)

L'administrateur ouvre la fiche d'une action et ajoute une ou plusieurs photographies prises lors de l'action. Pour chacune, il saisit ce que l'image montre (texte alternatif) et, s'il le souhaite, une légende et un crédit. Il les met dans l'ordre : la première est la photographie principale. Après publication, la page Actions du site montre ces photographies à la place du gabarit.

**Why this priority**: les actions sont le cœur du site (« Le journal du club ») ; c'est le plus grand nombre de gabarits visibles aujourd'hui.

**Independent Test**: sur une action publiée, ajouter deux photographies, les réordonner, enregistrer ; vérifier la fiche, l'aperçu de la liste, puis la page Actions et l'accueil du site.

**Acceptance Scenarios**:

1. **Given** la fiche d'une action, **When** l'administrateur choisit un fichier JPEG, PNG ou WebP de 5 Mo au plus et saisit un texte alternatif, **Then** l'image est enregistrée et apparaît dans la liste des photographies de l'action, avec sa vignette, ses dimensions et sa légende.
2. **Given** un fichier de plus de 5 Mo, ou d'un autre type (PDF, GIF, image déguisée), **When** il est envoyé, **Then** il est refusé avec un message en français, et rien n'est stocké.
3. **Given** une image sans texte alternatif, **When** l'administrateur enregistre, **Then** l'enregistrement est refusé avec « Le texte alternatif est obligatoire. » sous le champ.
4. **Given** plusieurs photographies, **When** il en déplace une vers le haut, **Then** l'ordre est enregistré, et la première devient la photographie principale partout où une seule image est montrée.
5. **Given** une action qui a déjà 20 photographies, **When** il veut en ajouter une, **Then** l'ajout est impossible et la limite est dite.
6. **Given** une action publiée avec des photographies, **When** on ouvre la page Actions du site ou l'accueil (dernières actions), **Then** la photographie principale remplace le gabarit, avec son texte alternatif et sa légende.

---

### User Story 2 - Donner un portrait à un membre (Priority: P1)

L'administrateur ajoute, remplace ou retire le portrait d'un membre sur sa fiche. La page Membres du site et l'aperçu des membres de l'accueil montrent le portrait.

**Why this priority**: le collectif est une section entière de l'accueil et une page du site, aujourd'hui entièrement en gabarits.

**Independent Test**: ajouter un portrait à un membre qui a un mandat dans l'année en cours, vérifier la page Membres ; le remplacer, puis le retirer.

**Acceptance Scenarios**:

1. **Given** la fiche d'un membre sans portrait, **When** l'administrateur envoie une image valide avec un texte alternatif, **Then** le portrait est enregistré et visible sur la fiche et dans l'aperçu de la liste des membres.
2. **Given** un membre avec un portrait, **When** l'administrateur le remplace, **Then** le nouveau portrait s'affiche et l'ancien fichier est retiré du stockage.
3. **Given** un membre avec un portrait, **When** l'administrateur le retire et confirme, **Then** le site revient au gabarit du portrait et le fichier est retiré du stockage.
4. **Given** un membre avec un portrait et un mandat dans l'année affichée, **When** on ouvre la page Membres, **Then** son portrait remplace le gabarit ; ni l'email ni le téléphone n'apparaissent pour autant.

---

### User Story 3 - Ajouter les photographies d'une actualité (Priority: P2)

Même parcours que l'histoire 1, pour une actualité. Le site montre la photographie principale dans l'actualité « à la une » et dans le registre des actualités.

**Why this priority**: même mécanisme que l'histoire 1, sur un contenu au rôle moins photographique (`DESIGN.md` : sur la page Actualités, la date domine).

**Independent Test**: ajouter une photographie à l'actualité la plus récente et publiée, vérifier la page Actualités.

**Acceptance Scenarios**:

1. **Given** la fiche d'une actualité, **When** l'administrateur ajoute une photographie valide avec un texte alternatif, **Then** elle est enregistrée, avec les mêmes règles que pour une action.
2. **Given** l'actualité à la une avec une photographie, **When** on ouvre la page Actualités, **Then** sa photographie principale remplace le gabarit.

---

### User Story 4 - Ne rien laisser traîner (Priority: P2)

Quand un contenu est supprimé, ou qu'une image est retirée ou remplacée, le fichier correspondant ne reste pas chez le fournisseur.

**Why this priority**: le compte gratuit du fournisseur a un quota ; des fichiers orphelins coûteraient de la place sans rien montrer.

**Independent Test**: supprimer une action qui a deux photographies, puis vérifier dans la console du fournisseur que les deux fichiers ont disparu.

**Acceptance Scenarios**:

1. **Given** une action, une actualité ou un membre avec des images, **When** l'administrateur le supprime, **Then** ses fichiers sont retirés du stockage ; un fichier déjà absent n'empêche pas la suppression.
2. **Given** une image retirée ou remplacée, **When** l'enregistrement réussit, **Then** l'ancien fichier est retiré du stockage.
3. **Given** le stockage indisponible pendant un retrait, **When** l'opération échoue, **Then** le contenu n'est pas modifié et « Service indisponible. » s'affiche, comme pour les CV.

---

### Edge Cases

- **Envoi interrompu** (fermeture de l'onglet, perte de réseau) : aucune image à moitié enregistrée n'apparaît dans un contenu. Un fichier déposé dont le rattachement échoue est retiré par l'API dans la même opération (FR-012).
- **Contenu supprimé pendant l'envoi** d'une de ses images : l'envoi répond « Ressource introuvable. », et le fichier déposé est retiré.
- **Image trop petite** pour son emplacement (sous 1200 px pour un portrait, 1600 px pour une photographie) : elle est acceptée, mais le Back Office le signale. Le Front Office la place dans un cadre plus petit, ou ne l'agrandit jamais au-delà de sa taille (`DESIGN.md`, « La qualité décide du poids visuel »).
- **Fichier dont l'extension ment** (un PDF renommé `.jpg`) : refusé, le type étant constaté sur le contenu.
- **Image très grande** (par exemple 8000 px, 4,9 Mo) : acceptée, réduite à 3000 px de côté le plus long avant l'envoi ; le site en sert une version à la taille de l'affichage.
- **Image plus petite que 3000 px** : envoyée à sa taille, jamais agrandie ; seul le ré-encodage réduit son poids.
- **Image orientée par ses métadonnées** (photo de téléphone tournée) : elle s'affiche dans le bon sens, avec les bonnes dimensions.
- **Contenu dépublié** : ses images ne sont plus visibles sur les pages du site. Leur adresse directe reste techniquement joignable chez le fournisseur ; c'est accepté pour la V1, comme pour toute image publique.
- **Deux images identiques** dans un même contenu : autorisées ; ce sont deux fichiers distincts.
- **Fournisseur indisponible** à l'envoi : « Service indisponible. » ; le contenu n'est pas modifié.

## Requirements *(mandatory)*

### Functional Requirements

**Stockage et contrôle**

- **FR-001**: Une image MUST être déposée chez le fournisseur par l'API seulement, derrière l'abstraction de stockage existante, avec le même compte et les mêmes variables que les CV. Le navigateur MUST NOT appeler ni l'API ni le fournisseur pour l'envoyer.
- **FR-002**: L'API MUST accepter seulement JPEG, PNG ou WebP, d'après le contenu du fichier, et 5 242 880 octets au plus ; sinon elle refuse avec `415` ou `413` et un message en français, sans rien stocker.
- **FR-003**: L'API MUST relever la largeur et la hauteur réelles de l'image, après prise en compte de son orientation, et les enregistrer avec elle.
- **FR-004**: Le chemin entre le Back Office et l'API MUST laisser passer une image valide de 5 Mo, en local comme sous la limite d'environ 4,5 Mo d'un hébergement de type Vercel. Pour cela, deux mécanismes s'ajoutent :
  - **Dans le navigateur, avant l'envoi :**
    - un fichier choisi de plus de 5 242 880 octets, ou d'un type autre que JPEG, PNG ou WebP, est refusé tout de suite, avec le même message que l'API ;
    - un fichier accepté est réduit : son côté le plus long est ramené à 3000 px au plus, sans jamais agrandir, et il est ré-encodé en JPEG ou en WebP, en respectant son orientation ;
    - si le navigateur ne sait pas réduire l'image, le fichier d'origine est envoyé tel quel.
  - **Côté serveur du Back Office :** la limite d'envoi est relevée à environ 6 Mo, pour qu'un original de 5 Mo passe aussi.

  L'API garde ses propres contrôles (FR-002) sur ce qu'elle reçoit. Aucune dépendance n'est ajoutée.
- **FR-005**: Une erreur du fournisseur MUST devenir « Service indisponible. » pour l'administrateur ; le contenu concerné n'est pas modifié.

**Données**

- **FR-006**: Un membre MUST pouvoir porter un portrait (zéro ou un) ; une action et une actualité MUST pouvoir porter de 0 à 20 photographies ordonnées, la première étant la principale. Chaque image porte : adresse, dimensions, texte alternatif (obligatoire, 1 à 300 caractères), légende (facultative, 300 au plus), crédit (facultatif, 120 au plus), et les métadonnées de fichier de `MediaRef`.
- **FR-007**: Les lectures publiques MUST exposer, pour chaque image, seulement l'adresse, les dimensions, le texte alternatif, la légende, le crédit et le point d'intérêt. L'identifiant interne chez le fournisseur, le nom de fichier d'origine et le poids MUST NOT y figurer.
- **FR-008**: Le portrait MUST apparaître dans les lectures publiques des membres (annuaire), sans exposer l'email ni le téléphone, qui restent absents.
- **FR-009**: Dans le panneau de saisie d'une image, l'administrateur MUST pouvoir fixer son point d'intérêt (`focus`) par un clic sur la vignette, qui y place un repère visible. La valeur est enregistrée en pourcentages entiers (par exemple « 50% 30% »). Par défaut, le point est au centre (« 50% 50% »), et « Recentrer » l'y remet. Le repère se place aussi au clavier, par les flèches, pas de 5 %. Le Front Office utilise ce point au recadrage (FR-017).

**Back Office**

- **FR-010**: Sur la fiche d'un membre, l'administrateur MUST pouvoir ajouter, remplacer et retirer le portrait, avec son texte alternatif et, facultativement, sa légende et son crédit.
- **FR-011**: Sur la fiche d'une action et d'une actualité, l'administrateur MUST pouvoir :
  - ajouter des photographies, une à la fois ou plusieurs à la suite ;
  - modifier leur texte alternatif, leur légende et leur crédit ;
  - les retirer, avec confirmation ;
  - les réordonner (monter, descendre), comme l'ordre des mandats.
- **FR-012**: Une image MUST s'ajouter seulement à un contenu qui existe déjà : sur la fiche d'un membre, d'une action ou d'une actualité, jamais dans un formulaire de création. Le formulaire de création l'annonce en une ligne : « Les photographies s'ajoutent sur la fiche, après l'enregistrement. » (« Le portrait s'ajoute… » pour un membre). Chaque envoi rattache l'image à son contenu dans la même opération : aucun fichier ne reste chez le fournisseur sans contenu, hormis une interruption pendant cette opération.
- **FR-013**: Le Back Office MUST montrer pour chaque image une vignette, ses dimensions en chiffres tabulaires et, sous les largeurs minimales de `DESIGN.md` (1200 px pour un portrait, 1600 px pour une photographie), l'avertissement « Image plus petite que la largeur conseillée : elle sera affichée en petit. » Il ne bloque pas l'enregistrement.
- **FR-014**: L'aperçu des listes de la fonctionnalité 010 MUST montrer le portrait d'un membre, et la photographie principale d'une action et d'une actualité, quand ils existent.
- **FR-015**: L'interface de saisie MUST suivre `apps/admin/DESIGN.md` : coins de 2 px, filets, panneau latéral pour la saisie d'une image, messages d'erreur sous le champ, avis après chaque opération, confirmation des retraits.

**Front Office**

- **FR-016**: Partout où le Front Office montre aujourd'hui le gabarit d'une image de contenu, il MUST montrer l'image réelle quand elle existe :
  - portrait : page Membres et aperçu des membres de l'accueil ;
  - photographie principale d'une action : page Actions et dernières actions de l'accueil ;
  - photographie principale d'une actualité : actualité à la une et registre de la page Actualités ;
  - photographies suivantes d'une action ou d'une actualité : la planche du dépliant « en savoir plus » que ces pages montrent déjà.

  Sans image, le gabarit reste.
- **FR-017**: Le Front Office MUST respecter `DESIGN.md`, section 7 :
  - le texte alternatif est toujours posé ;
  - la légende apparaît sous une photographie de contenu quand elle existe ;
  - le crédit seulement s'il est renseigné ;
  - le point d'intérêt est conservé au recadrage ;
  - aucune image n'est agrandie au-delà de sa taille d'origine ;
  - une image trop petite pour un grand emplacement passe dans un emplacement plus petit, ou garde le gabarit.
- **FR-018**: Le Front Office MUST servir chaque image à une taille adaptée à son affichage, sans livrer le fichier d'origine de plusieurs mégaoctets sur téléphone.

**Ménage**

- **FR-019**: La suppression d'un membre, d'une action ou d'une actualité MUST retirer ses fichiers du stockage ; un fichier déjà absent ne l'empêche pas. Si le stockage est indisponible, la suppression est refusée avec « Service indisponible. » et rien n'est supprimé.
- **FR-020**: Le retrait ou le remplacement d'une image MUST retirer l'ancien fichier du stockage une fois l'enregistrement réussi.

### Key Entities

- **Image (MediaRef)** : un fichier image chez le fournisseur et ce qui le décrit. Champs : adresse publique, identifiant chez le fournisseur, nom d'origine, type, poids, largeur, hauteur, texte alternatif, légende, crédit, point d'intérêt. Elle est embarquée dans son contenu et n'existe pas seule.
- **Membre** : gagne un portrait facultatif (une image).
- **Action, Actualité** : gagnent chacune une liste ordonnée de 0 à 20 photographies ; la première est la principale.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: L'administrateur ajoute une photographie de 5 Mo, avec son texte alternatif, à une action en moins d'une minute sur une connexion domestique ordinaire.
- **SC-002**: 100 % des fichiers refusés (type non accepté, plus de 5 Mo, contenu déguisé) le sont avec un message en français, sans fichier laissé chez le fournisseur.
- **SC-003**: Après la suppression d'un contenu, ou le retrait ou le remplacement d'une image, 0 fichier orphelin est constaté chez le fournisseur sur un échantillon de 10 opérations.
- **SC-004**: Sur la page Actions, sur téléphone, aucune image livrée ne pèse plus de 500 Ko.
- **SC-005**: 100 % des images affichées par le site portent un texte alternatif non vide.
- **SC-006**: Aucune requête du navigateur vers l'API ni vers le fournisseur n'est observée pendant un envoi depuis le Back Office.
- **SC-007**: Les pages du site qui n'ont pas d'image gardent exactement leur gabarit actuel : aucune régression visuelle sur une base sans image.

## Assumptions

- Le compte du fournisseur est celui des CV ; son quota gratuit suffit pour quelques centaines d'images.
- Les images sont publiques chez le fournisseur : le site doit pouvoir les afficher sans session. Les CV restent privés.
- Le Front Office lit les images par les lectures publiques existantes, avec la même revalidation d'environ 60 secondes ; une image ajoutée apparaît donc sur le site en une minute environ.
- Le site n'a pas de page propre à une action ou à une actualité : la photographie principale s'affiche dans les listes, les suivantes dans la planche du dépliant que le Front Office prévoit déjà.
- La légende est facultative à la saisie. `DESIGN.md` demande une légende réelle sous une photographie de contenu ; sans légende, le site n'en invente pas.
- Un seul administrateur : aucun conflit d'édition simultanée n'est traité.
