# Feature Specification: Réglages du site

**Feature Branch**: `012-site-settings`

**Created**: 2026-10-13

**Status**: Clarifications closes le 2026-10-13 (Q1, Q2) — en attente de validation avant le plan

**Input**: User description: « Fonctionnalité 012 « Réglages du site » : permettre à l'administrateur de renseigner dans le Back Office les contenus du Front Office qui sont aujourd'hui écrits dans le code et signalés comme à fournir par le club : adresses des réseaux sociaux (Facebook, Instagram ; config/site.ts), présentation du club de la section « Qui sommes-nous ? » de l'accueil (content/home.ts, about.pending : année de création, club parrain, nombre de membres, lieu et rythme des réunions), réponses de la FAQ de « Nous rejoindre » encore sans réponse (« Qui peut candidater ? », « À quelle fréquence le club se réunit-il ? » ; content/join.ts), et photographies fixes du site (accueil : ouverture, « Le club » 4:5, appel « Nous rejoindre » 4:5 ; Actions : ouverture 4:5 et détail 3:2 ; Membres : ouverture 2:1 ; Nous rejoindre : ouverture 4:5), stockées chez Cloudinary par l'API comme les images de la fonctionnalité 011 (texte alternatif, légende, crédit, point d'intérêt, 5 Mo max). Le Front Office lit ces réglages par src/data/* et garde ses emplacements tant qu'un réglage est vide ; la photo d'ouverture actuelle reste le repli de l'accueil. »

**Références** :
- `ARCHITECTURE.md` : section 1 (entités), section 2 (`MediaRef`, `StorageService`), section 6 (médias), section 10 (correspondance Front Office), section 14 (décisions verrouillées et ouvertes).
- `DESIGN.md` : section 7 (photographie : formats, largeurs minimales, légende, point d'intérêt), section 8 (emplacements sans contenu), section 9 (réseaux sociaux), section 17 (direction par page), « Points ouverts » 1 à 3.
- `apps/admin/DESIGN.md` : panneau image, point d'intérêt, formulaires.
- `PROJECT_CONTEXT.md` : section Back Office, « Hors de ce qui est construit ».
- `specs/011-image-storage/` : envoi, contrôle, réduction et ménage des images, réutilisés tels quels.
- `.specify/memory/constitution.md` : principes IV (pas de système générique), VI, VII, XII.

## Contexte et périmètre

Quatre sortes de contenus du site public ne viennent pas de l'API : elles sont écrites dans le code du Front Office, et plusieurs sont vides en attendant que le club les fournisse. Le site les signale aujourd'hui par un emplacement (`DESIGN.md`, section 8) ou par un pictogramme sans lien. Pour les remplir, il faut passer par le développeur. Cette fonctionnalité les rend modifiables dans le Back Office.

### Dans le périmètre

1. **Réseaux sociaux** : l'adresse de la page Facebook et celle du compte Instagram du club.
2. **Présentation du club** : cinq informations séparées (année de création, club parrain, nombre de membres, lieu des réunions, rythme des réunions), mises en forme par le site dans la section « Qui sommes-nous ? » de l'accueil, à la place de la mention « Présentation à compléter ».
3. **Réponses de la FAQ** de la page « Nous rejoindre » : les réponses des six questions ; les deux sans réponse aujourd'hui (« Qui peut candidater ? », « À quelle fréquence le club se réunit-il ? ») et les quatre dont la réponse est écrite dans le code. Les questions elles-mêmes restent fixes.
4. **Photographies fixes du site**, sept emplacements (tableau ci-dessous), avec texte alternatif, légende, crédit et point d'intérêt.
5. **Back Office** : un écran « Site » qui regroupe ces réglages.
6. **Front Office** : lecture de ces réglages à la place des valeurs écrites dans le code, emplacements gardés tant qu'un réglage est vide.

| Emplacement | Page | Format | Repli sans photo |
|---|---|---|---|
| Ouverture | Accueil | 16:9 ou plus large | La photographie actuelle (distribution d'eau) |
| « Le club » | Accueil | 4:5 | Gabarit « Photographie à venir » |
| Appel « Nous rejoindre » | Accueil | 4:5 | Gabarit |
| Ouverture, grande | Actions | 4:5 | Gabarit |
| Ouverture, détail | Actions | 3:2 | Gabarit |
| Ouverture | Membres | 2:1 | Gabarit |
| Ouverture | Nous rejoindre | 4:5 | La photo d'ouverture de l'accueil, recadrée (comportement actuel) |

### Hors périmètre

- Les autres textes du site (titres, accroches, valeurs, domaines d'action, parcours, libellés) : ils restent dans le code. `DESIGN.md` les laisse ouverts (« Points ouverts », 3), mais un éditeur de tous les textes serait un système générique (constitution, principe IV).
- L'ajout ou le retrait de questions de la FAQ, et l'ajout d'autres réseaux sociaux que Facebook et Instagram (`DESIGN.md`, section 9).
- Le logo, la famille d'icônes, le nom et le lieu du club.
- Une médiathèque, un historique des versions, un aperçu du site depuis le Back Office.
- La version anglaise (contenus en français seulement, architecture inchangée sur ce point).
- Les tests automatisés (constitution, principe IX).

## Ce qui est déjà verrouillé

- **Images** (fonctionnalité 011, `ARCHITECTURE.md`, décision 10) : JPEG, PNG ou WebP, 5 Mo au plus, type constaté sur le contenu ; envoi navigateur → serveur du Back Office → API → fournisseur, jamais en direct ; réduction dans le navigateur ; texte alternatif obligatoire ; identifiant du fournisseur jamais exposé ; ancien fichier retiré au remplacement.
- **Back Office** : le navigateur n'appelle jamais l'API ; lectures dans des composants serveur, écritures par actions serveur ; opérations sous `/admin`, protégées par JWT et le rôle `ADMIN`.
- **Front Office** : lecture des données uniquement par `src/data/*`, revalidation d'environ 60 secondes ; jamais d'appel aux opérations `/admin`.
- **Emplacements** (`DESIGN.md`, section 8) : rien n'est inventé ; un contenu manquant garde son emplacement.

## Points signalés avant rédaction

- **Nouvelle donnée hors des entités de l'API.** `ARCHITECTURE.md` (section 1) ne connaît que des contenus du club (années, membres, mandats, actions, actualités, candidatures). Ces réglages forment une donnée unique, propre au site. La décision d'architecture est à ajouter dans `ARCHITECTURE.md` avant le code (constitution, principe XII) ; sa forme se fixe dans le plan.
- **Photographies fixes et 011.** La spec 011 a mis « les photographies du site lui-même » hors de son périmètre, parce qu'elles n'étaient rattachées à aucun contenu. Elles le sont désormais aux réglages du site ; le mécanisme d'image de 011 est réutilisé sans changement.
- **Présentation du club et `DESIGN.md`.** Les cinq informations demandent une mise en forme que `DESIGN.md` ne décrit pas encore pour la section « Qui sommes-nous ? ». Elle est à proposer et à ajouter à `DESIGN.md` avant le code (CLAUDE.md, constitution principe XII) ; le plan la fixe.
- **Nombre de membres saisi à la main.** Il peut se périmer d'une année à l'autre ; c'est accepté (Q2). Le Back Office le rappelle sous le champ.

## Clarifications

### Session 2026-10-13

- Q: Quelles réponses de la FAQ deviennent modifiables ? → A: Les réponses des six questions ; les questions restent fixes (FR-008, FR-013).
- Q: La présentation du club est-elle un texte libre ou des champs séparés ? → A: Cinq champs séparés, mis en forme par le site (FR-008, FR-012) ; la mise en forme est ajoutée à `DESIGN.md` avant le code.

## User Scenarios & Testing *(mandatory)*

Vérifications manuelles uniquement (constitution, principe IX).

### User Story 1 - Remplacer les gabarits des photographies du site (Priority: P1)

L'administrateur ouvre l'écran « Site » du Back Office, choisit un emplacement (par exemple « Accueil · Le club »), y dépose une photographie du club, saisit son texte alternatif, sa légende et règle son point d'intérêt. Une minute plus tard, la page d'accueil montre cette photographie à la place du gabarit.

**Why this priority**: les gabarits photographiques sont l'élément « inachevé » le plus visible du site ; six emplacements sur sept n'ont aucune image.

**Independent Test**: déposer une photographie dans l'emplacement « Actions · ouverture, grande », vérifier la page Actions, la remplacer, puis la retirer et retrouver le gabarit.

**Acceptance Scenarios**:

1. **Given** l'écran « Site », **When** l'administrateur l'ouvre, **Then** il voit les sept emplacements, chacun avec sa page, son format, la description de l'image attendue et, s'il y en a une, la vignette de la photographie en place.
2. **Given** un emplacement vide, **When** il dépose une image valide avec un texte alternatif, **Then** elle est enregistrée et, après le délai de revalidation, la page concernée l'affiche dans le format de l'emplacement, recadrée sur le point d'intérêt.
3. **Given** un emplacement occupé, **When** il remplace l'image, **Then** la nouvelle s'affiche et l'ancien fichier est retiré du stockage.
4. **Given** un emplacement occupé, **When** il retire l'image et confirme, **Then** la page revient à son repli : la photographie actuelle pour l'ouverture de l'accueil, la photo de l'accueil recadrée pour « Nous rejoindre », le gabarit ailleurs.
5. **Given** un fichier refusé (type, poids) ou une image sans texte alternatif, **When** il l'envoie, **Then** le refus et son message sont ceux de la fonctionnalité 011, et rien n'est stocké.
6. **Given** une image plus étroite que la largeur conseillée de l'emplacement (2400 px pour l'ouverture de l'accueil et celle de Membres, 1600 px ailleurs), **When** il la dépose, **Then** le Back Office affiche l'avertissement de largeur de 011 sans bloquer l'enregistrement.

---

### User Story 2 - Relier les pictogrammes des réseaux sociaux (Priority: P1)

L'administrateur saisit l'adresse de la page Facebook et celle du compte Instagram du club. Les pictogrammes de l'en-tête, du pied de page et du menu du téléphone deviennent des liens.

**Why this priority**: c'est le plus petit changement, et le site affiche aujourd'hui des pictogrammes inactifs sur chaque page.

**Independent Test**: renseigner l'adresse Facebook seule, vérifier que son pictogramme est un lien qui s'ouvre sur la page du club et que celui d'Instagram reste sans lien.

**Acceptance Scenarios**:

1. **Given** l'écran « Site », **When** l'administrateur enregistre une adresse Facebook valide, **Then** le pictogramme Facebook devient un lien vers cette adresse partout où il apparaît.
2. **Given** une adresse qui n'est pas une adresse web complète en `https://`, ou qui ne correspond pas au réseau (une adresse Instagram dans le champ Facebook), **When** il enregistre, **Then** l'enregistrement est refusé avec un message sous le champ.
3. **Given** une adresse renseignée, **When** il vide le champ et enregistre, **Then** le pictogramme redevient inactif, avec son nom lisible « lien à venir » comme aujourd'hui.

---

### User Story 3 - Présenter le club et répondre aux questions fréquentes (Priority: P2)

L'administrateur renseigne les cinq informations de présentation du club (année de création, club parrain, nombre de membres, lieu et rythme des réunions) pour la section « Qui sommes-nous ? » de l'accueil, puis les réponses de la FAQ de « Nous rejoindre ». Sur le site, la mention « Présentation à compléter » laisse place aux informations saisies, et les questions jusque-là masquées apparaissent avec leur réponse.

**Why this priority**: ce sont des textes que seul le club peut écrire ; la page reste correcte sans eux, la mention et les questions masquées étant prévues pour l'attente.

**Independent Test**: saisir trois des cinq informations, vérifier l'accueil ; saisir la réponse à « À quelle fréquence le club se réunit-il ? », vérifier que la question apparaît sur « Nous rejoindre » ; vider la réponse et vérifier qu'elle disparaît.

**Acceptance Scenarios**:

1. **Given** une présentation vide, **When** on ouvre l'accueil, **Then** la mention « Présentation à compléter » s'affiche comme aujourd'hui.
2. **Given** l'écran « Site », **When** l'administrateur enregistre une ou plusieurs informations de présentation, **Then** l'accueil les affiche à la place de la mention, selon la mise en forme ajoutée à `DESIGN.md` ; une information vide n'apparaît pas, sans texte de substitution.
3. **Given** une année de création qui n'est pas une année à quatre chiffres entre 1968 et l'année en cours, ou un nombre de membres qui n'est pas un entier de 1 à 999, **When** il enregistre, **Then** l'enregistrement est refusé avec un message sous le champ.
4. **Given** une des deux questions sans réponse, **When** on ouvre « Nous rejoindre », **Then** elle n'apparaît pas, comme aujourd'hui.
5. **Given** l'écran « Site » jamais enregistré, **When** l'administrateur ouvre la partie « Textes », **Then** chaque réponse de la FAQ est pré-remplie avec la réponse que le site affiche aujourd'hui (vide pour les deux questions sans réponse).
6. **Given** l'écran « Site », **When** l'administrateur enregistre ou modifie une réponse, **Then** le site affiche la réponse enregistrée, à la place de la question, en paragraphes.
7. **Given** une des quatre questions qui ont une réponse dans le code, **When** l'administrateur vide sa réponse et enregistre, **Then** l'enregistrement est refusé avec « Cette question a besoin d'une réponse. » : ses questions ne se masquent pas, seules les deux nouvelles peuvent rester vides.
8. **Given** un texte trop long (au-delà des limites de FR-008), **When** il enregistre, **Then** l'enregistrement est refusé avec un message sous le champ.

---

### Edge Cases

- **Réglages jamais saisis** (base neuve) : le site s'affiche exactement comme aujourd'hui, emplacements et repli compris ; l'écran « Site » montre tous les champs vides.
- **API indisponible** pour le Front Office : le site garde ses emplacements et ses replis ; une page déjà en cache n'est pas remplacée par l'état vide (`ARCHITECTURE.md`, décision 20).
- **Stockage indisponible** au dépôt ou au retrait d'une image : « Service indisponible. » ; la photographie en place n'est pas modifiée.
- **Image retirée de l'ouverture de l'accueil** : le site revient à la photographie actuelle, qui reste livrée avec le site.
- **Adresse de réseau social avec espaces autour** : les espaces sont retirés avant le contrôle.
- **Texte collé avec des lignes vides multiples** : les paragraphes sont séparés par une ligne vide ; les lignes vides en trop sont ignorées, comme pour la description d'une action.
- **Présentation partielle** : seules les informations saisies s'affichent ; la mention « Présentation à compléter » ne revient que si les cinq sont vides.

## Requirements *(mandatory)*

### Functional Requirements

**Données**

- **FR-001**: Le système MUST conserver un seul ensemble de réglages du site, qui existe implicitement vide tant que rien n'a été saisi.
- **FR-002**: Les réglages MUST comprendre : l'adresse Facebook, l'adresse Instagram, les cinq informations de présentation du club, les réponses des six questions de la FAQ, et une image facultative pour chacun des sept emplacements du tableau du périmètre.
- **FR-003**: Chaque image MUST avoir la forme des images de 011 (adresse, dimensions, texte alternatif obligatoire, légende, crédit, point d'intérêt) et suivre les mêmes contrôles de type et de poids.

**Lecture publique**

- **FR-004**: Le système MUST offrir une lecture publique des réglages, sans authentification, qui ne renvoie que ce que le site affiche : adresses des réseaux sociaux, textes, et pour chaque image l'adresse, les dimensions, le texte alternatif, la légende, le crédit et le point d'intérêt. L'identifiant interne du fournisseur, le nom de fichier d'origine et le poids MUST NOT y figurer.
- **FR-005**: Un réglage vide MUST être absent ou vide dans la lecture publique, jamais remplacé par un texte de substitution.

**Back Office**

- **FR-006**: Le Back Office MUST offrir un écran « Site », accessible depuis la navigation principale comme les autres domaines, qui regroupe trois parties : « Photographies », « Réseaux sociaux », « Textes ».
- **FR-007**: Dans « Réseaux sociaux », l'administrateur MUST pouvoir saisir, modifier ou vider chaque adresse. Une adresse MUST commencer par `https://` et appartenir au domaine du réseau (`facebook.com` ou `fb.com` pour Facebook, `instagram.com` pour Instagram), 300 caractères au plus.
- **FR-008**: Dans « Textes », l'administrateur MUST pouvoir saisir, modifier ou vider :
  - la présentation du club, en cinq champs : année de création (année à quatre chiffres, de 1968 à l'année en cours), club parrain (120 caractères au plus), nombre de membres (entier de 1 à 999, avec sous le champ le rappel « À mettre à jour à chaque année Rotary. »), lieu des réunions (160 caractères au plus), rythme des réunions (160 caractères au plus) ;
  - la réponse de chacune des six questions de la FAQ (1000 caractères au plus, en paragraphes séparés par une ligne vide), présentée sous l'intitulé exact de sa question. Tant que rien n'a été enregistré, chaque champ est pré-rempli avec la réponse affichée aujourd'hui. Les deux questions sans réponse aujourd'hui peuvent rester vides ; les quatre autres MUST garder une réponse.
- **FR-009**: Dans « Photographies », chaque emplacement MUST montrer sa page, son format, la description de l'image attendue (celle du gabarit du site) et la photographie en place. L'administrateur MUST pouvoir y ajouter, remplacer, modifier (texte alternatif, légende, crédit, point d'intérêt) et retirer l'image, par le panneau image et le sélecteur de point d'intérêt de 011.
- **FR-010**: Le Back Office MUST afficher l'avertissement de largeur de 011 sous la largeur conseillée de chaque emplacement : 2400 px pour l'ouverture de l'accueil et celle de Membres, 1600 px pour les autres (`DESIGN.md`, section 7).
- **FR-011**: Les opérations MUST suivre les règles du Back Office : avis après chaque enregistrement, erreurs sous le champ, confirmation avant le retrait d'une image, états d'attente et d'erreur ; l'aspect suit `apps/admin/DESIGN.md`.

**Front Office**

- **FR-012**: Le Front Office MUST lire les réglages par `src/data/*` et les afficher :
  - les adresses : pictogrammes de l'en-tête, du pied de page et du menu du téléphone ;
  - la présentation : section « Qui sommes-nous ? » de l'accueil, à la place de la mention, chaque information saisie avec son intitulé, selon la mise en forme ajoutée à `DESIGN.md` ;
  - les réponses : FAQ de « Nous rejoindre », chaque question à sa place, avec la réponse enregistrée ou, à défaut, la réponse actuelle du code ;
  - les images : les sept emplacements du tableau, au format de chacun.
- **FR-013**: Un réglage vide MUST laisser la page exactement dans son état actuel : pictogramme sans lien et nom « lien à venir », mention « Présentation à compléter » (si les cinq informations sont vides), question masquée (pour les deux sans réponse dans le code) ou réponse actuelle du code (pour les quatre autres), gabarit ou repli photographique du tableau.
- **FR-014**: Les images MUST suivre `DESIGN.md`, section 7, comme celles de 011 : texte alternatif posé, point d'intérêt gardé au recadrage, jamais agrandies au-delà de leur taille d'origine, servies à une taille adaptée à l'écran. Le voile de l'ouverture de l'accueil et la signature posée dessus restent inchangés.
- **FR-015**: Une modification enregistrée MUST apparaître sur le site après le délai de revalidation habituel, environ 60 secondes.

**Ménage**

- **FR-016**: Le retrait ou le remplacement d'une image MUST retirer l'ancien fichier du stockage une fois l'enregistrement réussi ; si le stockage est indisponible au retrait, l'image reste en place et « Service indisponible. » s'affiche.

### Key Entities

- **Réglages du site** : un ensemble unique pour tout le site. Porte deux adresses de réseaux sociaux, cinq informations de présentation du club, les réponses des six questions de la FAQ (repérées par la question, pas par leur texte), et sept emplacements photographiques, chacun vide ou occupé par une image.
- **Image (MediaRef)** : celle de la fonctionnalité 011, embarquée dans les réglages ; elle n'existe pas seule.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: L'administrateur remplit les sept emplacements photographiques, les deux adresses et les textes sans intervention du développeur, en moins de 20 minutes avec ses fichiers prêts.
- **SC-002**: Sur une base où les réglages n'ont jamais été saisis, les cinq pages du site sont identiques à leur état actuel : aucune régression visuelle.
- **SC-003**: Une modification enregistrée dans l'écran « Site » est visible sur le site en moins de deux minutes.
- **SC-004**: 100 % des images des emplacements fixes affichées par le site portent un texte alternatif non vide.
- **SC-005**: Après dix remplacements ou retraits d'images, aucun fichier orphelin n'est constaté chez le fournisseur.
- **SC-006**: Aucune requête du navigateur vers l'API ni vers le fournisseur n'est observée depuis l'écran « Site ».

## Assumptions

- Les réglages sont modifiés rarement ; un seul administrateur, donc aucun conflit d'édition simultanée n'est traité.
- La photographie d'ouverture actuelle reste livrée avec le Front Office comme repli ; elle n'est pas déplacée chez le fournisseur.
- Les descriptions d'image attendue affichées dans le Back Office reprennent celles des gabarits du site (par exemple « Un moment de camaraderie. »).
- Le compte du fournisseur et ses variables sont ceux de 011 ; aucune variable d'environnement nouvelle.
- La lecture publique des réglages suit la même revalidation d'environ 60 secondes que les autres lectures du Front Office.
- Aucune dépendance n'est ajoutée.
