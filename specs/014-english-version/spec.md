# Feature Specification: Version anglaise

**Feature Branch**: `014-english-version`

**Created**: 2026-10-13

**Status**: Clarification close le 2026-10-13 (Q1) — en attente de validation avant le plan

**Input**: User description: « Fonctionnalité 014 « Version anglaise » : le site public existe aussi en anglais. Décisions du porteur du projet (2026-10-13) : (1) périmètre complet : les textes fixes du site (content/*, libellés, pages système, métadonnées) sont traduits dans le code, et les contenus saisis (actions : titre, résumé, description, impact ; actualités : titre, résumé, contenu, lieu ; réglages du site : présentation du club, réponses de la FAQ, textes alternatifs et légendes des photographies) reçoivent un équivalent anglais facultatif saisi dans le Back Office ; sans traduction, le contenu s'affiche en français, avec la langue signalée ; (2) adresses : le français garde ses adresses actuelles sans préfixe, l'anglais vit sous /en (/en/actions, /en/actions/<slug>…), avec un lien FR / EN dans l'en-tête et l'attribut lang juste. Cette fonctionnalité lève la décision « Public UI is French only for v1 » et la décision repoussée « solution d'internationalisation » : à corriger dans les documents avant le code. Le Back Office reste en français. »

**Références** :
- `CLAUDE.md` (« Public UI is French only for v1… do not implement English ») et `PROJECT_CONTEXT.md` (section 9, « solution d'internationalisation » repoussée ; section 10, « Hors périmètre : version anglaise ») : décisions levées par cette fonctionnalité.
- `ARCHITECTURE.md` : sections 1 (entités), 6 (routes), 10 (Front Office), 11 (Back Office), 14 (décisions).
- `DESIGN.md` : section 4 (typographie, « Typographie française »), section 13 (accessibilité).
- `specs/009-front-office-integration/`, `specs/011-image-storage/`, `specs/012-site-settings/`, `specs/013-detail-pages/`.
- `.specify/memory/constitution.md` : principes I, VI, VII, XII.

## Contexte et périmètre

Le site public est en français seulement, par décision. Le club veut aussi s'adresser à des lecteurs anglophones (partenaires, réseau Rotary international). Le porteur du projet a tranché le 2026-10-13 : tout le site existe en anglais, textes fixes et contenus, et l'anglais vit sous `/en` sans toucher aux adresses françaises.

### Dans le périmètre

1. **Adresses** : chaque page publique française a son équivalent anglais à la même adresse précédée de `/en` : `/en`, `/en/actions`, `/en/actions/<slug>`, `/en/actualites`, `/en/actualites/<slug>`, `/en/membres`, `/en/rejoindre`. Les mots des rubriques restent ceux de l'adresse française (Q1).
2. **Textes fixes** : tous les textes du site (pages, navigation, libellés, listes fermées : domaines d'action, types d'actualité, fonctions des membres, statuts de candidature ; page introuvable, page d'erreur, métadonnées) existent en anglais, traduits dans le code.
3. **Contenus saisis** : un équivalent anglais facultatif, saisi dans le Back Office, pour :
   - une action : titre, résumé, description, rubriques d'impact (objectif, bénéficiaires, lieu, période, résultats) ;
   - une actualité : titre, résumé, contenu, lieu ;
   - les réglages du site : club parrain, lieu et rythme des réunions, réponses de la FAQ ;
   - chaque image (portraits, photographies des actions et des actualités, photographies fixes du site) : texte alternatif et légende.
4. **Repli** : un contenu sans traduction s'affiche en français sur la page anglaise, avec sa langue signalée au lecteur et aux technologies d'assistance.
5. **Sélecteur de langue** : un lien FR / EN dans l'en-tête et le menu du téléphone mène à la même page dans l'autre langue.
6. **Formulaire de candidature** en anglais : libellés, aides, erreurs et confirmation.
7. **Documents** : les décisions levées sont corrigées dans `CLAUDE.md`, `PROJECT_CONTEXT.md`, `ARCHITECTURE.md` et `DESIGN.md` avant le code.

### Hors périmètre

- Le Back Office reste en français (seuls ses formulaires gagnent les champs anglais).
- Toute traduction automatique : chaque texte anglais est écrit ou validé par le club.
- D'autres langues que le français et l'anglais.
- Des slugs anglais distincts : une action ou une actualité garde le même slug dans les deux langues.
- La détection automatique de la langue du navigateur et toute redirection automatique.
- La traduction des données qui ne se traduisent pas : noms des membres, partenaires, crédits photographiques, profession ou études d'un membre.
- Les emails ou messages envoyés par l'API ; les réponses de l'API restent en français.

## Ce qui est déjà verrouillé

- **Adresses françaises inchangées** : aucun lien déjà partagé ne casse.
- **Lecture des données** par `src/data/*` seulement, revalidation d'environ 60 secondes (décision 20).
- **Rien d'inventé** (décision 1) : un contenu absent reste absent dans les deux langues ; une traduction absente n'est pas remplacée par une traduction automatique ni par un texte de substitution.
- **Année Rotary explicite**, dates d'actualité en heure de Madagascar (décisions 13 et 19).
- **Back Office** : écritures par actions serveur, aspect `apps/admin/DESIGN.md`.

## Points signalés avant rédaction

- **Décisions levées** : « French only for v1 » (`CLAUDE.md`, section « Decided constraints ») et « version anglaise » hors périmètre (`PROJECT_CONTEXT.md`, section 10) ; « solution d'internationalisation » repoussée (`PROJECT_CONTEXT.md`, section 9). Elles sont réécrites avant le code (constitution, principe XII).
- **Messages d'erreur de l'API** : le formulaire de candidature affiche aujourd'hui les refus de l'API tels quels, en français. Sur la page anglaise, le site affiche ses propres messages anglais, choisis d'après le champ et la nature du refus (FR-012).
- **Typographie** : `DESIGN.md`, section 4, fixe les règles de la typographie française (espaces insécables, guillemets). L'anglais suit ses propres règles ; elles sont à ajouter à `DESIGN.md`.
- **Mises en page** : les textes anglais sont souvent plus courts, parfois plus longs (titres) ; les compositions doivent tenir dans les deux langues sans débordement.

## Clarifications

### Session 2026-10-13

- Q: Les noms des rubriques sont-ils traduits dans les adresses anglaises ? → A: Non : l'adresse anglaise est l'adresse française précédée de `/en` (`/en/actualites`, `/en/membres`, `/en/rejoindre`) ; le sélecteur de langue ajoute ou retire seulement `/en` (FR-001, FR-003).

## User Scenarios & Testing *(mandatory)*

Vérifications manuelles uniquement (constitution, principe IX).

### User Story 1 - Lire le site en anglais (Priority: P1)

Un partenaire anglophone arrive sur l'accueil, clique sur « EN » et parcourt le site en anglais : la présentation du club, les actions, les actualités, les membres et la page pour nous rejoindre. Les textes fixes sont en anglais ; les actions et actualités déjà traduites aussi.

**Why this priority**: c'est la raison d'être de la fonctionnalité ; sans les textes fixes en anglais, rien d'autre n'a de sens.

**Independent Test**: sans aucune traduction saisie, ouvrir les cinq pages en anglais : tous les textes fixes sont en anglais, les contenus s'affichent en français avec leur langue signalée.

**Acceptance Scenarios**:

1. **Given** une page française, **When** le visiteur choisit « EN » dans l'en-tête, **Then** il arrive sur la même page en anglais, à l'adresse sous `/en`, et la page déclare la langue anglaise.
2. **Given** une page anglaise, **When** il choisit « FR », **Then** il revient sur la même page en français, à son adresse d'origine.
3. **Given** la version anglaise, **When** il navigue (menu, liens, filtres, pages de détail, pied de page), **Then** il reste en anglais, filtres et ancres compris.
4. **Given** la version anglaise, **When** il lit les listes fermées (domaines d'action, types d'actualité, fonctions), les dates et les métadonnées, **Then** elles sont en anglais, les dates au format anglais (« 14 March 2026 »).
5. **Given** une adresse anglaise inconnue, **When** il l'ouvre, **Then** la page introuvable s'affiche en anglais, avec le statut 404.

---

### User Story 2 - Traduire une action, une actualité et les réglages (Priority: P1)

L'administrateur ouvre une action dans le Back Office, remplit sa partie « English » (titre, résumé, description, impact) et les textes anglais de ses photographies, puis enregistre. La page anglaise de l'action affiche la traduction. Il fait de même pour une actualité, pour les réglages du site et pour les portraits.

**Why this priority**: sans contenus traduits, les pages Actions et Actualités resteraient en français sous un habillage anglais.

**Independent Test**: traduire une action publiée et une réponse de la FAQ ; vérifier la page anglaise de l'action et la FAQ anglaise ; vider la traduction et constater le repli en français.

**Acceptance Scenarios**:

1. **Given** la fiche d'une action, **When** l'administrateur saisit le titre et le résumé anglais et enregistre, **Then** la liste et la page anglaises les affichent, la page française reste inchangée.
2. **Given** une action dont seul le titre est traduit, **When** on ouvre sa page anglaise, **Then** le titre est en anglais, et le résumé, la description et l'impact s'affichent en français, chacun signalé comme français.
3. **Given** une photographie avec un texte alternatif anglais, **When** on ouvre la page anglaise, **Then** l'image porte ce texte alternatif ; sans lui, elle porte le texte français.
4. **Given** l'écran « Site », **When** l'administrateur saisit la réponse anglaise d'une question de la FAQ, **Then** la FAQ anglaise l'affiche ; une question sans réponse en français reste masquée dans les deux langues.
5. **Given** un champ anglais vidé, **When** on enregistre, **Then** la traduction est retirée et la page anglaise revient au texte français.

---

### User Story 3 - Candidater depuis la version anglaise (Priority: P2)

Un étudiant anglophone remplit le formulaire de candidature en anglais : libellés, aides, erreurs et confirmation sont en anglais. La candidature arrive dans le Back Office comme les autres.

**Why this priority**: le recrutement est un objectif du site, mais il dépend du reste de la version anglaise.

**Independent Test**: envoyer une candidature depuis `/en/…` avec une erreur (téléphone trop court), la corriger, puis l'envoyer ; vérifier les messages anglais et la candidature dans le Back Office.

**Acceptance Scenarios**:

1. **Given** le formulaire anglais, **When** un champ est invalide, **Then** l'erreur s'affiche en anglais sous le champ, précédée de « Error ».
2. **Given** un refus de l'API (fichier trop lourd, format refusé, trop de demandes, service indisponible), **When** il survient, **Then** le site affiche le message anglais correspondant, jamais le message français de l'API.
3. **Given** une candidature envoyée en anglais, **When** l'administrateur l'ouvre, **Then** elle a la même forme qu'une candidature française.

---

### Edge Cases

- **Base sans aucune traduction** : la version anglaise est complète pour les textes fixes ; tous les contenus s'y lisent en français, signalés.
- **Contenu non publié** : `404` dans les deux langues.
- **Slug identique** dans les deux langues : `/actions/x` et `/en/actions/x` désignent la même action.
- **Partage** : une page anglaise a ses propres métadonnées en anglais (titre, description) ; les moteurs de recherche connaissent les deux versions de chaque page et leur langue.
- **Titre anglais plus long** que le français : la composition tient sans débordement sur téléphone et sur ordinateur.
- **Lecteur d'écran** : un passage en français dans une page anglaise est lu avec la prononciation française.
- **Mention « Contenu à venir »** et gabarits « Photographie à venir » : traduits.

## Requirements *(mandatory)*

### Functional Requirements

**Adresses et langue**

- **FR-001**: Chaque page publique MUST exister en français à son adresse actuelle et en anglais à la même adresse précédée de `/en`, les mots des rubriques restant français (Q1).
- **FR-002**: Chaque page MUST déclarer sa langue (`fr` ou `en`) ; un passage dans l'autre langue MUST déclarer la sienne.
- **FR-003**: L'en-tête et le menu du téléphone MUST offrir un lien vers la même page dans l'autre langue, obtenu en ajoutant ou en retirant `/en` devant l'adresse, filtres et ancre compris ; le lien de la langue courante est marqué comme tel.
- **FR-004**: Chaque page MUST indiquer aux moteurs de recherche son équivalent dans l'autre langue.
- **FR-005**: Aucune redirection automatique selon la langue du navigateur.

**Textes fixes**

- **FR-006**: Tous les textes fixes du site MUST exister en anglais : pages, navigation, libellés, listes fermées, mentions d'emplacement, page introuvable, page d'erreur, métadonnées, textes alternatifs des images livrées avec le site.
- **FR-007**: Les dates MUST suivre la langue de la page (« 14 mars 2026 », « 14 March 2026 »), en gardant les règles de fuseau existantes.

**Contenus saisis**

- **FR-008**: Une action, une actualité, les réglages du site et chaque image MUST pouvoir porter un équivalent anglais facultatif des champs listés au périmètre (point 3), saisi dans le Back Office avec les mêmes limites de longueur que le français.
- **FR-009**: Sur une page anglaise, chaque champ MUST s'afficher en anglais s'il est traduit, sinon en français avec sa langue déclarée (FR-002) et un repère visible discret indiquant qu'il est en français.
- **FR-010**: Un champ français absent MUST rester absent dans les deux langues, même si un texte anglais existe ; une question de la FAQ sans réponse française reste masquée.
- **FR-011**: Le Back Office MUST présenter les champs anglais groupés dans une partie « English » de chaque formulaire concerné, et dans le panneau image ; il reste en français pour tout le reste.

**Candidature**

- **FR-012**: Le formulaire de candidature MUST être entièrement en anglais sur la page anglaise, y compris les refus de l'API, que le site traduit d'après le champ et la nature du refus.

**Documents**

- **FR-013**: Les décisions levées MUST être corrigées dans `CLAUDE.md`, `PROJECT_CONTEXT.md`, `ARCHITECTURE.md` et `DESIGN.md` (règles typographiques anglaises) avant le code.

**Non-régression**

- **FR-014**: Les pages françaises MUST rester identiques à leur état actuel, hormis le sélecteur de langue.

### Key Entities

- **Action** : gagne une version anglaise facultative de son titre, résumé, description et rubriques d'impact.
- **Actualité** : gagne une version anglaise facultative de son titre, résumé, contenu et lieu.
- **Réglages du site** : gagnent une version anglaise facultative du club parrain, du lieu et du rythme des réunions, et des réponses de la FAQ.
- **Image** : gagne un texte alternatif et une légende anglais facultatifs.
- Les membres, mandats, années Rotary et candidatures ne changent pas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % des pages publiques françaises ont un équivalent anglais joignable en un clic par le sélecteur de langue, et inversement.
- **SC-002**: Sur une base sans traduction, aucun texte fixe français n'apparaît sur une page anglaise (hors contenus saisis, signalés).
- **SC-003**: 100 % des passages en français d'une page anglaise sont déclarés comme français.
- **SC-004**: L'administrateur traduit une action complète (titre, résumé, description, impact, textes de trois photographies) en moins de 10 minutes, textes prêts.
- **SC-005**: 0 lien français déjà partagé ne casse.
- **SC-006**: Les pages françaises ne présentent aucune régression visuelle en dehors du sélecteur de langue.

## Assumptions

- Les traductions sont écrites par le club ; la fonctionnalité ne traduit rien elle-même.
- Le français reste la langue de référence : un contenu existe d'abord en français ; l'anglais est un complément facultatif.
- Les noms propres (club, membres, partenaires, lieux géographiques saisis) ne sont pas traduits automatiquement ; le lieu d'une actualité peut toutefois recevoir une forme anglaise.
- Les intitulés des questions de la FAQ, comme tous les textes fixes, sont traduits dans le code.
- Aucune dépendance n'est ajoutée sans justification écrite dans le plan.
