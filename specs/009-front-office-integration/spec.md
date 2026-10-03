# Feature Specification: Intégration du Front Office avec l'API

**Feature Branch**: `009-front-office-integration`

**Created**: 2026-10-02

**Status**: Clarifications closes le 2026-10-02 (Q1, Q2, Q3, P1, P2, P3) — en attente de validation avant le plan

**Input**: User description: « Feature 009 — intégration du Front Office avec l'API. Le Front Office existant dans `apps/web` doit consommer les API réelles déjà disponibles au lieu de son contenu statique ou provisoire : accueil, `/actions`, `/actualites`, `/membres`, `/rejoindre` (formulaire relié au dépôt d'une candidature). Le design existant reste la source de vérité visuelle ; `DESIGN.md` reste applicable ; ni le Back Office ni l'API ne sont modifiés ; aucun contenu métier n'est fabriqué ; jamais de faux « Donnée à venir » ; date des actualités dans le fuseau approprié ; vérifications manuelles seulement. »

**Références** : `ARCHITECTURE.md` (sections 0, 1, 6 « Public », 8, 9, 10, 12, 13, 14 décisions 12, 13, 15, 19 et décisions ouvertes, 15 étape 8), `DESIGN.md` (sections 8, 9, 10, compositions des pages), `PROJECT_CONTEXT.md` (sections « apps/web », « Points d'attention »), `CLAUDE.md`, `.specify/memory/constitution.md` (principes I, IV, VII, VIII, IX, XII et « Décisions ouvertes »), les contrats de l'API (`specs/001-api-foundation/contracts/errors.md`, `specs/002-rotary-years/contracts/rotary-years.md`, `specs/004-members/contracts/members.md`, `specs/005-actions/contracts/actions.md`, `specs/006-news/contracts/news.md`, `specs/007-applications/contracts/applications.md`), et le code de `apps/web` (`src/data/`, `src/types/`, `src/lib/`, `src/content/`, `src/app/`).

## Contexte et périmètre

Le Front Office V1 est terminé et audité : cinq pages, sur des **données locales**. Ses pages ne lisent leurs données que par les fonctions de `apps/web/src/data/` ; ces fonctions renvoient aujourd'hui des listes vides, des profils de démonstration, et un formulaire de candidature qui ne transmet rien.

L'API expose désormais les lectures publiques des années Rotary, des membres, des actions et des actualités, et le dépôt d'une candidature (fonctionnalités 002 à 007). Le Back Office (008) permet au club de saisir ce contenu.

Cette fonctionnalité **relie le Front Office à l'API** : ce que l'administrateur publie dans le Back Office devient visible sur le site, et une candidature envoyée par le formulaire arrive réellement au club. C'est l'étape 8 d'`ARCHITECTURE.md`, section 15. Elle ne change ni le design, ni l'API, ni le Back Office.

### Dans le périmètre

1. L'accueil : actions récentes, actualités récentes, aperçu des membres, année Rotary affichée.
2. La page Actions : liste, filtres par année Rotary et par domaine, fiche dépliable, impact quand il existe.
3. La page Actualités : actualité à la une, fil, rubriques, archives par année Rotary, texte dépliable, date dans le fuseau du club.
4. La page Membres : annuaire d'une année, fonctions, profession ou études, ordre choisi par le club, index des fonctions, choix de l'année.
5. La page Rejoindre : envoi réel de la candidature et de son CV, messages de refus.
6. Le comportement quand un contenu n'existe pas encore, quand un filtre ne donne rien, et quand l'API ne répond pas.
7. L'alignement de `DESIGN.md` et d'`ARCHITECTURE.md` sur les décisions de cette spec (P1, P2, P3, Q1), avant le code.

### Hors périmètre

- Toute modification de `apps/api` et de `apps/admin`. Un besoin que l'API ne couvre pas est **signalé**, pas résolu en la modifiant.
- Toute refonte visuelle : compositions, typographie, couleurs, grille et composants de `DESIGN.md` sont conservés.
- Les photographies et les portraits : l'API n'en fournit aucun (le fournisseur des images reste une décision ouverte). Les emplacements photographiques gardent leur gabarit.
- Les contenus éditoriaux du site (présentation du club, valeurs, domaines d'action, parcours d'adhésion, questions fréquentes, réseaux sociaux) : ils ne viennent d'aucune API.
- Le registre d'impact agrégé de la page Actions : aucune entité ne le porte (décision ouverte d'`ARCHITECTURE.md`) ; sa section est supprimée du site (P1), rien ne le remplace.
- Les pages de détail à adresse propre (`/actions/<slug>`, `/actualites/<slug>`) : le Front Office déplie le détail dans la liste ; ces pages restent « à venir » dans l'architecture.
- La recherche par mot dans les actions et les actualités : aucune page n'en propose aujourd'hui.
- L'anglais ; toute protection anti-spam au-delà de la limite de fréquence de l'API ; tout email automatique.
- Les tests automatisés (constitution, principe IX), Docker, CI/CD, déploiement.

## Ce qui est déjà verrouillé

| Sujet | Règle | Source |
|---|---|---|
| Accès aux données | Le Front Office lit ses données par `src/data/*` uniquement ; à la connexion, seul le corps de ces fonctions change | `ARCHITECTURE.md` 10 ; `CLAUDE.md` |
| Intermédiaire | Les appels partent du serveur du Front Office ; le navigateur ne parle jamais à l'API, et l'adresse de l'API ne lui est pas exposée | 0, 10, 12 |
| Surface | Le Front Office n'appelle jamais `/admin/*` et ne possède aucun jeton | 6 ; décision 9 |
| Contenu publié | Seuls les contenus publiés sont visibles ; un brouillon n'existe pas pour le visiteur | 6 |
| API injoignable | La page affiche ses emplacements sans contenu, comme aujourd'hui, plutôt qu'une erreur | 10 |
| Année d'un contenu | Lue telle que l'API la fournit ; jamais déduite de la date par le Front Office | 10 (écart 2) ; décision 13 |
| Impact | Seules les rubriques renseignées s'affichent ; sans impact, pas de bloc ; aucun texte d'attente ne tient lieu d'impact | 1.4 ; décision 12 |
| Actualités | Cinq types, et seulement ceux-là ; date enregistrée en temps universel, saisie en heure de Madagascar | 1.5 ; décision 19 |
| Membres | Fonctions portées par le mandat de l'année ; ordre choisi par le club ; les profils de démonstration disparaissent à la connexion | 1.2, 1.3, 10 |
| Candidature | Le formulaire passe par le serveur du Front Office ; la situation se nomme `applicantStatus` ; le dépôt ne renvoie rien de la candidature | 10, 13 ; contrat 007 |
| Emplacements | Photographie absente : gabarit ; « Contenu à venir » une fois par section ; registre vide : en-têtes, une phrase, filets ; un emplacement n'est jamais cliquable ; rien n'est inventé | `DESIGN.md` 8 |
| États | Chargement : squelettes aux dimensions du contenu ; erreur : une phrase calme, la cause et la correction ; erreur de formulaire sous son champ, précédée du mot « Erreur » | `DESIGN.md` 9 |
| Langue | Français seulement | constitution VII |

## État des lieux du Front Office

### Ce qui est provisoire aujourd'hui et doit venir de l'API

| Élément | Aujourd'hui (`apps/web`) | Après |
|---|---|---|
| Actions | Liste vide en dur ; l'accueil et la page Actions affichent trois emplacements « Titre de l'action » | Actions publiées |
| Années proposées dans le filtre des actions | Déduites de la liste locale ; à défaut l'année écrite en dur | Années qui ont une action publiée |
| Nombre d'actions publiées | Longueur de la liste locale | Total fourni par l'API |
| Actualités | Liste vide en dur ; emplacement « Titre de l'actualité à la une » | Actualités publiées |
| Année Rotary d'une actualité | **Déduite de la date** par le Front Office | Fournie par l'API |
| Archives des actualités | Calculées localement à partir des dates | Années et nombres fournis par l'API |
| Texte d'une actualité | Tableau de paragraphes (`body`) | Texte (`content`), découpé en paragraphes sur les lignes vides |
| Membres | Sept **profils de démonstration** (« Profil 01 » …) | Membres de l'année, ou état vide ; profils supprimés (P2) |
| Fonctions d'un membre | Recherchées dans ses mandats locaux | Fonctions de l'année demandée, fournies avec le membre |
| Années proposées sur la page Membres | Déduites des profils ; à défaut l'année écrite en dur | Années qui ont au moins un membre |
| Aperçu des membres sur l'accueil | Toujours vide (les profils de démonstration en sont exclus) | Premiers membres de l'année en cours, dans l'ordre du club |
| Année Rotary en cours | **Constante écrite en dur** (`2026-2027`) | Année en cours selon l'API |
| Domaine d'une action | Un seul (`focusArea`) | Zéro, un ou plusieurs (`focusAreas`) |
| Envoi de la candidature | **Rien n'est transmis** ; le formulaire affiche « non relié » | Dépôt réel, avec le CV |
| Nom du champ de situation | `status` | `applicantStatus` |
| Registre d'impact de la page Actions | Cinq indicateurs en dur, tous « Donnée à venir » | Section supprimée (P1) |

### Ce qui est éditorial et reste dans le Front Office

Ces contenus ne viennent d'aucune API et ne sont pas modifiés par cette fonctionnalité : la présentation du club (« Qui sommes-nous ? »), les valeurs du Rotary, les sept domaines d'action et leurs libellés, le parcours d'adhésion, « Un club, des actions, des liens », les quatre questions du Rotary, les questions fréquentes, la définition d'une action, les titres, étiquettes et numéros de section, les libellés des fonctions et des types d'actualité, les textes du formulaire, le pied de page et les réseaux sociaux, les photographies d'ouverture.

Trois d'entre eux sont encore **provisoires et attendent un contenu du club** ; ils restent tels quels, aucun texte n'étant inventé à leur place : la mention « Présentation à compléter » de la section « Qui sommes-nous ? », les adresses vides des réseaux sociaux, et les gabarits photographiques.

## Points confirmés

Ils découlent de documents existants et de la demande ; le porteur du projet les a confirmés le 2026-10-02.

- **P1 — Registre d'impact de la page Actions.** `DESIGN.md`, section 10, prescrit la mention « Donnée à venir » pour une valeur absente ; `ARCHITECTURE.md` (décision 12, section 10 écart 1) décide « pas de donnée, pas de section ». Aucune source ne fournit ces cumuls. **Décision** : la section « Ce que les actions ont changé » est supprimée du Front Office, et aucun « Donnée à venir » n'est affiché ; `DESIGN.md` est aligné avant le code. Savoir si un registre sera un jour saisi dans le Back Office reste la décision ouverte d'`ARCHITECTURE.md`, hors de cette fonctionnalité.
- **P2 — Profils de démonstration.** `DESIGN.md`, section 8, les autorise « tant que le club n'a pas fourni les siens » ; `ARCHITECTURE.md`, section 1.2, dit qu'ils disparaissent à la connexion. **Décision** : ils sont supprimés ; une année sans membre affiche l'état vide existant ; `DESIGN.md` est aligné avant le code.
- **P3 — Fuseau des actualités.** **Décision** : le jour, le mois et le regroupement par mois des actualités sont calculés en heure de Madagascar. Les autres dates du site ne changent pas.

## Clarifications

### Session 2026-10-02

- **Q1 — Au bout de combien de temps une publication ou une dépublication doit-elle être visible sur le site ?** → A : environ 60 secondes. Le site utilise la revalidation par durée prévue par `ARCHITECTURE.md`, section 10 ; une visite ne dépend pas d'un appel systématique à l'API. La décision ouverte « Cache du Front Office » d'`ARCHITECTURE.md` est ainsi close.
- **Q2 — Le site doit-il afficher l'heure d'une actualité ?** → A : non, la date seule. L'heure saisie dans le Back Office sert à fixer le moment exact et le bon jour ; le site n'affiche que le jour et le mois. Aucun changement de composition, aucun changement de `DESIGN.md` sur ce point.
- **Q3 — Que fait le site quand une liste dépasse ce que l'API renvoie en une fois ?** → A : il affiche tout. Le serveur du site lit autant de pages de l'API que nécessaire, 100 éléments au plus par demande. Aucune pagination n'est visible ; les filtres par année restent disponibles.
- **P1, P2, P3** : confirmés (section « Points confirmés »).

## User Scenarios & Testing *(mandatory)*

Les vérifications sont manuelles (constitution, principe IX) : chaque récit dit ce que l'on fait et ce que l'on doit observer. Le contenu se prépare dans le Back Office.

### User Story 1 - Lire les actions du club (Priority: P1)

Un visiteur ouvre la page Actions et y trouve les actions que le club a publiées, chacune avec son année Rotary, ses domaines, son résumé et, quand il existe, son impact. Il peut restreindre la liste à une année ou à un domaine, et déplier la fiche d'une action.

**Why this priority**: les actions sont le cœur de ce que le club montre ; c'est le premier contenu que le Back Office permet de publier.

**Independent Test**: publier deux actions dans le Back Office (une avec impact, une sans), ouvrir `/actions`, filtrer, déplier.

**Acceptance Scenarios**:

1. **Given** des actions publiées, **When** le visiteur ouvre `/actions`, **Then** il voit ces actions, dans l'ordre que l'API fournit (les actions ordonnées par le club d'abord, puis de la plus récente à la plus ancienne), dans les trois compositions alternées existantes.
2. **Given** une action en brouillon, **When** le visiteur ouvre la page, **Then** elle n'apparaît nulle part : ni dans la liste, ni dans le nombre d'actions, ni dans les années proposées.
3. **Given** une action rattachée à deux domaines, **When** elle s'affiche, **Then** ses deux domaines sont nommés, avec leurs libellés.
4. **Given** une action dont l'impact a deux rubriques renseignées, **When** le visiteur déplie sa fiche, **Then** il voit ces deux rubriques et aucune autre.
5. **Given** une action sans impact, **When** elle s'affiche, **Then** elle n'a ni ligne d'impact ni fiche d'impact, et aucun texte d'attente ne les remplace.
6. **Given** une action qui a une description, **When** le visiteur déplie sa fiche, **Then** il lit la description, un paragraphe par bloc séparé d'une ligne vide.
7. **Given** une action sans résumé, **When** elle s'affiche, **Then** l'emplacement du résumé est absent, sans texte de remplacement.
8. **Given** des actions sur deux années Rotary, **When** le visiteur choisit une année, **Then** seules les actions de cette année s'affichent, l'année affichée étant celle que l'administrateur a choisie, même si la date de l'action tombe hors de cette année.
9. **Given** le filtre par domaine, **When** le visiteur choisit un domaine, **Then** seules les actions rattachées à ce domaine s'affichent ; les deux filtres se combinent et se lisent dans l'adresse de la page.
10. **Given** des filtres qui ne correspondent à aucune action, **When** la page s'affiche, **Then** elle dit « Aucune action ne correspond à ces filtres. » et propose de revenir à toutes les actions.
11. **Given** aucune action publiée, **When** la page s'affiche, **Then** elle garde sa composition avec ses emplacements et la mention « Contenu à venir », comme aujourd'hui ; aucun emplacement n'est cliquable.
12. **Given** la page Actions, **When** elle s'affiche, **Then** elle ne contient aucune occurrence de « Donnée à venir » et la section du registre d'impact n'y figure pas (P1).
13. **Given** n'importe quelle action, **When** elle s'affiche, **Then** son emplacement photographique montre le gabarit « Photographie à venir ».
14. **Given** plus de cent actions publiées, **When** le visiteur ouvre la page sans filtre, **Then** toutes sont présentes, dans l'ordre de l'API, sans pagination visible ; un filtre par année en réduit la liste.

---

### User Story 2 - Lire les actualités du club (Priority: P1)

Un visiteur ouvre la page Actualités : la plus récente est à la une, les suivantes forment le fil groupé par mois. Il peut choisir une rubrique, parcourir les archives par année Rotary et déplier le texte d'une actualité.

**Why this priority**: c'est la page qui vit le plus ; elle montre aussi le seul point où le fuseau du club change ce que le visiteur lit.

**Independent Test**: publier dans le Back Office quatre actualités de types et de mois différents, dont une datée entre minuit et 3 heures à Madagascar ; ouvrir `/actualites`.

**Acceptance Scenarios**:

1. **Given** des actualités publiées, **When** le visiteur ouvre `/actualites`, **Then** la plus récente est à la une et les autres forment le fil, de la plus récente à la plus ancienne, groupées par mois.
2. **Given** une actualité en brouillon, **When** la page s'affiche, **Then** elle n'apparaît ni dans le fil, ni dans le nombre d'actualités, ni dans les archives.
3. **Given** une actualité saisie dans le Back Office au 10 octobre à 01:00, heure de Madagascar, **When** elle s'affiche sur le site, **Then** son jour est le 10 et son mois octobre, quel que soit le fuseau du serveur ou du visiteur (P3).
4. **Given** une actualité saisie au 1er novembre à 00:30, heure de Madagascar, **When** le fil s'affiche, **Then** elle est rangée sous novembre.
5. **Given** une actualité de chaque type, **When** elles s'affichent, **Then** chacune porte le libellé de sa rubrique : Événement, Participation, Réunion, Formation, Annonce.
6. **Given** les rubriques, **When** le visiteur en choisit une, **Then** seules les actualités de cette rubrique s'affichent, la plus récente d'entre elles passant à la une.
7. **Given** les archives, **When** elles s'affichent, **Then** chaque année Rotary qui a une actualité publiée y figure avec son nombre d'actualités publiées, de la plus récente à la plus ancienne.
8. **Given** une actualité que l'administrateur a rattachée à une autre année que celle de sa date, **When** le visiteur parcourt les archives, **Then** elle se trouve sous l'année choisie par l'administrateur.
9. **Given** une actualité qui a un contenu, **When** le visiteur choisit « Lire la suite », **Then** le texte se déplie, un paragraphe par bloc séparé d'une ligne vide.
10. **Given** une actualité sans contenu, **When** elle s'affiche, **Then** « Lire la suite » n'est pas proposé.
11. **Given** une actualité sans lieu ou sans résumé, **When** elle s'affiche, **Then** l'élément est absent, sans texte de remplacement.
12. **Given** une rubrique ou une année sans actualité, **When** la page s'affiche, **Then** elle dit « Aucune actualité ne correspond à ce choix. » et propose de revenir à toutes les actualités.
13. **Given** aucune actualité publiée, **When** la page s'affiche, **Then** l'emplacement de la une, le registre vide (« Aucune actualité n'est encore publiée. ») et les archives gardent leur forme actuelle.
14. **Given** une actualité saisie avec une heure, **When** elle s'affiche à la une, dans le fil ou sur l'accueil, **Then** seuls son jour et son mois sont affichés ; l'heure n'apparaît nulle part.
15. **Given** plus de cent actualités publiées, **When** le visiteur ouvre la page sans filtre, **Then** toutes sont présentes dans le fil, sans pagination visible ; le nombre affiché en ouverture est le total.

---

### User Story 3 - Découvrir les membres du club (Priority: P1)

Un visiteur ouvre la page Membres et voit les personnes qui composent le club pour une année Rotary, dans l'ordre que le club a choisi, avec leurs fonctions et leur profession ou leurs études. Il peut consulter une autre année et lire l'index des fonctions.

**Why this priority**: c'est la page qui remplace des profils fictifs par des personnes réelles ; l'ordre et les fonctions par année sont la règle métier la plus fine du site.

**Independent Test**: dans le Back Office, créer quatre membres avec des mandats sur deux années, régler l'ordre d'une année ; ouvrir `/membres`.

**Acceptance Scenarios**:

1. **Given** des membres ayant un mandat pour l'année affichée, **When** le visiteur ouvre `/membres`, **Then** il les voit dans l'ordre réglé par le club, dans la composition existante (une personne en grand, trois portraits, puis les autres en lignes).
2. **Given** l'ordre modifié dans le Back Office, **When** la page est relue, **Then** l'ordre affiché est le nouvel ordre, jamais un classement par fonction ni par nom.
3. **Given** un membre qui tient deux fonctions cette année-là, **When** il s'affiche, **Then** ses deux fonctions sont nommées avec leurs libellés.
4. **Given** un membre sans fonction cette année-là, **When** il s'affiche, **Then** il figure dans l'annuaire, sans fonction et sans texte de remplacement.
5. **Given** un membre sans profession ni études renseignées, **When** il s'affiche, **Then** cette ligne est absente.
6. **Given** un membre, **When** il s'affiche, **Then** ni son email ni son téléphone n'apparaissent, à l'écran comme dans ce que le navigateur reçoit.
7. **Given** deux années ayant des membres, **When** le visiteur ouvre la page sans choisir, **Then** l'année la plus récente qui a des membres est affichée ; **When** il choisit l'autre année, **Then** il voit les membres et les fonctions de cette année-là.
8. **Given** un membre dont la fonction a changé d'une année à l'autre, **When** le visiteur passe d'une année à l'autre, **Then** la fonction affichée est celle de l'année choisie.
9. **Given** l'index des fonctions, **When** il s'affiche, **Then** chaque fonction du club y figure avec la ou les personnes qui la tiennent cette année-là, et « Non attribuée » sinon.
10. **Given** aucun membre pour l'année demandée, **When** la page s'affiche, **Then** elle dit que les membres de cette année ne sont pas encore publiés ; l'index des fonctions n'est pas affiché.
11. **Given** n'importe quel état, **When** la page s'affiche, **Then** elle ne contient aucun profil de démonstration (P2).
12. **Given** n'importe quel membre, **When** il s'affiche, **Then** son portrait est le gabarit « Photographie à venir ».

---

### User Story 4 - Voir sur l'accueil ce que le club vient de faire (Priority: P1)

Un visiteur arrive sur l'accueil et y trouve, entre les sections éditoriales, les actions récentes, les actualités récentes et un aperçu des membres de l'année, avec des liens vers les pages complètes.

**Why this priority**: l'accueil est la page la plus vue ; elle doit refléter le contenu réel dès qu'il existe.

**Independent Test**: avec du contenu publié (récits 1 à 3), ouvrir `/`.

**Acceptance Scenarios**:

1. **Given** au moins trois actions publiées, **When** l'accueil s'affiche, **Then** la section « Actions récentes » montre les trois premières de la page Actions, dans le même ordre.
2. **Given** une ou deux actions publiées, **When** l'accueil s'affiche, **Then** seules ces actions sont montrées ; aucun emplacement fictif ne complète la section.
3. **Given** au moins trois actualités publiées, **When** l'accueil s'affiche, **Then** « Actualités récentes » montre les trois plus récentes, avec leur date dans le fuseau du club.
4. **Given** des membres pour l'année Rotary en cours, **When** l'accueil s'affiche, **Then** l'aperçu montre les premiers d'entre eux dans l'ordre du club, avec leurs fonctions de l'année.
5. **Given** aucune action, aucune actualité ou aucun membre, **When** l'accueil s'affiche, **Then** la section concernée garde son emplacement actuel et sa mention « Contenu à venir », une seule fois.
6. **Given** l'année Rotary affichée en ouverture et dans l'aperçu des membres, **When** l'accueil s'affiche, **Then** c'est l'année en cours selon l'API, et non une valeur fixée dans le site.
7. **Given** les sections éditoriales (présentation, valeurs, sept domaines, invitation à rejoindre), **When** l'accueil s'affiche, **Then** elles sont identiques à aujourd'hui.

---

### User Story 5 - Envoyer sa candidature (Priority: P1)

Une personne qui veut rejoindre le club remplit le formulaire de la page Rejoindre, joint son CV et l'envoie. Elle sait si sa candidature est partie, et sinon ce qu'elle doit corriger.

**Why this priority**: c'est la seule écriture du site, et la seule action qui engage le club envers un visiteur ; aujourd'hui rien n'est transmis.

**Independent Test**: envoyer une candidature valide, la retrouver dans le Back Office avec son CV ; provoquer chaque refus.

**Acceptance Scenarios**:

1. **Given** un formulaire complet et un CV valide, **When** la personne l'envoie, **Then** elle lit la confirmation existante (« candidature envoyée »), le formulaire se vide, et la candidature apparaît dans le Back Office avec les mêmes données et un CV identique au fichier joint.
2. **Given** l'envoi en cours, **When** la personne attend, **Then** le bouton est inactif et un état d'attente est annoncé ; un second envoi est impossible.
3. **Given** un champ vide ou mal formé, **When** la personne envoie, **Then** l'erreur s'écrit sous le champ, précédée du mot « Erreur », le focus va au premier champ en erreur et rien n'est transmis.
4. **Given** un refus de l'API sur un champ que le contrôle du formulaire n'avait pas arrêté, **When** la réponse arrive, **Then** le message de l'API s'écrit sous le champ qu'il désigne, et la saisie est conservée.
5. **Given** un CV de plus de 5 Mo, **When** la personne envoie, **Then** un message sous le champ du CV dit que le fichier est trop volumineux, et la saisie des autres champs est conservée.
6. **Given** un fichier qui n'est ni un PDF ni un document Word, ou dont l'extension contredit le contenu, **When** la personne envoie, **Then** un message sous le champ du CV dit que ce type de fichier n'est pas accepté.
7. **Given** la limite de fréquence atteinte, **When** la personne envoie, **Then** un message calme lui dit qu'il y a eu trop de demandes et de réessayer plus tard ; la saisie est conservée.
8. **Given** le stockage ou l'API indisponible, **When** la personne envoie, **Then** un message calme lui dit que le service est indisponible et de réessayer ; la saisie est conservée et aucune confirmation n'est affichée.
9. **Given** n'importe quelle issue, **When** on inspecte ce que le navigateur envoie et reçoit, **Then** il ne parle qu'au site du club ; ni l'adresse de l'API, ni aucune référence de stockage, ni le nom du prestataire n'y figurent.
10. **Given** la confirmation, **When** elle s'affiche, **Then** elle ne répète aucune donnée de la candidature et ne promet aucun email : l'API n'en envoie pas.
11. **Given** le formulaire, **When** il s'affiche, **Then** le message « non relié » a disparu, et l'aide du champ CV indique les formats acceptés et la taille maximale.
12. **Given** le reste de la page Rejoindre, **When** elle s'affiche, **Then** son contenu et sa composition sont identiques à aujourd'hui.

---

### User Story 6 - Un site qui reste lisible quand le contenu manque ou que l'API ne répond pas (Priority: P2)

Quel que soit l'état des données, le visiteur voit une page composée, jamais une erreur technique ni une maquette inachevée.

**Why this priority**: le site sera en ligne avant que tout le contenu existe, et l'API peut être momentanément indisponible ; la qualité perçue en dépend.

**Independent Test**: ouvrir les cinq pages avec une base vide, puis avec l'API arrêtée.

**Acceptance Scenarios**:

1. **Given** une base sans aucun contenu, **When** le visiteur parcourt les cinq pages, **Then** chacune garde sa composition, ses emplacements et sa mention « Contenu à venir », sans profil ni contenu fictif.
2. **Given** l'API arrêtée, **When** le visiteur ouvre l'accueil, les actions, les actualités ou les membres, **Then** la page s'affiche avec ses emplacements sans contenu, comme avec une base vide, et aucun message technique.
3. **Given** l'API arrêtée, **When** le visiteur ouvre la page Rejoindre, **Then** la page s'affiche entièrement ; seul l'envoi échoue, avec son message (récit 5, scénario 8).
4. **Given** aucune année Rotary en cours dans l'API, **When** les pages s'affichent, **Then** l'année affichée suit la règle des hypothèses, et aucune page n'échoue.
5. **Given** une adresse portant un filtre inconnu ou mal formé (année, domaine, rubrique), **When** la page s'affiche, **Then** elle se comporte comme pour un filtre sans résultat, sans erreur.
6. **Given** un changement de filtre ou d'année, **When** la page se met à jour, **Then** l'attente, si elle est perceptible, montre des squelettes aux dimensions du contenu, sans saut de mise en page.
7. **Given** une action, une actualité ou un membre publié, modifié, réordonné ou dépublié dans le Back Office, **When** environ 60 secondes se sont écoulées et que la page est relue, **Then** le site reflète le changement.
8. **Given** un contenu déjà lu par le site, **When** l'API s'arrête ensuite, **Then** les pages continuent d'afficher ce contenu au lieu de se vider aussitôt ; elles ne montrent leurs emplacements sans contenu que si aucun contenu n'a pu être lu.
9. **Given** plusieurs visites rapprochées de la même page, **When** elles ont lieu dans la même minute, **Then** elles n'entraînent pas chacune une lecture de l'API.

---

### User Story 7 - Un site inchangé dans sa forme (Priority: P2)

Le visiteur retrouve le site tel qu'il a été conçu et audité : mêmes compositions, même lisibilité sur téléphone, même accessibilité.

**Why this priority**: la connexion à l'API ne doit rien coûter à la qualité déjà validée.

**Independent Test**: comparer les cinq pages avant et après, à trois largeurs, au clavier.

**Acceptance Scenarios**:

1. **Given** les cinq pages avec du contenu réel, **When** on les compare à `DESIGN.md`, **Then** compositions, grille, typographie et couleurs sont celles du design ; aucune grille de cartes ni mise en page générique n'apparaît.
2. **Given** des contenus de longueurs très différentes (titre de 120 caractères, résumé de 500, sept domaines, dix fonctions), **When** ils s'affichent, **Then** la composition tient, sans débordement ni chevauchement de texte.
3. **Given** les largeurs 1280, 768 et 375 px, **When** on parcourt les pages, **Then** aucune ne déborde horizontalement et tout le contenu reste lisible.
4. **Given** un parcours au clavier, **When** on filtre, déplie une fiche et remplit le formulaire, **Then** tout est atteignable, le focus est visible, et les messages d'erreur et de résultat sont annoncés.
5. **Given** les pages, **When** on vérifie leur structure, **Then** la hiérarchie des titres, les textes alternatifs et les libellés existants sont conservés.

---

### Edge Cases

- **Année sans contenu choisie dans l'adresse** : état « aucun résultat », jamais une erreur.
- **Action ou actualité rattachée à une année autre que celle de sa date** : le site suit l'année choisie par l'administrateur, pour l'affichage comme pour les filtres et les archives.
- **Actualité autour de minuit** : le jour affiché est celui de Madagascar ; une actualité enregistrée à 22:00 en temps universel s'affiche au lendemain.
- **Date d'une action** : c'est une date sans heure ; elle n'est pas affichée aujourd'hui et ne l'est pas davantage (les actions sont classées par année Rotary).
- **Une seule actualité pour un choix** : elle est à la une et le fil dit qu'elle est la seule, comme aujourd'hui.
- **Moins de membres que la composition n'en attend** (un seul, deux, quatre) : la composition s'adapte sans emplacement fictif.
- **Aucune année en cours dans l'API** mais des années passées avec du contenu : les pages montrent ce contenu ; l'aperçu des membres de l'accueil reste à l'état d'emplacement.
- **Deux personnes pour une même fonction** : l'index des fonctions les nomme toutes les deux.
- **Envoi interrompu** (connexion perdue pendant l'envoi) : message d'indisponibilité, saisie conservée ; la personne ne peut pas savoir si la candidature est partie, et le message le dit sans l'affirmer.
- **Double candidature** : l'API accepte deux candidatures avec le même email ; le site ne l'empêche pas.
- **Limite de fréquence partagée** : l'API compte les dépôts par adresse d'origine, et tous les dépôts du site partent de son serveur ; la limite de 20 par heure vaut donc pour l'ensemble des visiteurs (`PROJECT_CONTEXT.md`, « Points d'attention »). Le message reste celui du scénario 7.
- **Nom de fichier accentué ou très long** : transmis tel quel ; l'API le nettoie.
- **Contenu modifié pendant la lecture** : le visiteur voit l'état lu au chargement ; aucun rafraîchissement automatique.

## Requirements *(mandatory)*

### Functional Requirements

**Règles communes**

- **FR-001** : Le Front Office MUST afficher les contenus fournis par l'API à la place de ses données locales, sur l'accueil et les pages Actions, Actualités et Membres.
- **FR-002** : Le navigateur du visiteur MUST NOT appeler l'API ni en connaître l'adresse ; tous les échanges passent par le serveur du Front Office.
- **FR-003** : Le Front Office MUST n'utiliser que les lectures publiques et le dépôt de candidature existants ; il MUST NOT appeler d'opération d'administration ni détenir de jeton.
- **FR-004** : Les pages MUST continuer à obtenir leurs données par la seule couche de données du Front Office.
- **FR-005** : Un champ absent ou vide MUST NOT être remplacé par un contenu inventé ni par un texte d'attente ; l'élément correspondant n'est pas affiché.
- **FR-006** : Seul un contenu publié MUST être visible, compté ou proposé dans un filtre.
- **FR-007** : Les libellés des domaines, des fonctions et des types MUST être ceux du site ; la valeur technique n'est jamais affichée.
- **FR-008** : L'année Rotary en cours MUST venir de l'API ; aucune année n'est écrite en dur dans le site.
- **FR-009** : Un changement fait dans le Back Office (publication, modification, ordre, dépublication, suppression) MUST être visible sur le site en environ 60 secondes, par la revalidation par durée prévue par `ARCHITECTURE.md`, section 10. Une visite MUST NOT dépendre d'une lecture systématique de l'API. L'envoi d'une candidature n'est pas concerné : il est toujours transmis immédiatement.
- **FR-010** : Les listes d'actions et d'actualités MUST être affichées en entier : le serveur du site lit toutes les pages nécessaires de l'API, 100 éléments au plus par demande. Aucune pagination ne MUST être visible ; les filtres existants restent disponibles.

**Actions**

- **FR-011** : La page Actions MUST lister les actions publiées dans l'ordre fourni par l'API, avec titre, année Rotary, domaines, résumé, description et impact quand ils existent.
- **FR-012** : Elle MUST permettre de filtrer par année Rotary et par domaine, les deux se combinant et se lisant dans l'adresse ; les années proposées sont celles qui ont une action publiée.
- **FR-013** : Une action MUST pouvoir porter zéro, un ou plusieurs domaines, tous affichés.
- **FR-014** : L'impact MUST n'afficher que les rubriques renseignées ; une action sans impact n'a pas de bloc d'impact.
- **FR-015** : La description MUST être lue dans la fiche dépliable, découpée en paragraphes sur les lignes vides.
- **FR-016** : La section « Ce que les actions ont changé » MUST être supprimée du Front Office ; aucune page ne MUST afficher « Donnée à venir » (P1).
- **FR-017** : Le nombre d'actions publiées affiché en ouverture MUST être celui de l'API.

**Actualités**

- **FR-018** : La page Actualités MUST afficher les actualités publiées de la plus récente à la plus ancienne : la première à la une, les suivantes dans le fil groupé par mois.
- **FR-019** : Elle MUST permettre de choisir une rubrique parmi les cinq types, et une année Rotary par les archives, les deux se combinant.
- **FR-020** : Les archives MUST montrer les années et les nombres d'actualités publiées fournis par l'API.
- **FR-021** : L'année Rotary d'une actualité MUST être celle fournie par l'API ; le Front Office MUST NOT la déduire de la date.
- **FR-022** : Le jour, le mois et le regroupement par mois MUST être calculés en heure de Madagascar, indépendamment du fuseau du serveur et de celui du visiteur (P3).
- **FR-023** : Le site MUST afficher le jour et le mois d'une actualité, jamais son heure.
- **FR-024** : Le contenu MUST être lu dans le texte dépliable, découpé en paragraphes sur les lignes vides ; sans contenu, le dépliage n'est pas proposé.

**Membres**

- **FR-025** : La page Membres MUST afficher les membres ayant un mandat pour l'année choisie, dans l'ordre fourni par l'API, avec leurs fonctions de cette année et leur profession ou leurs études quand elles existent.
- **FR-026** : Elle MUST proposer les années qui ont au moins un membre, et afficher par défaut la plus récente.
- **FR-027** : L'index des fonctions MUST nommer, pour chaque fonction du club, les personnes qui la tiennent dans l'année affichée.
- **FR-028** : Les profils de démonstration MUST être supprimés du Front Office ; une année sans membre affiche l'état vide existant (P2).
- **FR-029** : Aucune donnée non publique d'un membre (email, téléphone) MUST NOT atteindre le navigateur.

**Accueil**

- **FR-030** : L'accueil MUST montrer jusqu'à trois actions et trois actualités publiées, dans l'ordre de leurs pages respectives, et un aperçu des membres de l'année en cours dans l'ordre du club.
- **FR-031** : Les sections éditoriales de l'accueil MUST rester inchangées.

**Candidature**

- **FR-032** : Le formulaire MUST transmettre la candidature et son CV au dépôt de l'API, par le serveur du Front Office, avec les six champs du contrat, la situation sous le nom attendu par l'API.
- **FR-033** : Après un dépôt accepté, le formulaire MUST afficher la confirmation, se vider, et ne rien répéter de la candidature.
- **FR-034** : Les contrôles faits avant l'envoi MUST NOT accepter ce que l'API refuse sans que le refus de l'API soit ensuite affiché ; l'API reste l'autorité.
- **FR-035** : Un refus de validation de l'API MUST être affiché sous le champ qu'il désigne, dans la forme d'erreur du design.
- **FR-036** : Un fichier trop volumineux et un type de fichier refusé MUST produire chacun un message sous le champ du CV.
- **FR-037** : La limite de fréquence et l'indisponibilité du service MUST produire chacune un message calme, qui dit quoi faire, sans détail technique.
- **FR-038** : Dans tous les cas d'échec, la saisie MUST être conservée et aucune confirmation ne MUST être affichée.
- **FR-039** : Un envoi en cours MUST empêcher un second envoi et être annoncé.
- **FR-040** : Aucune référence de stockage ni le nom du prestataire MUST NOT apparaître à l'écran ni dans ce que le navigateur reçoit.
- **FR-041** : Le site MUST NOT conserver ni journaliser les données d'une candidature.

**États**

- **FR-042** : Sans contenu, chaque section MUST garder sa composition et les emplacements prévus par `DESIGN.md`, section 8.
- **FR-043** : Si l'API ne répond pas, les pages de lecture MUST s'afficher avec leurs emplacements sans contenu, sans message technique.
- **FR-044** : Un filtre inconnu, mal formé ou sans résultat MUST produire l'état « aucun résultat » de la page, jamais une erreur.
- **FR-045** : Une attente perceptible MUST montrer des squelettes aux dimensions du contenu.

**Forme et limites**

- **FR-046** : Les compositions, la grille, la typographie, les couleurs et les composants de `DESIGN.md` MUST être conservés ; aucune mise en page générique ne MUST être introduite.
- **FR-047** : L'accessibilité et l'adaptation aux écrans déjà en place MUST être conservées.
- **FR-048** : Les emplacements photographiques MUST garder leur gabarit : l'API ne fournit aucune image.
- **FR-049** : Cette fonctionnalité MUST NOT modifier l'API ni le Back Office ; un besoin non couvert MUST être signalé.
- **FR-050** : Aucun secret ni aucune adresse d'API ne MUST figurer dans le code ni dans un fichier versionné.
- **FR-051** : `DESIGN.md` MUST être aligné avant le code sur les points P1 (section 10 : plus de registre d'impact ni de « Donnée à venir ») et P2 (section 8 : plus de profils de démonstration), et la composition de la page Actions MUST y être décrite sans le registre ; aucune autre décision de design n'est modifiée. `ARCHITECTURE.md` MUST être aligné avant le code sur Q1 (cache de 60 secondes, décision close) et P3 (fuseau de Madagascar pour l'affichage des actualités).

### Key Entities

Aucune entité nouvelle. Le Front Office lit les formes **publiques** de l'API :

- **Année Rotary** : libellé, dates, année en cours.
- **Action** : titre, résumé, description, date, année Rotary (libellé), domaines, impact facultatif. Ni photographie, ni état de publication, ni ordre.
- **Actualité** : titre, type, date et heure, année Rotary (libellé), lieu, résumé, contenu. Ni photographie.
- **Membre d'une année** : prénom, nom, profession ou études, fonctions de l'année, ordre. Ni email, ni téléphone, ni portrait.
- **Archive** : une année Rotary et son nombre d'actualités publiées.
- **Candidature** (envoi seulement) : prénom, nom, email, téléphone, situation, CV. Rien n'en revient.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** : 100 % des contenus publiés dans le Back Office (actions, actualités, membres d'une année) sont visibles sur le site, et 0 brouillon ne l'est.
- **SC-002** : Sur les cinq pages, 0 occurrence de « Donnée à venir », de profil de démonstration et de contenu fictif présenté comme réel.
- **SC-003** : Pour chaque actualité de vérification, le jour et le mois affichés sur le site sont ceux saisis dans le Back Office, y compris pour une actualité datée entre minuit et 3 heures.
- **SC-004** : L'ordre des membres affiché est identique à l'ordre réglé dans le Back Office, pour chaque année vérifiée.
- **SC-005** : 100 % des candidatures envoyées avec des données valides se retrouvent dans le Back Office, avec un CV identique au fichier joint.
- **SC-006** : Chacun des refus prévus (champ invalide, fichier trop volumineux, type refusé, trop de demandes, service indisponible) produit un message en français, à l'endroit prévu, et conserve la saisie.
- **SC-007** : Une personne remplit et envoie le formulaire en moins de 3 minutes, et sait en moins de 10 secondes après l'envoi si sa candidature est partie.
- **SC-008** : Avec une base vide, puis avec l'API arrêtée, les cinq pages s'affichent composées, sans aucun message technique.
- **SC-009** : Le navigateur n'échange avec aucun autre serveur que celui du site ; aucune adresse d'API ni référence de stockage n'est visible.
- **SC-010** : Aux largeurs 1280, 768 et 375 px, aucune des cinq pages ne déborde horizontalement, avec des contenus courts comme avec les contenus les plus longs admis.
- **SC-011** : Le parcours au clavier des filtres, des fiches dépliables et du formulaire est complet, sans régression par rapport à l'audit du Front Office.
- **SC-012** : Le Back Office et les réponses de l'API sont inchangés à la fin de la fonctionnalité.
- **SC-013** : Un changement fait dans le Back Office est visible sur le site en 90 secondes au plus (60 secondes de fraîcheur, plus le temps d'une relecture).
- **SC-014** : Avec 120 actions et 120 actualités publiées, les deux pages les présentent toutes, sans pagination visible, et leur nombre affiché est exact.

## Assumptions

- **Détail d'un contenu.** Le « détail » d'une action ou d'une actualité est le bloc dépliable existant dans la liste ; aucune fenêtre modale ni page de détail n'est ajoutée. Les lectures par slug de l'API ne sont donc pas utilisées.
- **« Dernières » actions.** L'accueil montre les trois premières actions dans l'ordre public de l'API : celles que le club a ordonnées d'abord, puis les plus récentes. C'est l'ordre de la page Actions.
- **Actualité à la une.** Aucun champ ne la désigne : c'est la plus récente de la sélection en cours, comme aujourd'hui.
- **Description d'une action.** Elle n'est affichée nulle part aujourd'hui ; elle prend place dans la fiche dépliable, au-dessus de l'impact. Sa date n'est pas affichée.
- **Année affichée sans année en cours dans l'API.** Les mentions d'année de l'accueil et des ouvertures utilisent alors l'année Rotary du calendrier (elle commence le 1er juillet), qui est un fait et non un contenu ; les listes, elles, ne proposent que les années fournies par l'API.
- **Aide du champ CV.** Elle indique les formats et la taille maximale du contrat (PDF ou Word, 5 Mo) : c'est une règle existante, pas un contenu nouveau.
- **Messages.** Les messages de l'API sont en français et affichables tels quels ; ceux que le formulaire possède déjà sont conservés pour ses propres contrôles.
- **Photographies.** Tous les emplacements photographiques restent des gabarits jusqu'à ce que le stockage des images existe.
- **Contenus éditoriaux provisoires.** La présentation du club à compléter, les réseaux sociaux et les photographies d'ouverture attendent un contenu du club ; ils ne sont pas traités ici.
- **Limite de fréquence partagée.** Acceptée pour cette fonctionnalité ; la distinguer par visiteur demanderait de modifier l'API ou sa configuration, ce qui relève du déploiement.
- **Taille du CV en transit.** Le CV passe par le serveur du site ; la capacité de ce passage à porter 5 Mo, en local comme chez un futur hébergeur, est à établir au plan.
- **Environnement.** Le Front Office a besoin de l'adresse de l'API, côté serveur seulement ; l'API, sa base et le Back Office sont disponibles pendant la vérification.
- **Documents à aligner.** Avant le code : `DESIGN.md` (P1, P2) et `ARCHITECTURE.md` (Q1, P3). Quand la connexion existe : `PROJECT_CONTEXT.md` et `CLAUDE.md`. La décision ouverte sur le registre d'impact agrégé reste ouverte dans `ARCHITECTURE.md`.
- **Revalidation.** « Environ 60 secondes » est une durée de fraîcheur, non une garantie à la seconde : le premier visiteur après ce délai peut encore voir l'ancien contenu pendant que le nouveau est relu.
- **Volume.** Un club publie quelques dizaines d'actions et d'actualités par an ; lire toutes les pages de l'API reste léger pendant des années, et la revalidation en limite la fréquence.
- **Membres.** L'annuaire public d'une année tient en une réponse de l'API : Q3 ne le concerne pas.
