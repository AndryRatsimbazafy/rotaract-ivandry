# Tasks: Pages de détail

**Input**: Design documents from `/specs/013-detail-pages/`

**Prerequisites**: plan.md, spec.md, research.md (R1 à R9), data-model.md, contracts/front-office.md, quickstart.md

**Tests**: aucun test automatisé (constitution, principe IX). Chaque récit se termine par une tâche de **vérification manuelle** tirée de `quickstart.md`, avec `npm run lint` et `npm run build`.

**Organization**: la phase 2 pose la lecture par slug, les chemins, les dates, le groupe de routes `(liste)` et la page introuvable, dont dépendent tous les récits. US1 (action) et US2 (actualité) sont indépendants ; US3 (introuvable et panne) ajoute la page d'erreur et vérifie les statuts.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : peut se faire en parallèle (fichier différent, aucune dépendance sur une tâche non terminée).
- **[Story]** : récit concerné (US1 à US3).

## Path Conventions

- Seule `apps/web` change : TypeScript 5, ESLint, guillemets doubles, alias `@/*`, CSS Modules et tokens de `src/app/tokens.css`.
- Avant d'écrire du code Next.js, consulter `apps/web/node_modules/next/dist/docs/` (routes dynamiques, `not-found`, `error`, `generateMetadata`).
- Commentaires en français, sobres, comme dans le code existant.
- Node 22 : `export PATH=$HOME/.nvm/versions/node/v22.23.3/bin:$PATH`.

## Décisions verrouillées à respecter

1. **Aucune dépendance, aucune variable d'environnement, aucun changement d'API ni de Back Office.**
2. **Statut 404 réel** pour un contenu non publié ou inconnu ; **une panne n'est jamais une 404** (R1, R2).
3. **Rien d'inventé** : rubrique d'impact vide absente, aucun texte de substitution ; gabarit photographique seulement dans l'ouverture d'une action sans photographie.
4. **`DESIGN.md` d'abord** (phase 1). Compositions propres à chaque page, aucune grille de cartes.
5. **Dates** : `lib/dates.ts` reste le seul fichier à porter un fuseau ; actualité en heure de Madagascar, date d'une action sans conversion (temps universel).

---

## Phase 1: Setup (documents de référence)

- [X] T001 Mettre à jour `DESIGN.md` d'après `plan.md`, section A, mot pour mot :
  - section 10 : remplacer le paragraphe « **La fiche dépliable.** … » par « **Le lien vers la page.** … » ; ajouter « **La page d'une action : le reportage.** … » et « **La page d'une actualité : l'article.** … » ;
  - section 12, ligne « Dépliant » : « (FAQ, filtre des domaines) » ;
  - section 9 : ligne « Page introuvable » dans le tableau ; la ligne « Erreur » renvoie à la page d'erreur ;
  - section 17 : lignes « **Action (détail)** » et « **Actualité (détail)** », qui résument les deux compositions.
- [X] T002 [P] Mettre à jour `ARCHITECTURE.md` d'après `plan.md`, section A : section 6 (`GET /actions/:slug` et `GET /news/:slug` : pages `/actions/<slug>` et `/actualites/<slug>` du Front Office ; retirer « page à venir ») ; section 10 (sous-section « Pages de détail (fonctionnalité 013) » : `getActionBySlug`, `getNewsBySlug`, `apiGetOrNull`, 404 → page introuvable, autre erreur → page d'erreur, rendu à la demande, groupe de routes `(liste)`) ; section 15 (étape 12).

---

## Phase 2: Foundational

**Purpose**: lecture par slug, chemins, dates, structure des routes, page introuvable. ⚠️ Bloque tous les récits.

- [X] T003 [P] `apps/web/src/lib/api.ts` : ajouter `apiGetOrNull<T>(path, params?)` : mêmes options que `apiGet` (`next: { revalidate: REVALIDATE_SECONDS }`, délai de 10 s) ; statut `404` → `null` ; tout autre statut ≠ `200` lève `Error("Lecture refusée (<statut>).")`. Commentaire : « 404 : le contenu n'existe pas ou n'est pas publié ; toute autre erreur n'est pas une absence. »
- [X] T004 [P] `apps/web/src/config/routes.ts` : `actionPath(slug)` → `` `${routes.actions}/${encodeURIComponent(slug)}` `` et `newsItemPath(slug)` → `` `${routes.news}/${encodeURIComponent(slug)}` ``.
- [X] T005 [P] `apps/web/src/lib/dates.ts` : `formatFullDate(isoDate)` (« 14 mars 2026 », `Indian/Antananarivo`) et `formatCalendarDate(isoDate)` (« 14 mars 2026 », `timeZone: "UTC"`, pour la date sans heure d'une action). Mettre à jour le commentaire de tête.
- [X] T006 `apps/web/src/data/actions.ts` : `getActionBySlug(slug): Promise<Action | null>` par `apiGetOrNull<ApiAction>("/actions/" + encodeURIComponent(slug))`, puis `toAction` ; une erreur remonte (pas de `try`). `apps/web/src/data/news.ts` : `getNewsBySlug` de même, avec `toNewsItem` (dépend de T003).
- [X] T007 Déplacer les pages de liste dans un groupe de routes (research R2), avec `git mv` :
  - `apps/web/src/app/actions/page.tsx` → `apps/web/src/app/actions/(liste)/page.tsx`, `loading.tsx` de même ;
  - `apps/web/src/app/actualites/page.tsx` → `apps/web/src/app/actualites/(liste)/page.tsx`, `loading.tsx` de même ;
  - corriger les imports relatifs (`./_sections/…` → `../_sections/…`) ; `_sections` ne bouge pas.

  Vérifier : `/actions` et `/actualites` répondent `200` comme avant, filtres et ancre `#liste` compris.
- [X] T008 [P] `apps/web/src/content/common.ts` : textes des pages système : `notFoundPage` (`code: "404"`, `title: "Cette page n'existe pas, ou plus."`, `text: "L'adresse est peut-être ancienne, ou le contenu a été retiré."`, liens Accueil, Actions, Actualités) et `errorPage` (`title: "Le contenu n'a pas pu être chargé."`, `text: "Réessayez dans un instant."`, `retry: "Réessayer"`, `home: "Revenir à l'accueil"`).
- [X] T009 Créer `apps/web/src/app/not-found.tsx` et `not-found.module.css` (dépend de T008) : composition « Page introuvable » de `DESIGN.md`, section 9 (T001) : « 404 » en chiffre monumental au trait dans la marge (même procédé que `.numeral` de `app/_sections/About.module.css`), `h1`, phrase, trois `ArrowLink`. `export const metadata = { title: "Page introuvable" }`. Responsive : chiffre au-dessus du titre sous 1024 px.

**Checkpoint** : `/nimporte-quoi` répond `404` avec la page du site ; les listes sont inchangées.

---

## Phase 3: User Story 1 - Lire et partager une action (Priority: P1) 🎯 MVP

**Goal** : la page `/actions/<slug>` et tous les liens qui y mènent.

**Independent Test** : `quickstart.md`, section 1.

- [X] T010 [P] [US1] `apps/web/src/content/actions.ts` : `actionPage` avec `label: "Action"`, `yearLabel` (reprendre celui des listes), `impactTitle: "Impact"`, `plateTitle: "Sur le terrain"` (titre de la planche, visible par les lecteurs d'écran seulement si la composition n'en montre pas), `backLabel: "Toutes les actions"`, `onward` (liens vers Actualités et Membres). `actionsIndex.moreLabel` reste « Lire la suite ».
- [X] T011 [US1] Créer `apps/web/src/app/actions/[slug]/_sections/ActionStory.tsx` et `.module.css` : composition « La page d'une action : le reportage » (`DESIGN.md`, section 10, T001), parties ouverture, accroche, récit, fiche d'impact :
  - marge gauche (deux colonnes à partir de 1024 px) : `label` « Action », « Année Rotary <année> », `formatCalendarDate(action.date)` dans `<time dateTime>`, domaines (titres de `focusAreas.areas` de `content/home.ts`) ;
  - `h1` condensé très grand sur huit colonnes, posé sur un aplat blanc qui mord la photographie (procédé de l'action principale de `app/_sections/LatestActions.module.css`) ;
  - `PhotoFrame` de `action.photos[0]`, format 3:2, `priority`, à bord perdu à droite ; sans photographie, le gabarit (`brief` : « Photographie principale de l'action. ») ;
  - sur feuille blanche : `summary` en accroche (voix de récit, `--text-statement-size`), puis `description` en paragraphes sur `--container-reading` ;
  - en marge droite : la fiche d'impact `<dl>` (une ligne par rubrique renseignée parmi `objective`, `beneficiaries`, `location`, `period`, `results`, intitulés de `actionsIndex.impactLabels`, filets encre, intitulé en étiquette), puis « Partenaires » si `impact.partners` n'est pas vide ; rien si aucune rubrique ;
  - téléphone : marge au-dessus du titre, fiche d'impact sous le récit.
- [X] T012 [US1] Créer `apps/web/src/app/actions/[slug]/_sections/ActionPlate.tsx` et `.module.css` : la planche des photographies 2 à n (`DESIGN.md`, section 10) : motif répété d'une grande (huit colonnes, 3:2) puis de deux plus petites décalées (4:5 et 3:2, hauteurs de départ différentes) ; chaque image par `PhotoFrame` avec légende et crédit ; `sizes` adaptés (100vw sur téléphone) ; jamais de vignettes égales ; rien si l'action n'a qu'une photographie.
- [X] T013 [US1] Créer `apps/web/src/app/actions/[slug]/page.tsx` (dépend de T006, T011, T012) :
  - `await connection()` (commentaire repris de `app/page.tsx`) ;
  - `const action = await getActionBySlug(slug)` ; `if (!action) notFound()` ;
  - rendu : `ActionStory`, `ActionPlate`, `ArrowLink` « Toutes les actions » vers `routes.actions`, `Onward`, `JoinReminder` ;
  - `generateMetadata` (R5) : `title` ; `description` (résumé, sinon premier paragraphe, ≤ 160 caractères coupés sur un mot avec « … ») ; `openGraph: { type: "article", title, description, images }` avec la photographie principale (`url`, `width`, `height`, `alt`), sinon `(await getSiteSettings()).photos["accueil-ouverture"]`, sinon aucune ; `null` → `notFound()`.

  Mettre la fonction de description dans `apps/web/src/lib/paragraphs.ts` (`toExcerpt(text, max = 160)`), partagée avec US2.
- [X] T014 [P] [US1] `apps/web/src/app/_sections/LatestActions.tsx` : `href: actionPath(action.slug)` (retirer le commentaire « La page de détail … n'existe pas encore ») ; vérifier que le titre et la photographie sont tous deux des liens ; les emplacements (`placeholderEntries`) restent sans lien.
- [X] T015 [US1] `apps/web/src/app/actions/_sections/ActionsIndex.tsx` et `ActionsIndex.module.css` :
  - ajouter `slug` à `Entry` (vide pour les emplacements) ;
  - titre `h3` : lien `Link` vers `actionPath(slug)` (classe de lien sans soulignement, survol : le titre passe au bleu) ; photographie principale enveloppée du même lien, `aria-hidden` et `tabIndex={-1}` pour ne pas doubler le lien au clavier ; grossissement de 3 % au survol sur pointeur précis (règle de `LatestActions.module.css`) ;
  - remplacer le `details.fold` par `ArrowLink` « Lire la suite » vers la page, affiché pour tout contenu publié ;
  - retirer de la liste `description`, `facts` et les photographies suivantes (et leurs styles `.more`, `.moreSummary`, `.facts`, `.plate` devenus inutiles) ; garder `summary` et la ligne `impact` ;
  - les emplacements restent sans lien.
- [ ] T016 [US1] Vérification manuelle : `quickstart.md`, section 1 ; `npm run lint --workspace=web` et `npm run build:web`.

**Checkpoint** : US1 livrable seule.

---

## Phase 4: User Story 2 - Lire et partager une actualité (Priority: P1)

**Goal** : la page `/actualites/<slug>` et tous les liens qui y mènent.

**Independent Test** : `quickstart.md`, section 2.

- [X] T017 [P] [US2] `apps/web/src/content/news.ts` : `newsPage` avec `yearLabel`, `locationLabel` (reprendre « Lieu »), `backLabel: "Toutes les actualités"`, `onward` (liens vers Actions et Membres) ; `newsRegister.more` et `newsFeature.more` restent « Lire la suite ».
- [X] T018 [US2] Créer `apps/web/src/app/actualites/[slug]/_sections/NewsArticle.tsx` et `.module.css` : composition « La page d'une actualité : l'article » (`DESIGN.md`, section 10, T001) :
  - ouverture typographique sur le fond de page : `formatDay(date)` en chiffre monumental au trait dans la marge gauche (procédé de `NewsFeature.module.css`, `.day`), `formatMonthYear(date)` et `newsTypeLabels[type]` en étiquettes, `<time dateTime>` portant `formatFullDate(date)` pour les lecteurs d'écran ; `h1` en largeur normale, très grand ; dessous, le lieu (s'il existe) et « Année Rotary <année> » en métadonnées ;
  - photographie principale en 16:9 à bord perdu sous l'ouverture, `priority`, légende ; rien sinon (aucun gabarit) ;
  - sur feuille blanche : `summary` en chapeau (Open Sans 600), puis `body` en paragraphes, voix de récit, colonne de lecture décalée d'une colonne ;
  - photographies 2 à n dans la marge droite sur trois colonnes, au fil du texte, avec légende et crédit ; sous le texte sous 1024 px.
- [X] T019 [US2] Créer `apps/web/src/app/actualites/[slug]/page.tsx` (dépend de T006, T018), comme T013 : `connection()`, `getNewsBySlug`, `notFound()`, `NewsArticle`, `ArrowLink` « Toutes les actualités », `Onward` ; `generateMetadata` avec `toExcerpt` (T013) appliqué au résumé, sinon au premier paragraphe du texte.
- [X] T020 [P] [US2] `apps/web/src/app/_sections/LatestNews.tsx` : `href: newsItemPath(item.slug)` (retirer le commentaire « … n'existe pas encore »).
- [X] T021 [US2] `apps/web/src/app/actualites/_sections/NewsFeature.tsx` et `.module.css` : titre lié à `newsItemPath(slug)` ; photographie liée (même règle qu'en T015) ; `details.fold` remplacé par `ArrowLink` « Lire la suite » ; texte et photographies suivantes retirés ; l'emplacement (aucune actualité) reste sans lien.
- [X] T022 [US2] `apps/web/src/app/actualites/_sections/NewsRegister.tsx` et `.module.css` : dans chaque ligne, le titre devient un lien vers `newsItemPath(slug)` ; `details.fold`, texte et photographies retirés de la ligne ; l'état de survol de la ligne (`.row:has(details):hover`) devient `.row:has(.link:hover)` (« La ligne devient blanche, le jour passe au bleu », `DESIGN.md`, section 12) ; garder vignette, jour, type et résumé.
- [ ] T023 [US2] Vérification manuelle : `quickstart.md`, section 2 ; lint et build.

---

## Phase 5: User Story 3 - Arriver sur un contenu qui n'existe pas (Priority: P2)

**Goal** : statut 404 réel et page d'erreur distincte.

**Independent Test** : `quickstart.md`, section 3.

- [X] T024 [US3] Créer `apps/web/src/app/error.tsx` (`"use client"`) et `error.module.css` : composition de la page introuvable sans chiffre (`DESIGN.md`, section 9) : `h1` et phrase de `errorPage` (T008), bouton « Réessayer » (`button.module.css`, variante principale) qui appelle `reset()` (vérifier la signature de `error.js` dans les documents de Next 16 : `reset` ou `unstable_retry`), `ArrowLink` vers l'accueil. Aucun détail technique affiché.
- [ ] T025 [US3] Vérification manuelle : `quickstart.md`, section 3, avec `curl -w "%{http_code}"` pour chaque cas ; puis section 4 (listes inchangées).

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T026 [P] Contrôles de périmètre : `git diff --stat main -- apps/api apps/admin '*/package.json' package-lock.json` est vide ; `grep -rn "fold" apps/web/src` ne trouve que la FAQ, le filtre des domaines et `globals.css` ; aucun reste de « n'existe pas encore » dans `apps/web/src`.
- [X] T027 Documentation de fin : `ARCHITECTURE.md` (en-tête « Implémenté », étape 12 faite) ; `PROJECT_CONTEXT.md` (état du Front Office : pages de détail, page introuvable, page d'erreur, structure `app/` avec `(liste)` et `[slug]`, « Fait », prochaines étapes) ; ligne d'état de `CLAUDE.md`.
- [ ] T028 Contrôle final : `npm run lint` et `npm run build` (les trois applications) ; quickstart en entier ; nettoyage (section 5).
- [X] T029 Mettre à jour le guide publié (`https://claude.ai/artifact/LNKaGG9d13Jesiqoc1nC4Y`) : pages de détail dans « Le site public » (adresse partageable, « Lire la suite »), champ Slug (adresse de la page), retrait des repères « 013 · en préparation ».

---

## Dependencies & Execution Order

- **Phase 1** (T001, T002) avant tout code.
- **Phase 2** bloque les récits : T003 → T006 ; T004, T005, T008 en parallèle ; T007 indépendant ; T008 → T009.
- **US1** et **US2** ne dépendent que de la phase 2 ; `toExcerpt` (T013) sert à T019 : si US2 passe avant US1, créer `toExcerpt` dans T019.
- **US3** dépend de la phase 2 (page introuvable) et vérifie US1 et US2 ; T024 est indépendante.
- **Phase 6** en dernier.

### Parallel Opportunities

- Phase 2 : T003, T004, T005, T007, T008.
- US1 : T010 et T014 dès le début ; T011 et T012 en parallèle.
- US2 : T017 et T020 dès le début ; T021 et T022 en parallèle après T018.

## Implementation Strategy

1. **MVP** : phases 1, 2 et 3 (page d'une action et ses liens), vérifiées par `quickstart.md`, section 1.
2. **Incrément 2** : US2 (actualité).
3. **Incrément 3** : US3 (page d'erreur, vérification des statuts).
4. Polish, puis mise à jour du guide.
