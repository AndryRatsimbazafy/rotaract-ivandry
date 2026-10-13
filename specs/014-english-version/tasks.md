# Tasks: Version anglaise

**Input**: Design documents from `/specs/014-english-version/`

**Prerequisites**: plan.md, spec.md, research.md (R1 à R12), data-model.md, contracts/api-translations.md, contracts/front-office.md, contracts/admin-screens.md, quickstart.md

**Tests**: aucun test automatisé (constitution, principe IX). Chaque récit se termine par une **vérification manuelle** tirée de `quickstart.md`, avec `npm run lint` et `npm run build`.

**Organization**: la phase 2 pose la structure à deux langues du site (routes `[lang]`, `proxy.ts`, dictionnaires, liens, dates) sans changer le français. US1 traduit tous les textes fixes et ajoute le sélecteur ; US2 ajoute les champs anglais de bout en bout (API, Back Office, résolution dans le site) ; US3 traduit la candidature.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : peut se faire en parallèle (fichier différent, aucune dépendance sur une tâche non terminée).
- **[Story]** : récit concerné (US1 à US3).

## Path Conventions

| Application | Style |
|---|---|
| `apps/api` | TypeScript 6, NestJS, Prettier (guillemets simples), oxlint |
| `apps/admin`, `apps/web` | TypeScript 5, ESLint, guillemets doubles, alias `@/*` |

- Avant d'écrire du code Next.js : `apps/web/node_modules/next/dist/docs/01-app/02-guides/internationalization.md`, `03-api-reference/04-functions/next-root-params.md`, `03-api-reference/03-file-conventions/proxy.md`.
- Node 22 : `export PATH=$HOME/.nvm/versions/node/v22.23.3/bin:$PATH`. Ne jamais lancer `npm run build:api` pendant que le serveur de dev de l'API tourne (même dossier `dist/`).

## Décisions verrouillées à respecter

1. **Adresses françaises inchangées** ; anglais = `/en` + adresse française (Q1).
2. **Aucune dépendance, aucune variable d'environnement.**
3. **Rien d'inventé** : une traduction absente affiche le français, déclaré `lang="fr"` et signalé « In French » ; un champ français absent reste absent dans les deux langues.
4. **Back Office en français** ; l'API reste en français.
5. **Documents d'abord** (phase 1).

---

## Phase 1: Setup (documents de référence)

- [X] T001 Mettre à jour `CLAUDE.md` : remplacer « Public UI is French only for v1. Keep the architecture ready for French + English, but do not implement English. » par la règle de 014 (site public en français à ses adresses et en anglais sous `/en`, `app/[lang]` et `src/proxy.ts`, dictionnaires `content/fr` et `content/en` de même forme, contenus anglais facultatifs saisis dans le Back Office, Back Office et API en français).
- [X] T002 [P] Mettre à jour `PROJECT_CONTEXT.md` : section 9, retirer « solution d'internationalisation » des points repoussés ; section 10, retirer « version anglaise » du hors périmètre.
- [X] T003 [P] Mettre à jour `ARCHITECTURE.md` d'après `plan.md`, section A : section 1 (champs `en` de l'action, de l'actualité, des réglages, avec les limites de `data-model.md`) ; section 2 (`altEn` 1 à 300 caractères, `captionEn` 300 au plus) ; section 6 (les corps acceptent `en` ; `null` retire) ; section 10 (sous-section « Deux langues (fonctionnalité 014) » : adresses, `proxy.ts`, `next/root-params`, dictionnaires, résolution `Localized`, repli et repère) ; section 11 (section « English (facultatif) ») ; section 14 (décision 22 : « Deux langues : français de référence à ses adresses, anglais sous `/en` ; champs anglais facultatifs ; aucune traduction automatique ; Back Office et API en français ») ; section 15 (étape 13).
- [X] T004 [P] Mettre à jour `DESIGN.md` avec les trois textes de `plan.md`, section A, mot pour mot : « Sélecteur de langue » (section 9, ligne du tableau), « Mention de langue » (section 8), « Typographie anglaise » (section 4, après « Typographie française ») ; section « Portée » : le Front Office existe en français et en anglais.

---

## Phase 2: Foundational (structure à deux langues, français inchangé)

**Purpose**: le site tourne sous `[lang]` avec `proxy.ts`, lit ses textes par `getContent()`, ses liens par `localize` et ses dates par langue ; en anglais, il affiche encore les textes français. ⚠️ Bloque tous les récits.

- [X] T005 Déplacer, avec `git mv`, tout le contenu de `apps/web/src/app/` sous `apps/web/src/app/[lang]/`, sauf `globals.css`, `tokens.css` et `icon.png` : `layout.tsx`, `layout.module.css`, `page.tsx`, `not-found.tsx`, `error.tsx`, `system-page.module.css`, `_sections/`, `actions/`, `actualites/`, `membres/`, `rejoindre/`. Corriger les imports relatifs vers `globals.css` et `tokens.css` dans `layout.tsx`.
- [X] T006 `apps/web/src/lib/locale.ts` (nouveau) : `export const LANGS = ["fr", "en"] as const`, `type Lang`, `isLang(value)`, `currentLang()` (`lang()` de `next/root-params`, `notFound()` si la valeur n'est pas une langue), `localize(href, lang)` (préfixe `/en` sauf pour `fr` ; `"/"` → `"/en"` ; garde `?…` et `#…`), `switchLanguage(pathname, search, target)` (ajoute ou retire `/en`). Commentaire : adresse anglaise = `/en` + adresse française (014, Q1).
- [X] T007 `apps/web/src/app/[lang]/layout.tsx` : `params` → `lang` ; `if (!isLang(lang)) notFound()` ; `<html lang={lang}>` ; `generateMetadata` à la place de `metadata` (titre et description du dictionnaire, `openGraph.locale` `fr_FR` ou `en_GB`).
- [X] T008 `apps/web/src/app/[lang]/[...missing]/page.tsx` (nouveau) : appelle `notFound()`, pour que toute adresse inconnue rende `app/[lang]/not-found.tsx` dans la mise en page.
- [X] T009 `apps/web/src/proxy.ts` (nouveau, contrat `front-office.md`) : `/en` et `/en/…` passent ; `/fr` et `/fr/…` → `NextResponse.redirect` `308` sans `/fr` ; sinon `NextResponse.rewrite` vers `/fr` + chemin (requête gardée) ; `config.matcher` : `["/((?!_next|images|icon.png|.*\\..*).*)"]`.
- [X] T010 Déplacer `apps/web/src/content/*.ts` vers `apps/web/src/content/fr/` (`git mv`, contenu inchangé, imports internes corrigés) ; déplacer les libellés de navigation et de réseaux sociaux de `config/routes.ts` et `config/site.ts` qui sont du texte (`mainNavigation[].label`, `site.description`, libellés des réseaux) dans `content/fr/common.ts` ou `content/fr/pages.ts`, en gardant les chemins et les identifiants dans `config/`.
- [X] T011 `apps/web/src/content/index.ts` (nouveau) : `type Content` (forme de l'ensemble français) ; `getContent(): Promise<Content>` par `currentLang()` ; `contentFor(lang)` pour les actions serveur et les composants client ; à ce stade, `en` renvoie le dictionnaire français (rempli en US1).
- [X] T012 Remplacer, dans tous les fichiers listés par `grep -rl "@/content/" apps/web/src` (sections de `app/[lang]/`, `components/layout/*`, `components/sections/JoinReminder.tsx`, `components/media/PhotoFrame.tsx`, `data/applications.ts`), les imports de `@/content/<fichier>` par `const t = await getContent()` (composants serveur, rendus `async` si besoin) ; pour les composants client (`ApplicationForm`, `MobileMenu`, `NavLink`, `error.tsx`), passer les textes en propriétés depuis leur parent serveur, `error.tsx` choisissant `contentFor(lang)` d'après `usePathname()`.
- [X] T013 Passer tous les liens internes par `localize(href, lang)` : `components/layout/SiteHeader.tsx`, `SiteFooter.tsx`, `SiteNav.tsx`, `MobileMenu.tsx`, `NavLink.tsx` (comparaison de la page courante sur l'adresse sans `/en`), `components/ui/ArrowLink.tsx` (ou ses appelants), `components/sections/Onward.tsx`, `JoinReminder.tsx`, `config/routes.ts` (`actionPath`, `newsItemPath` prennent `lang`), `app/[lang]/actions/_sections/ActionsIndex.tsx` (`filterHref`), `app/[lang]/actualites/_sections/*` (`newsHref`), `app/[lang]/membres/_sections/MembersOpening.tsx` (liens d'année), `app/[lang]/not-found.tsx`.
- [X] T014 [P] `apps/web/src/lib/dates.ts` : chaque fonction prend `lang` et choisit `fr-FR` ou `en-GB` ; fuseaux inchangés ; mettre à jour les appelants (`LatestNews`, `NewsFeature`, `NewsRegister`, `NewsArticle`, `ActionStory`).
- [X] T015 Vérification de non-régression française : `quickstart.md`, section 0 (statuts `200`, `308` de `/fr/actions`, `404` de `/nimporte-quoi`, pages identiques) ; `/en` répond `200` (textes encore français) ; `npm run lint --workspace=web`, `npm run build:web`.

**Checkpoint** : site français inchangé, `/en/…` servi.

---

## Phase 3: User Story 1 - Lire le site en anglais (Priority: P1) 🎯 MVP

**Goal** : tous les textes fixes en anglais, sélecteur de langue, métadonnées.

**Independent Test** : `quickstart.md`, section 1.

- [X] T016 [P] [US1] `apps/web/src/content/en/common.ts`, `pages.ts` : traduction complète de `content/fr/common.ts` et `pages.ts` (libellés partagés, « Rotary year », emplacements « Photograph to come » / « Content to come », page introuvable, page d'erreur, navigation, titres et descriptions de page, « In French »). Typographie anglaise de `DESIGN.md` (T004).
- [X] T017 [P] [US1] `apps/web/src/content/en/home.ts` : traduction de `content/fr/home.ts` (ouverture, « Who are we? », valeurs, sept domaines d'action, actions récentes, vie du club, collectif, appel, intitulés de la fiche du club : « Founded », « Sponsor club », « Members », « Meetings », « Rhythm », texte alternatif de la photographie d'ouverture).
- [X] T018 [P] [US1] `apps/web/src/content/en/actions.ts`, `news.ts` : traduction (définition « Action » en entrée de dictionnaire anglaise, filtres, libellés d'impact, cinq types d'actualité, registre, archives, pages de détail).
- [X] T019 [P] [US1] `apps/web/src/content/en/members.ts` : traduction (ouverture, annuaire, dix fonctions du club).
- [X] T020 [P] [US1] `apps/web/src/content/en/join.ts` : traduction (recrutement, valeurs, domaines, parcours, quatre questions du Rotary dans leur formulation officielle anglaise « The Four-Way Test », candidature, intitulés et réponses de la FAQ, liens de sortie).
- [X] T021 [US1] `apps/web/src/content/index.ts` : brancher `en` ; typer chaque fichier anglais par la forme française (`satisfies`) pour qu'un texte manquant casse la compilation.
- [X] T022 [US1] `apps/web/src/components/layout/LanguageSwitch.tsx` (+ CSS, client) : « FR · EN » en étiquettes ; langue courante en encre, filet bleu de 2 px, `aria-current="true"` ; l'autre en lien (`switchLanguage(usePathname(), useSearchParams())`, `hrefLang`, `lang`) ; libellé accessible « Version française » / « English version ». L'ajouter dans la une de `SiteHeader.tsx` (avant les réseaux sociaux) et au bas de `MobileMenu.tsx`.
- [X] T023 [US1] Métadonnées : dans chaque `generateMetadata` et `metadata` des pages (`app/[lang]/page.tsx`, listes, détails, `membres`, `rejoindre`, `not-found.tsx`), textes du dictionnaire et `alternates.languages` `{ fr: <adresse française>, en: <adresse /en>, "x-default": <adresse française> }` ; `openGraph.locale`.
- [X] T024 [US1] Vérification manuelle : `quickstart.md`, section 1 ; recherche de tout texte français restant sur `/en`, `/en/actions`, `/en/actualites`, `/en/membres`, `/en/rejoindre`, `/en/nimporte-quoi` ; lint et build.

**Checkpoint** : US1 livrable seule (les contenus saisis s'y lisent en français, sans repère tant qu'US2 n'est pas faite).

---

## Phase 4: User Story 2 - Traduire une action, une actualité et les réglages (Priority: P1)

**Goal** : champs anglais facultatifs de bout en bout, repli signalé.

**Independent Test** : `quickstart.md`, section 2.

### API

- [X] T025 [US2] `apps/api/src/common/dto/translation.dto.ts` (nouveau) : `trimOrNull` (espaces retirés, vide → `null`), `isSentAndNotNull`, et un décorateur de longueur avec message « <Champ> (anglais) compte N caractères au plus. ».
- [X] T026 [US2] Images : `apps/api/src/common/schemas/media-ref.schema.ts` (`altEn?: string` 1 à 300, `captionEn?: string` 300 au plus ; `toAdminImage` → `altEn`, `captionEn` ou `null` ; `toPublicImage` → seulement s'ils existent) ; `common/dto/image-fields.dto.ts` (`altEn`, `captionEn` facultatifs à l'envoi ; `null` retire au `PATCH`) ; `media/content-images.ts` (`storeImage` les enregistre, `imageFieldsUpdate` les écrit ou les retire).
- [X] T027 [US2] Actions : `apps/api/src/actions/schemas/action.schema.ts` (sous-schéma `en` sans `_id` : `title` ≤ 120, `summary` ≤ 500, `description` ≤ 20000, `impact` { `objective`, `beneficiaries`, `location`, `period`, `results` } ≤ 500 chacun) ; `dto/` (`ActionEnDto`, `ActionImpactEnDto`, champ `en` facultatif et nullable dans la création et la modification) ; `actions.service.ts` (écriture en chemins pointés `en.*`, `$unset` pour `null`, `en: null` retire tout ; vues publique et d'administration avec `en`, champs présents seulement).
- [X] T028 [US2] Actualités : `apps/api/src/news/schemas/news.schema.ts` (`en` : `title` ≤ 120, `summary` ≤ 500, `content` ≤ 20000, `location` ≤ 120) ; DTO ; `news.service.ts`, comme T027.
- [X] T029 [US2] Réglages du site : `apps/api/src/site-settings/schemas/site-settings.schema.ts` (`en.club` : `sponsorClub` ≤ 120, `meetingPlace` ≤ 160, `meetingRhythm` ≤ 160 ; `en.faq` : une propriété par `FaqQuestion`, ≤ 1000, aucune obligatoire) ; `dto/update-site-settings.dto.ts` (`en?: SiteSettingsEnDto`) ; `site-settings.service.ts` (`update()` écrit `en.club.*` et `en.faq.*` ; vues avec `en`).
- [X] T030 [US2] Vérifier : `npx tsc --noEmit -p tsconfig.json`, `npm run lint --workspace=api` ; validation des nouveaux DTO par un script hors API sur le DTO compilé (comme pour 012) : longueurs, `null`, clés inconnues ; `curl /api/v1/actions` inchangé sans traduction.

### Back Office

- [X] T031 [P] [US2] Types : `apps/admin/src/types/action.ts`, `news.ts`, `site-settings.ts` (`en?`), `media.ts` (`altEn`, `captionEn`).
- [X] T032 [US2] `apps/admin/src/components/ImageSheet.tsx` et `lib/image-forms.ts` : « Texte alternatif (anglais) » (≤ 300) et « Légende (anglais) » (≤ 300) sous les champs français ; envoyés à l'envoi (`imageUploadBody`) et au `PATCH` (`imageFieldsBody`, vide → `null`).
- [X] T033 [US2] `apps/admin/src/app/(admin)/actions/_components/ActionForm.tsx` et `actions/actions.ts` : section « English (facultatif) » après « Impact (facultatif) » (`contracts/admin-screens.md`) ; corps `en` (vide → `null`) à la création et à la modification ; erreurs `en.*` sous les champs.
- [X] T034 [US2] `apps/admin/src/app/(admin)/actualites/_components/NewsForm.tsx` et `actualites/actions.ts` : même chose (« Titre », « Lieu », « Résumé », « Contenu »).
- [X] T035 [US2] `apps/admin/src/app/(admin)/site/_components/ClubForm.tsx`, `FaqForm.tsx`, `site/actions.ts`, `site/page.tsx` : champs « … (anglais) » sous « Club parrain », « Lieu des réunions », « Rythme des réunions » et sous chaque réponse ; `saveClub` et `saveFaq` envoient aussi `en` ; aucune réponse anglaise obligatoire.

### Front Office

- [X] T036 [US2] Types et données : `apps/web/src/types/locale.ts` (`Localized = { text: string; lang: Lang }`) ; `types/action.ts`, `news.ts`, `site-settings.ts` (champs traduisibles en `Localized`) ; `types/media.ts` (`altLang`, `captionLang`) ; `data/media.ts`, `data/actions.ts`, `data/news.ts`, `data/site-settings.ts`, `data/members.ts` (portraits) : résolution selon `currentLang()` (`data-model.md`, table « Résolution »).
- [X] T037 [US2] `apps/web/src/components/ui/LangMark.tsx` (étiquette « In French » du dictionnaire, `label`, Charcoal) et rendu des `Localized` : `lang` posé sur l'élément quand il diffère de la page, une `LangMark` par bloc qui contient du français, dans `LatestActions`, `LatestNews`, `ActionsIndex`, `NewsFeature`, `NewsRegister`, `ActionStory`, `NewsArticle`, `About` (fiche du club), `JoinFaq` ; `PhotoFrame` pose `lang` sur l'image et la légende. Métadonnées des pages de détail : titre et description dans la langue résolue.
- [ ] T038 [US2] Vérification manuelle : `quickstart.md`, section 2 (avec une session du Back Office) ; lint et build des trois applications.

---

## Phase 5: User Story 3 - Candidater depuis la version anglaise (Priority: P2)

**Goal** : formulaire de candidature entièrement en anglais.

**Independent Test** : `quickstart.md`, section 3.

- [X] T039 [US3] `apps/web/src/data/applications.ts` : `submitApplication(formData, lang)` ; messages de `contentFor(lang).join` : en anglais, refus `400` traduit champ par champ (`errors.<champ>`), `413` → `cvTooLarge`, `415` → `cvFormat`, `429`, `503` ; en français, comportement actuel.
- [X] T040 [US3] `apps/web/src/app/[lang]/rejoindre/_sections/ApplicationForm.tsx` et `JoinApplication.tsx` : textes et langue en propriétés ; appel `submitApplication(formData, lang)` ; préfixe d'erreur « Error ».
- [ ] T041 [US3] Vérification manuelle : `quickstart.md`, section 3.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T042 [P] `apps/admin/DESIGN.md`, section Components : « Section English ».
- [X] T043 Contrôles : aucun `package.json` modifié ; `grep -rn "@/content/" apps/web/src` ne trouve que `content/index.ts` et les dictionnaires ; aucun lien interne sans `localize` (`grep -rn 'href="/' apps/web/src/app apps/web/src/components`) ; quickstart, section 4 (375 px, clavier).
- [X] T044 Documentation de fin : `ARCHITECTURE.md` (en-tête, étape 13 faite), `PROJECT_CONTEXT.md` (état, « Fait », structure `src/` : `app/[lang]`, `content/{fr,en}`, `proxy.ts`), ligne d'état de `CLAUDE.md`.
- [X] T045 Contrôle final : `npm run lint`, `npm run build` (API arrêtée pendant son build) ; quickstart en entier ; nettoyage.
- [X] T046 Mettre à jour le guide publié (`https://claude.ai/artifact/LNKaGG9d13Jesiqoc1nC4Y`) : version anglaise du site, sélecteur, sections « English » du Back Office, conseils de traduction.

---

## Dependencies & Execution Order

- **Phase 1** avant tout code.
- **Phase 2** : T005 → T006 → T007, T008, T009 ; T010 → T011 → T012 → T013 ; T014 en parallèle de T012 ; T015 en dernier.
- **US1** : T016 à T020 en parallèle, puis T021, puis T022 et T023.
- **US2** : API (T025 → T026 → T027, T028, T029 → T030), Back Office (T031 → T032 à T035), puis site (T036 → T037). Ne dépend d'US1 que pour les libellés anglais du repère.
- **US3** : après la phase 2 ; T039 → T040.
- **Phase 6** en dernier.

### Parallel Opportunities

- Phase 1 : T002, T003, T004.
- US1 : les cinq dictionnaires (T016 à T020).
- US2 : T027, T028 et T029 après T026 ; T033, T034 et T035 après T032.

## Implementation Strategy

1. **MVP** : phases 1, 2 et 3 : le site entier en anglais pour ses textes fixes, avec le sélecteur. Les contenus s'y lisent en français.
2. **Incrément 2** : US2, la traduction des contenus.
3. **Incrément 3** : US3, la candidature.
4. Polish et guide.
