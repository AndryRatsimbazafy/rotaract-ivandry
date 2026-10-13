# Feature Specification: Pages de détail

**Feature Branch**: `013-detail-pages`

**Created**: 2026-10-13

**Status**: Clarification close le 2026-10-13 (Q1) — en attente de validation avant le plan

**Input**: User description: « Fonctionnalité 013 « Pages de détail » : une page publique par action publiée (/actions/[slug]) et par actualité publiée (/actualites/[slug]) dans le Front Office, lue par src/data/* depuis GET /api/v1/actions/:slug et GET /api/v1/news/:slug (déjà en place dans l'API). Aujourd'hui la fiche complète se déplie sur place dans les listes (DESIGN.md, section 10, « La fiche dépliable. Tant que la page de détail n'existe pas ») ; la spec doit dire ce que deviennent ces dépliants et les liens des listes et de l'accueil. Contenu : titre, année Rotary, date, domaines ou type, description ou contenu en paragraphes, impact réel seulement, partenaires, lieu, toutes les photographies (légende, crédit, point d'intérêt). Contenu non publié ou slug inconnu : 404 du site. Métadonnées de page (titre, description, image de partage). Direction visuelle à proposer et à ajouter à DESIGN.md avant le code (composition propre à chaque page, pas de gabarit générique). »

**Références** :
- `DESIGN.md` : section 6 (composition), section 7 (photographie), section 8 (emplacements sans contenu), section 10 (actions et actualités, fiche dépliable), section 12 (mouvement), section 17 (direction par page).
- `ARCHITECTURE.md` : section 6 (`GET /actions/:slug`, `GET /news/:slug`), section 10 (Front Office → API, correspondances), section 13 (exemples JSON), section 14 (décisions 1, 13, 20).
- `specs/005-actions/`, `specs/006-news/` : slugs, publication, champs.
- `specs/009-front-office-integration/` : couche `src/data/*`, cache, pages de liste.
- `specs/011-image-storage/` : photographies des contenus.
- `.specify/memory/constitution.md` : principes VII et VIII.

## Contexte et périmètre

Une action ou une actualité publiée n'a pas d'adresse propre : sa fiche complète se déplie sur place dans la liste de sa page. On ne peut donc ni partager le lien d'une action, ni l'ouvrir depuis l'accueil, qui renvoie aujourd'hui vers la liste entière. L'API sert déjà le détail d'un contenu publié par son slug ; il manque les pages du site.

### Dans le périmètre

1. **Page d'une action** à l'adresse `/actions/<slug>` : tout ce que l'action porte de publiable.
2. **Page d'une actualité** à l'adresse `/actualites/<slug>`.
3. **Liens** : depuis la page Actions, la page Actualités et l'accueil, chaque action et chaque actualité mène à sa page.
4. **Sort des dépliants** des listes : ils disparaissent. Chaque contenu des listes montre son résumé, puis le lien « Lire la suite » vers sa page.
5. **Page introuvable** : un contenu non publié, supprimé ou un slug inconnu donne la page 404 du site.
6. **Métadonnées** : titre de l'onglet, description et image de partage propres à chaque page.
7. **Direction visuelle** : une composition pour chacune des deux pages, proposée et ajoutée à `DESIGN.md` avant le code.

### Hors périmètre

- Tout changement de l'API, du Back Office ou des données : les routes de détail existent et suffisent.
- Une page de détail pour les membres.
- Les commentaires, le partage vers des réseaux en un clic, une galerie plein écran (visionneuse).
- La navigation « action précédente / suivante » et les suggestions de contenus proches.
- Le registre d'impact agrégé (décision ouverte, `ARCHITECTURE.md`, section 14).
- La version anglaise ; les tests automatisés.

## Ce qui est déjà verrouillé

- **Lecture** : le site lit les données par `src/data/*` seulement, depuis son serveur, avec la revalidation d'environ 60 secondes (décision 20) ; l'API répond `404` pour un contenu non publié (`ARCHITECTURE.md`, section 6).
- **Impact sans faux contenu** (décision 1) : une rubrique d'impact vide ne s'affiche pas, sans texte de substitution.
- **Année Rotary explicite** (décision 13) : l'année affichée est celle du contenu, jamais déduite de sa date.
- **Dates des actualités** en heure de Madagascar (`src/lib/dates.ts`).
- **Photographies** (`DESIGN.md`, section 7) : texte alternatif, légende réelle, crédit s'il existe, point d'intérêt, jamais agrandies au-delà de leur taille d'origine.
- **Action et actualité** (`DESIGN.md`, section 10) : la photographie domine une action, la date domine une actualité.

## Points signalés avant rédaction

- **`DESIGN.md`, section 10, « La fiche dépliable »** est écrite « tant que la page de détail n'existe pas ». Elle est remplacée, avant le code, par la règle du lien « Lire la suite » vers la page du contenu (Q1). La règle « Dépliant » de la section 12 (mouvement) ne concerne plus alors que la FAQ et le filtre des domaines.
- **Date d'une action** : la spec 009 l'a laissée invisible (les actions se classent par année Rotary). Clarification de 2026-10-13 : la page d'une action l'affiche en métadonnée, en marge, avec l'année Rotary (FR-004) ; les listes restent sans date. C'est une date sans heure : elle s'affiche telle qu'enregistrée, sans conversion de fuseau.
- **Composition** : `DESIGN.md`, section 17 décrit cinq pages ; les deux pages de détail y gagnent chacune une ligne, proposée dans le plan.

## Clarifications

### Session 2026-10-13

- Q: Que deviennent les dépliants « Lire la suite » des pages Actions et Actualités ? → A: Ils sont remplacés par un lien vers la page du contenu ; la liste garde le résumé, et « Lire la suite » devient ce lien (FR-010).
- Q: La page d'une action doit-elle afficher la date de l'action ? → A: Oui, en métadonnée, en marge, avec l'année Rotary (FR-004). Cela lève, pour la page de détail seulement, la règle de 009 « la date d'une action n'est pas affichée » ; les listes restent sans date.

## User Scenarios & Testing *(mandatory)*

Vérifications manuelles uniquement (constitution, principe IX).

### User Story 1 - Lire et partager une action (Priority: P1)

Un visiteur voit une action sur l'accueil ou sur la page Actions, l'ouvre, et lit sur sa page tout ce que le club en a publié : le récit, l'impact, les partenaires et toutes les photographies. Il copie l'adresse de la page et l'envoie à quelqu'un, qui ouvre directement cette action.

**Why this priority**: les actions sont le cœur du site ; leur donner une adresse permet au club de les partager et rend l'accueil cliquable vers le bon contenu.

**Independent Test**: publier une action avec description, impact partiel et trois photographies ; l'ouvrir depuis l'accueil puis par « Lire la suite » sur la page Actions ; vérifier son contenu, puis ouvrir son adresse dans une nouvelle fenêtre.

**Acceptance Scenarios**:

1. **Given** une action publiée sur l'accueil, **When** le visiteur clique sur son titre ou sa photographie, **Then** il arrive sur `/actions/<slug>` de cette action.
2. **Given** la page d'une action, **When** elle s'affiche, **Then** elle montre le titre, l'année Rotary, la date, les domaines d'action, le résumé, la description en paragraphes, les rubriques d'impact renseignées, les partenaires et toutes les photographies dans leur ordre, chacune avec son texte alternatif, sa légende et son crédit quand ils existent.
3. **Given** une action dont l'impact n'a qu'une rubrique, **When** sa page s'affiche, **Then** seule cette rubrique apparaît, sans mention « à venir » ni rubrique vide.
4. **Given** une action sans photographie, **When** sa page s'affiche, **Then** la composition garde un emplacement photographique conforme à `DESIGN.md`, section 8, au lieu d'une image.
5. **Given** l'adresse d'une action partagée, **When** on l'ouvre directement, **Then** la page s'affiche avec un titre d'onglet, une description et une image de partage propres à l'action.

---

### User Story 2 - Lire et partager une actualité (Priority: P1)

Un visiteur ouvre une actualité depuis l'accueil ou le registre de la page Actualités et lit son texte complet sur sa page, avec sa date, son type, son lieu et ses photographies.

**Why this priority**: même besoin que l'histoire 1 ; le registre de l'accueil mène aujourd'hui à la page Actualités entière.

**Independent Test**: publier une actualité avec lieu, texte de trois paragraphes et une photographie ; l'ouvrir depuis l'accueil puis depuis le registre ; vérifier son contenu et sa date en heure de Madagascar.

**Acceptance Scenarios**:

1. **Given** une actualité du registre de l'accueil ou de la page Actualités, **When** le visiteur clique dessus, **Then** il arrive sur `/actualites/<slug>`.
2. **Given** la page d'une actualité, **When** elle s'affiche, **Then** elle montre la date (jour, mois et année en heure de Madagascar), le type, le titre, l'année Rotary, le lieu s'il existe, le résumé, le texte en paragraphes et toutes les photographies.
3. **Given** une actualité publiée un soir tard en heure de Madagascar, **When** sa page s'affiche, **Then** le jour affiché est celui de Madagascar, identique à celui du registre.
4. **Given** une actualité sans photographie, **When** sa page s'affiche, **Then** la composition reste complète, la date jouant le rôle dominant, sans gabarit photographique vide qui ressemblerait à une page inachevée.

---

### User Story 3 - Arriver sur un contenu qui n'existe pas (Priority: P2)

Un visiteur suit un ancien lien vers une action dépubliée ou supprimée, ou tape une adresse fausse. Il obtient la page introuvable du site, avec les moyens de repartir.

**Why this priority**: indispensable dès qu'il existe des liens partagés, mais sans valeur propre.

**Independent Test**: dépublier une action dont on a gardé l'adresse ; l'ouvrir après le délai de revalidation ; ouvrir aussi `/actions/nexiste-pas` et `/actualites/nexiste-pas`.

**Acceptance Scenarios**:

1. **Given** une action dépubliée, **When** on ouvre son ancienne adresse après le délai de revalidation, **Then** le site répond par sa page introuvable, avec le statut « introuvable ».
2. **Given** un slug qui n'existe pas, **When** on l'ouvre, **Then** même réponse, sans révéler si le contenu a existé.
3. **Given** l'API momentanément injoignable, **When** on ouvre une page déjà lue, **Then** la dernière version lue reste affichée ; pour une page jamais lue, le site affiche son message d'erreur habituel, pas la page introuvable.

---

### Edge Cases

- **Slug changé dans le Back Office** après partage : l'ancienne adresse donne la page introuvable (le Back Office prévient déjà de ce risque à la modification du slug d'un contenu publié).
- **Action sans résumé ni description** : la page montre le titre, les métadonnées et ce qui existe ; aucune phrase de substitution.
- **Vingt photographies** : toutes s'affichent, la première en principale ; la page reste lisible sur téléphone.
- **Image de partage** sans photographie : celle de l'ouverture du site (photographie fixe de l'accueil, fonctionnalité 012, à défaut celle livrée avec le site).
- **Titre très long** : il passe à la ligne sans déborder, sur téléphone comme sur ordinateur.
- **Mouvement réduit** : aucun mouvement ajouté par ces pages au-delà des règles de `DESIGN.md`, section 12.

## Requirements *(mandatory)*

### Functional Requirements

**Pages**

- **FR-001**: Le site MUST offrir une page par action publiée à l'adresse `/actions/<slug>` et une page par actualité publiée à l'adresse `/actualites/<slug>`, lues par la couche de données du site depuis le détail public de l'API.
- **FR-002**: Un contenu non publié, supprimé ou un slug inconnu MUST donner la page introuvable du site, avec le statut HTTP 404. Cette page, absente aujourd'hui, est créée selon une composition ajoutée à `DESIGN.md` ; elle sert aussi à toute adresse inconnue du site.
- **FR-003**: Une erreur de lecture autre que « introuvable » MUST NOT donner la page introuvable : la dernière version lue reste servie quand elle existe, sinon le site affiche son message d'erreur.
- **FR-004**: La page d'une action MUST montrer : titre, année Rotary, date (jour, mois, année, en métadonnée dans la marge, à côté de l'année Rotary ; date sans heure affichée telle qu'enregistrée, sans conversion de fuseau), domaines d'action, résumé, description en paragraphes, rubriques d'impact renseignées (objectif, bénéficiaires, lieu, période, résultats), partenaires, et toutes les photographies dans leur ordre. Une donnée absente n'a ni libellé ni emplacement, hormis l'emplacement photographique de `DESIGN.md`, section 8, quand l'action n'a aucune photographie.
- **FR-005**: La page d'une actualité MUST montrer : date (jour, mois, année, en heure de Madagascar), type, titre, année Rotary, lieu s'il existe, résumé, texte en paragraphes, et toutes les photographies dans leur ordre. Sans photographie, la composition reste complète sans gabarit photographique.
- **FR-006**: Chaque photographie MUST suivre `DESIGN.md`, section 7 : texte alternatif, légende et crédit quand ils existent, point d'intérêt gardé, jamais agrandie au-delà de sa taille d'origine, servie à une taille adaptée à l'écran.
- **FR-007**: Chaque page MUST offrir un retour vers sa liste (Actions ou Actualités) et les liens de sortie habituels du site.

**Liens et listes**

- **FR-008**: Sur l'accueil, chaque action des dernières actions et chaque ligne du registre des actualités MUST mener à la page du contenu, et non plus à la page de liste.
- **FR-009**: Sur la page Actions et sur la page Actualités, chaque contenu publié MUST mener à sa page, par son titre et par sa photographie principale quand elle existe.
- **FR-010**: Sur la page Actions et sur la page Actualités, le dépliant « Lire la suite » de chaque contenu MUST être remplacé par un lien « Lire la suite » vers sa page ; la liste garde le titre, les métadonnées, le résumé et la photographie principale, et ne montre plus la description, le texte complet, la fiche d'impact ni les photographies suivantes (la ligne d'impact déjà montrée sous le résumé d'une action reste). `DESIGN.md`, sections 10 et 12, est réécrit en conséquence avant le code.
- **FR-011**: Les filtres, l'ancre de liste et la pagination invisible des pages de liste MUST rester inchangés.

**Métadonnées**

- **FR-012**: Chaque page MUST avoir son titre d'onglet (« <titre du contenu> | Rotaract Club Ivandry »), une description tirée du résumé (à défaut, du début du texte, 160 caractères au plus) et une image de partage : la photographie principale, à défaut l'ouverture du site.

**Design**

- **FR-013**: Les deux pages MUST suivre une composition propre à chacune, proposée dans le plan et ajoutée à `DESIGN.md` (sections 10 et 17) avant le code : asymétrie contrôlée, grille et tokens existants, aucune grille de cartes ni gabarit générique, aucune composition copiée de l'accueil.
- **FR-014**: Les pages MUST être responsives, accessibles (titre unique de niveau 1, ordre de lecture logique, focus visible) et respecter `DESIGN.md`, section 12 (mouvement).

**Fraîcheur**

- **FR-015**: Une modification ou une dépublication faite dans le Back Office MUST se refléter sur la page après le délai de revalidation habituel, environ 60 secondes.

### Key Entities

- **Action** (existante) : slug, titre, résumé, description, date, année Rotary, domaines, impact (rubriques facultatives, partenaires compris), photographies. Lue par son slug.
- **Actualité** (existante) : slug, titre, type, date et heure, année Rotary, lieu, résumé, contenu, photographies. Lue par son slug.

Aucune entité nouvelle.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % des actions et actualités publiées ont une adresse propre qui s'ouvre directement, et chaque contenu de l'accueil et des listes y mène en un clic.
- **SC-002**: Une adresse d'action ou d'actualité partagée montre, dans un aperçu de lien, le titre, la description et l'image du contenu.
- **SC-003**: 100 % des adresses de contenus non publiés ou inconnus répondent par la page introuvable avec le statut 404.
- **SC-004**: Sur la page d'une action, aucune rubrique d'impact vide ni texte de substitution n'apparaît, quelle que soit la combinaison de rubriques renseignées.
- **SC-005**: Sur téléphone, la page d'une action de vingt photographies se lit sans défilement horizontal, et aucune image servie ne dépasse 500 Ko.
- **SC-006**: Les pages de liste gardent leurs filtres et leur ordre ; aucune régression visuelle en dehors du changement des dépliants et des liens.

## Assumptions

- Les routes de détail de l'API renvoient déjà tous les champs nécessaires, photographies comprises (fonctionnalité 011).
- Les pages de détail sont rendues à la demande à partir du cache de données, comme les pages de liste (décision 20).
- Le site n'a pas encore de page introuvable dessinée (seule celle de Next.js par défaut existe, constat du plan) : elle est créée par cette fonctionnalité, selon `DESIGN.md`, et sert à toutes les adresses inconnues du site.
- Le slug ne change pas après publication en temps normal ; le cas contraire est couvert par la page introuvable.
- Aucune dépendance n'est ajoutée.
