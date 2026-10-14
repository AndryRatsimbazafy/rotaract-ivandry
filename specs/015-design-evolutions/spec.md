# Feature Specification: Évolutions design du site public

**Feature Branch**: `015-design-evolutions`

**Created**: 2026-10-13

**Status**: Clarification close le 2026-10-13 : en attente du plan

**Input**: User description: « Fonctionnalité 015 « Évolutions design du site public », une seule fonctionnalité avec cinq récits priorisés et livrables séparément, décision du porteur du projet (2026-10-13) : (1) images de partage générées pour chaque action et chaque actualité (titre et photo principale) et pour les pages fixes, utilisées par Facebook, Instagram, WhatsApp ; (2) galerie plein écran sur les pages de détail des actions et actualités (jusqu'à 20 photos), navigation clavier et balayage, légendes et crédits ; (3) nouvelle page « Le club » (histoire, club parrain, lien avec le Rotary, chiffres clés) ; (4) frise des années rotariennes : présidents et actions marquantes de chaque mandat ; (5) finitions téléphone (couleur de la barre d'état, zones de l'encoche, retour au toucher). Bilingue comme tout le site public (014). Doit respecter DESIGN.md (éditorial, documentaire, pas de grilles de cartes) ; aucune nouvelle dépendance sans justification. »

**Références** :
- `DESIGN.md` : sections 6 (composition), 7 (photographie : « Le Voile », texte sur image, légendes), 9 (interface), 12 (mouvement), 13 (accessibilité), 14 (responsive), 15 (interdits), 17 (direction par page), décisions verrouillées 9, 10, 11 et 13.
- `ARCHITECTURE.md` : sections 1 (entités Action, Membre, Mandat, Année Rotary, Réglages du site), 10 (Front Office), 14 (décisions).
- `PROJECT_CONTEXT.md` : pages du site, points d'attention.
- `specs/012-site-settings/` (fiche du club, photographies fixes), `specs/013-detail-pages/` (pages de détail), `specs/014-english-version/` (deux langues, repli français signalé).
- `.specify/memory/constitution.md` : principes I, VII, VIII, IX, XII.

## Contexte et périmètre

Le site public est complet et bilingue. Le porteur du projet veut le rendre plus présent hors du site (partages sur les réseaux), plus riche sur ses pages de détail (photographies), plus explicite sur le club lui-même (son histoire, ses mandats) et plus soigné sur téléphone. Il a choisi le 2026-10-13 de traiter ces cinq évolutions dans une seule fonctionnalité, chacune livrable seule.

### Dans le périmètre

1. **Images de partage** : chaque action publiée, chaque actualité publiée et chaque page fixe a une image de partage composée (photographie, titre, marque du club), dans la langue de la page, reprise par les réseaux et messageries quand on partage son adresse.
2. **Galerie plein écran** : sur une page de détail d'action ou d'actualité, chaque photographie s'ouvre en plein écran ; on passe de l'une à l'autre au clavier, aux boutons et au balayage ; légende et crédit restent lisibles.
3. **Page « Le club »** : une nouvelle page publique, en français et en anglais, qui présente l'histoire du club, son club parrain, son lien avec le Rotary et ses chiffres clés.
4. **Frise des années rotariennes** : pour chaque année Rotary, le ou les présidents du mandat et les actions marquantes de l'année, du plus récent au plus ancien.
5. **Finitions téléphone** : couleur de la barre d'état accordée au haut de page, contenu jamais masqué par l'encoche ni la barre d'accueil, retour visuel immédiat à l'appui sur les éléments touchables, sans surbrillance grise du navigateur.
6. **Documents** : `DESIGN.md` (direction de la page « Le club », de la frise, de la galerie et des images de partage), `PROJECT_CONTEXT.md` et `ARCHITECTURE.md` si un contenu nouveau doit être saisi, corrigés avant le code.

### Hors périmètre

- Toute image générée ou de banque d'images (`DESIGN.md`, section 7) : l'image de partage compose une photographie réelle du club, jamais une illustration inventée.
- La publication automatique sur Facebook ou Instagram : la fonctionnalité améliore l'aperçu d'un lien partagé, elle ne publie rien.
- Le téléchargement des photographies depuis la galerie, le zoom à l'intérieur d'une photographie, le diaporama automatique.
- Une galerie sur les pages de liste ou sur l'accueil.
- Le mode sombre (décision verrouillée 7) et l'installation du site comme application.
- Le Back Office, sauf le texte de l'histoire et l'emplacement photographique « club-ouverture » (écran « Site ») et la case « marquante » de la fiche d'action.

## Ce qui est déjà verrouillé

- **Rien d'inventé** (décision 10 de `DESIGN.md`, décision 1 d'`ARCHITECTURE.md`) : une donnée absente n'a pas de ligne, pas de chiffre approximatif, pas de texte de substitution.
- **Photographie documentaire** : texte sur image uniquement de l'étage graphique, en blanc, sur une image voilée (« Le Voile »).
- **Mouvement en réponse à un geste**, courbe unique en décélération, `prefers-reduced-motion` respecté ; aucun compteur animé.
- **Deux langues** (014) : chaque nouveau texte fixe existe en français et en anglais ; un contenu saisi sans traduction s'affiche en français, signalé.
- **Lecture des données** par `src/data/*` seulement ; aucune dépendance ajoutée pour le design (décision verrouillée 13).
- **Fonctions sans hiérarchie** et ordre des membres choisi par le club (`DESIGN.md`, section 17).

## Points signalés avant rédaction

- **Image de partage et section 7 de `DESIGN.md`** : la section 7 interdit les images générées. Une image de partage qui pose un titre sur une photographie réelle voilée suit les règles du texte sur image ; elle n'est pas une image générée au sens de la section 7. La précision est à écrire dans `DESIGN.md`.
- **Page « Le club » et navigation** : la section 17 de `DESIGN.md` décrit cinq pages et deux pages de détail ; la sixième page demande sa direction, et sa sixième entrée de navigation doit tenir dans l'en-tête sur ordinateur (Q2, FR-014).
- **Contenu de l'histoire** : aucun texte d'histoire du club n'existe aujourd'hui ; il sera saisi dans le Back Office (Q1, FR-012).
- **Instagram** n'affiche pas d'aperçu pour les liens d'une publication ; il en affiche dans les messages et les stories. Le critère de réussite porte sur Facebook, WhatsApp et les messages Instagram.

## Clarifications

### Session 2026-10-13

- Q1: D'où vient le texte de l'histoire du club ? → A: Saisi dans le Back Office, écran « Site », en français et en anglais facultatif (FR-012).
- Q2: « Le club » entre-t-il dans la navigation principale ? → A: Oui, en sixième entrée entre « Accueil » et « Actions » (FR-014).
- Q3: Quelles actions sont « marquantes » dans la frise ? → A: Celles que l'administrateur coche « marquante » dans la fiche d'action (FR-016).
- Q4: La page « Le club » a-t-elle ses propres photographies fixes ? → A: Un nouvel emplacement « club-ouverture » dans l'écran « Site » ; sans photo déposée, la page reprend `accueil-club`, puis le gabarit (FR-026).
- Q5: Combien d'actions marquantes une année peut-elle montrer ? → A: Trois au plus par année Rotary ; le Back Office refuse de cocher une quatrième action pour la même année (FR-016, FR-027).
- Q6: Quelle adresse donner à la page « Le club » ? → A: `/club`, et `/en/club` en anglais (FR-011).

## User Scenarios & Testing *(mandatory)*

Vérifications manuelles uniquement (constitution, principe IX).

### User Story 1 - Partager une action avec un bel aperçu (Priority: P1)

Un membre colle l'adresse d'une action dans un groupe WhatsApp ou sur Facebook. L'aperçu montre la photographie principale de l'action, voilée, avec son titre en blanc et la marque du club ; le lien donne envie d'être ouvert et on reconnaît le club au premier coup d'œil.

**Why this priority**: les réseaux sont le premier canal par lequel on découvre le club ; aujourd'hui l'aperçu montre la photographie seule, sans titre, ou rien.

**Independent Test**: partager l'adresse d'une action, d'une actualité et de la page « Nous rejoindre », en français puis en anglais, dans un outil d'aperçu de liens ; vérifier l'image, le titre et la langue.

**Acceptance Scenarios**:

1. **Given** une action publiée avec photographies, **When** on partage son adresse, **Then** l'aperçu montre sa photographie principale voilée, son titre et la marque du club.
2. **Given** la même action sur sa page anglaise, **When** on partage l'adresse `/en/…`, **Then** le titre de l'image est le titre anglais s'il existe, sinon le titre français.
3. **Given** une action ou une actualité sans photographie, **When** on la partage, **Then** l'image utilise la photographie d'ouverture du site, avec le titre du contenu.
4. **Given** une page fixe (accueil, Actions, Actualités, Membres, Nous rejoindre, Le club), **When** on la partage, **Then** l'aperçu montre une image propre à la page, avec son titre.
5. **Given** un titre très long, **When** l'image est composée, **Then** le titre tient dans l'image sans être coupé au milieu d'un mot, au besoin abrégé proprement.

---

### User Story 2 - Parcourir les photographies en plein écran (Priority: P1)

Sur la page d'une action, un visiteur touche une photographie de la planche : elle s'ouvre en plein écran, avec sa légende et son crédit. Il passe à la suivante d'un balayage sur téléphone, avec les flèches du clavier sur ordinateur, et referme avec Échap ou le bouton « Fermer » ; il retrouve la page là où il l'avait laissée.

**Why this priority**: une action peut avoir 20 photographies ; aujourd'hui elles ne se voient qu'en petit dans la page, alors que la photographie est le cœur de la direction documentaire.

**Independent Test**: sur une action à au moins trois photographies, ouvrir la galerie, parcourir au clavier, au balayage et aux boutons, refermer ; refaire au lecteur d'écran.

**Acceptance Scenarios**:

1. **Given** la page d'une action ou d'une actualité, **When** le visiteur active une photographie, **Then** elle s'affiche en plein écran, entière et non déformée, avec sa légende, son crédit et sa position (« 3 / 12 »).
2. **Given** la galerie ouverte, **When** il appuie sur flèche droite ou balaie vers la gauche, **Then** la photographie suivante s'affiche ; flèche gauche ou balayage vers la droite pour la précédente ; à la dernière, la suivante n'existe pas.
3. **Given** la galerie ouverte, **When** il appuie sur Échap ou active « Fermer », **Then** elle se ferme et le focus revient sur la photographie qui l'avait ouverte.
4. **Given** la galerie ouverte, **When** il navigue au clavier, **Then** le focus reste dans la galerie, chaque commande est nommée, et le changement de photographie est annoncé.
5. **Given** une page anglaise, **When** la galerie s'ouvre, **Then** les commandes sont en anglais et une légende sans traduction est déclarée en français.
6. **Given** un contenu avec une seule photographie, **When** elle s'ouvre, **Then** la galerie n'affiche ni position ni commandes de passage.

---

### User Story 3 - Découvrir le club sur sa propre page (Priority: P2)

Un étudiant qui hésite à rejoindre le club ou un partenaire qui veut le connaître ouvre « Le club » : il lit d'où vient le club, qui est son club parrain, ce qu'est le Rotaract dans le Rotary, et quelques chiffres réels (année de fondation, membres, actions menées).

**Why this priority**: l'accueil présente le club en une section ; une page dédiée sert la crédibilité auprès des partenaires et le recrutement, mais elle dépend d'un contenu que le club doit fournir.

**Independent Test**: ouvrir « Le club » en français et en anglais, avec puis sans fiche du club renseignée ; vérifier qu'aucune donnée absente n'apparaît.

**Acceptance Scenarios**:

1. **Given** le site, **When** le visiteur ouvre « Le club », **Then** il lit l'histoire du club, son club parrain, le lien Rotaract–Rotary et les chiffres clés, dans une composition propre à la page.
2. **Given** une fiche du club incomplète, **When** la page s'affiche, **Then** un chiffre ou une information absente n'a pas de ligne, sans mention « à venir » au milieu des chiffres.
3. **Given** la page anglaise, **When** elle s'affiche, **Then** les textes fixes sont en anglais et un contenu saisi sans traduction est en français, signalé.
4. **Given** la navigation du site, **When** le visiteur cherche la page, **Then** il la trouve depuis l'en-tête ou le menu du téléphone et depuis la section « Le club » de l'accueil.

---

### User Story 4 - Remonter les années du club (Priority: P3)

Un ancien membre ou un partenaire parcourt la frise : pour chaque année Rotary, du plus récent au plus ancien, il voit qui présidait et quelles actions ont marqué l'année, et peut ouvrir chacune d'elles.

**Why this priority**: elle donne de la profondeur au club et valorise les mandats passés, mais elle n'a de sens qu'avec plusieurs années renseignées.

**Independent Test**: avec trois années Rotary dont une sans président et une sans action, ouvrir la frise et vérifier chaque année.

**Acceptance Scenarios**:

1. **Given** des années Rotary avec mandats et actions publiées, **When** le visiteur ouvre la frise, **Then** chaque année montre son ou ses présidents et ses actions marquantes, l'année la plus récente en premier.
2. **Given** une année avec deux présidents, **When** elle s'affiche, **Then** les deux noms apparaissent, dans l'ordre choisi par le club.
3. **Given** une année sans président enregistré ni action, **When** la frise s'affiche, **Then** l'année n'apparaît pas ; avec l'un des deux seulement, elle montre ce qui existe, sans mention de manque.
4. **Given** une action marquante, **When** le visiteur l'active, **Then** il arrive sur sa page de détail, dans la langue courante.

---

### User Story 5 - Un site qui se tient sur téléphone (Priority: P2)

Un visiteur ouvre le site sur son téléphone : la barre d'état prend la couleur du haut de page, rien n'est caché sous l'encoche ou la barre d'accueil, et chaque appui sur un lien ou un bouton donne un retour immédiat, sans flash gris.

**Why this priority**: la majorité des visiteurs arrivent par téléphone depuis les réseaux ; ces finitions sont courtes à faire et changent l'impression générale.

**Independent Test**: sur un iPhone à encoche et un téléphone Android réels, en portrait puis en paysage, ouvrir l'accueil, le menu, une page de détail et la galerie.

**Acceptance Scenarios**:

1. **Given** un téléphone, **When** une page s'ouvre, **Then** la barre d'état ou du navigateur prend la couleur du haut de la page.
2. **Given** un téléphone à encoche en paysage, **When** une page s'affiche, **Then** aucun texte ni commande n'est masqué par l'encoche ou la barre d'accueil, menu et galerie compris.
3. **Given** un écran tactile, **When** le visiteur appuie sur un lien, un bouton ou une photographie cliquable, **Then** un retour visuel apparaît dès l'appui, sans surbrillance grise ou bleue du navigateur.
4. **Given** le formulaire de candidature sur iPhone, **When** un champ prend le focus, **Then** la page ne s'agrandit pas toute seule et le zoom manuel reste possible.

---

### Edge Cases

- **Photographie principale très verticale ou petite** pour l'image de partage : le cadrage garde le point d'intérêt ; une image trop petite cède la place à la photographie d'ouverture du site.
- **Image de partage mise en cache** par un réseau après modification d'un titre : l'image suit le nouveau titre au prochain rafraîchissement de l'aperçu.
- **Contenu dépublié** : son image de partage n'est plus servie (404), comme sa page.
- **Galerie et photographie absente ou en erreur** : la galerie passe à la suivante disponible, sans cadre vide.
- **Galerie ouverte puis rotation de l'écran** : la photographie reste entière, la position est conservée.
- **Balayage vertical dans la galerie** : n'est pas pris pour un passage de photographie ; il peut fermer la galerie s'il est franc.
- **Mouvement réduit** : la galerie change de photographie sans glissement.
- **Frise sans aucune année exploitable** : la section ou la page ne s'affiche pas, ou se réduit à un texte de présentation, sans frise vide.
- **Membre président sur plusieurs années** : il apparaît à chacune de ses années.
- **Changement d'année d'une action marquée** : une action appartient à une seule année Rotary ; si on la déplace vers une année qui compte déjà trois actions marquantes, l'enregistrement est refusé (FR-027).
- **Quatrième action marquante** pour une même année : refusée à l'enregistrement (FR-027) ; une action marquée mais non publiée compte quand même dans la limite, pour que sa publication ne fasse pas dépasser trois.
- **Page « Le club » sans histoire saisie** : la page reste cohérente avec le lien Rotary et les chiffres, sans paragraphe de substitution.

## Requirements *(mandatory)*

### Functional Requirements

**Images de partage (récit 1)**

- **FR-001**: Chaque action publiée, actualité publiée et page fixe MUST déclarer une image de partage composée de sa photographie principale (à défaut, la photographie d'ouverture du site), voilée, de son titre en blanc et de la marque du club, au format recommandé pour les aperçus de liens (environ 1,91:1).
- **FR-002**: L'image de partage MUST être dans la langue de la page : titre anglais sur une adresse `/en`, titre français en repli.
- **FR-003**: L'image MUST suivre `DESIGN.md` : couleurs et polices de la charte, Voile à 50 %, aucun paragraphe, étiquette ou bouton sur l'image, aucun visage coupé par le titre quand un point d'intérêt est connu.
- **FR-004**: Un titre trop long pour l'image MUST être abrégé à la fin d'un mot, jamais coupé au milieu ni débordant.
- **FR-005**: L'image d'un contenu non publié ou inexistant MUST ne pas être servie.

**Galerie plein écran (récit 2)**

- **FR-006**: Chaque photographie d'une page de détail d'action ou d'actualité MUST pouvoir s'ouvrir en plein écran, entière, non déformée, à une taille adaptée à l'écran.
- **FR-007**: La galerie MUST permettre de passer à la photographie suivante ou précédente au clavier (flèches), par des boutons nommés et par balayage horizontal, et de se fermer par Échap, un bouton « Fermer » et le retour du navigateur.
- **FR-008**: La galerie MUST afficher la légende, le crédit s'il existe et la position, retenir le focus tant qu'elle est ouverte, annoncer le changement de photographie et rendre le focus à son point d'ouverture à la fermeture.
- **FR-009**: Les commandes et annonces de la galerie MUST exister en français et en anglais ; une légende ou un texte alternatif non traduit MUST être déclaré en français.
- **FR-010**: Le passage d'une photographie à l'autre MUST suivre la section 12 de `DESIGN.md` (durée, courbe) et se faire sans glissement quand le mouvement réduit est demandé.

**Page « Le club » (récit 3)**

- **FR-011**: Le site MUST offrir une page « Le club » en français et en anglais, à l'adresse `/club` et, en anglais, `/en/club`, avec sa composition propre décrite dans `DESIGN.md`, section 17.
- **FR-012**: La page MUST présenter l'histoire du club, dont le texte est saisi par l'administrateur dans le Back Office, écran « Site », en français et, facultativement, en anglais (Q1) ; sans texte saisi, la page s'affiche sans paragraphe d'histoire ni texte de substitution.
- **FR-013**: La page MUST présenter les chiffres clés à partir de données réelles seulement : année de fondation et nombre de membres de la fiche du club, nombre d'actions publiées, nombre d'années Rotary représentées ; un chiffre absent n'a pas de ligne ; aucun compteur animé.
- **FR-026**: La page MUST s'ouvrir sur une photographie fixe propre, déposée dans l'écran « Site » sur un huitième emplacement « club-ouverture » avec son texte alternatif et sa légende (français et anglais) ; sans photographie déposée, elle reprend la photographie de la section « Le club » de l'accueil, puis le gabarit « Photographie à venir ». Son image de partage utilise la même photographie.
- **FR-014**: La page MUST être accessible depuis la navigation principale, en sixième entrée placée entre « Accueil » et « Actions », dans l'en-tête et le menu du téléphone (Q2), depuis la section « Le club » de l'accueil, et figurer dans le pied de page.

**Frise des années rotariennes (récit 4)**

- **FR-015**: La frise MUST présenter, pour chaque année Rotary ayant au moins un président enregistré ou une action marquante, le ou les présidents de l'année (dans l'ordre choisi par le club) et ses actions marquantes, de l'année la plus récente à la plus ancienne.
- **FR-016**: Les actions marquantes d'une année MUST être les actions publiées de l'année que l'administrateur a marquées « marquante » dans le Back Office (Q3) ; une action non publiée n'apparaît jamais, même marquée.
- **FR-027**: Une année Rotary MUST compter au plus trois actions marquées « marquante » ; l'enregistrement d'une action marquée qui ferait dépasser ce nombre pour son année Rotary, à la création, à la modification ou au changement d'année, MUST être refusé avec un message qui nomme l'année concernée, et l'action reste enregistrable sans la case.
- **FR-017**: Chaque action de la frise MUST mener à sa page de détail dans la langue courante ; son titre suit la règle de repli de 014.
- **FR-018**: La frise MUST vivre sur la page « Le club », dans une composition éditoriale (filet et années en très grand, pas de grille de cartes), lisible sur une colonne au téléphone.

**Finitions téléphone (récit 5)**

- **FR-019**: Le site MUST déclarer une couleur de barre d'état accordée au haut de ses pages.
- **FR-020**: Le contenu MUST s'étendre sous l'encoche et la barre d'accueil tout en gardant textes et commandes hors de ces zones, en-tête fixe, menu du téléphone et galerie compris.
- **FR-021**: Sur écran tactile, chaque élément touchable MUST donner un retour visuel dès l'appui (changement de couleur, section 12 de `DESIGN.md`), la surbrillance par défaut du navigateur étant supprimée ; le délai d'appui du navigateur MUST être supprimé.
- **FR-022**: Les champs de formulaire MUST avoir une taille de texte qui n'entraîne pas d'agrandissement automatique ; le zoom manuel MUST rester autorisé.

**Transverse**

- **FR-023**: Tous les nouveaux textes fixes MUST exister dans les deux dictionnaires (français et anglais).
- **FR-024**: `DESIGN.md` MUST décrire, avant le code, la direction de la page « Le club » et de la frise, la galerie plein écran, l'image de partage et les finitions téléphone ; `PROJECT_CONTEXT.md` et `ARCHITECTURE.md` MUST être mis à jour si un contenu nouveau est saisi.
- **FR-025**: Les pages existantes MUST rester identiques, hormis l'ouverture des photographies en galerie, l'entrée vers « Le club » et les finitions téléphone.

### Key Entities

- **Image de partage** : image composée à la demande pour une page dans une langue ; ni enregistrée ni saisie.
- **Action** : gagne une indication « marquante », cochée par l'administrateur dans sa fiche ; décochée par défaut ; trois au plus par année Rotary (Q3, FR-027).
- **Mandat** : la fonction « président » d'une année désigne le ou les présidents de la frise ; inchangé.
- **Réglages du site** : gagnent le texte de l'histoire du club, en paragraphes, en français et en anglais facultatif (Q1), et un huitième emplacement photographique « club-ouverture ».

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % des actions et actualités publiées et des six pages fixes montrent un aperçu avec image et titre quand on partage leur adresse sur Facebook, WhatsApp et dans un message Instagram, dans la langue de l'adresse.
- **SC-002**: Un visiteur parcourt les 20 photographies d'une action en plein écran au clavier seul, puis au balayage seul, sans jamais perdre le focus ni voir une photographie déformée ou coupée.
- **SC-003**: La galerie s'ouvre en moins d'une seconde après l'appui sur un téléphone de milieu de gamme.
- **SC-004**: La page « Le club » et la frise n'affichent aucune donnée inventée : chaque chiffre et chaque nom se retrouvent dans le Back Office.
- **SC-005**: Sur un iPhone à encoche et un téléphone Android réels, 0 texte ou commande masqué par l'encoche ou la barre d'accueil, en portrait et en paysage.
- **SC-006**: Sur écran tactile, 100 % des éléments touchables donnent un retour visuel dès l'appui ; aucun flash gris n'apparaît.
- **SC-007**: Aucune page existante ne présente de régression visuelle en dehors des changements prévus (FR-025), dans les deux langues.

## Assumptions

- Les images de partage sont produites par le site lui-même, sans service externe ni dépendance nouvelle ; leur justification éventuelle est écrite dans le plan.
- L'aperçu des réseaux dépend de leur propre cache ; la fonctionnalité garantit l'image servie, pas le délai de rafraîchissement des réseaux.
- La fonction « président » du mandat désigne les présidents de la frise ; aucune autre fonction n'y figure.
- La galerie reprend les photographies déjà saisies (photographie principale comprise) dans leur ordre ; elle n'ajoute aucun champ.
- Les finitions téléphone se vérifient sur appareil réel ; l'émulation du navigateur ne suffit pas.
- Aucune dépendance n'est ajoutée sans justification écrite dans le plan.
