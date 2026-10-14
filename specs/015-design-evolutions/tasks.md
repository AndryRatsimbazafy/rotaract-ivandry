# Tasks: Évolutions design du site public

**Input**: Design documents from `/specs/015-design-evolutions/`

**Prerequisites**: plan.md, spec.md (Q1 à Q6), research.md (R1 à R7), data-model.md, contracts/api.md, contracts/front-office.md, contracts/admin-screens.md, quickstart.md

**Tests**: aucun test automatisé (constitution, principe IX). Chaque récit se termine par une **vérification manuelle** tirée de `quickstart.md`, avec `npm run lint` et `npm run build`.

**Organization** : les phases suivent l'ordre de livraison du plan, pas l'ordre des priorités. Le téléphone (US5) vient d'abord parce que la galerie (US2) en reprend les zones de l'encoche. Les données (API et Back Office) précèdent la page « Le club » (US3) et la frise (US4). Les images de partage (US1) viennent en dernier pour couvrir aussi `/club`. Chaque récit reste livrable seul.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : peut se faire en parallèle (fichier différent, aucune dépendance sur une tâche non terminée).
- **[Story]** : récit concerné (US1 à US5, numérotés comme dans la spec).

## Path Conventions

| Application | Style |
|---|---|
| `apps/api` | TypeScript 6, NestJS, Prettier (guillemets simples), oxlint |
| `apps/admin`, `apps/web` | TypeScript 5, ESLint, guillemets doubles, alias `@/*` |

- Avant d'écrire du code Next.js : `apps/web/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md`, `03-api-reference/04-functions/image-response.md`, `03-api-reference/04-functions/generate-viewport.md`.
- Node 22 : `export PATH=$HOME/.nvm/versions/node/v22.23.3/bin:$PATH`. Ne jamais lancer `npm run build:api` pendant que le serveur de dev de l'API tourne (même dossier `dist/`) ; utiliser `npx tsc --noEmit` dans `apps/api`.
- Tout nouveau texte fixe va dans `content/fr` **et** `content/en` (le type `Content` refuse un dictionnaire incomplet).

## Décisions verrouillées à respecter

1. **Aucune dépendance npm** ; un seul actif ajouté : `OpenSans-CondensedBold.ttf` (OFL), téléchargé seulement avec l'accord du porteur du projet.
2. **Rien d'inventé** : chiffre, histoire, président ou action absents n'ont pas de ligne ; aucun texte de substitution ; aucun compteur animé.
3. **`DESIGN.md` d'abord** (phase 1) ; Voile à 50 %, texte sur image en blanc et de l'étage graphique seulement.
4. **Deux langues** (014) : repli français déclaré `lang="fr"` et marqué « In French ».
5. **Présidents lus dans les mandats** (`roles` contient `president`) ; une action garde une seule année Rotary.

---

## Phase 1: Setup (documents de référence)

- [X] T001 Mettre à jour `DESIGN.md`. Pour chaque section :
  - **7 (Photographie)** : préciser que l'image de partage (photographie réelle du club, Voile, trait d'or, titre en blanc, logo) suit la règle du texte sur image et n'est pas une « image générée » ;
  - **9 (Interface)** : ajouter « Galerie plein écran » (dialogue, commandes nommées, position « 3 / 12 », légende et crédit, une seule photographie sans commandes) et « Navigation à six entrées » ;
  - **12 (Mouvement)** : ajouter les lignes « Galerie » (ouverture en fondu 320 ms, fermeture 200 ms, passage par défilement natif) et « Appui tactile » (changement de couleur 120 ms dès l'appui) ;
  - **14 (Responsive)** : ajouter les zones de l'encoche (en-tête, menu, pied de page, galerie) et la ligne « Le club » du tableau ;
  - **17 (Direction par page)** : ajouter « Le club » (ouverture, histoire, Rotaract et Rotary, chiffres clés, frise en filet vertical avec les années au trait en très grand, liens de sortie) et passer à « six pages ».
- [X] T002 [P] Mettre à jour `ARCHITECTURE.md` d'après `data-model.md` et `contracts/api.md` :
  - **section 1** : Action `highlighted` avec la règle des trois par année ; SiteSettings `history`, `en.history` (4 000 au plus) et `photos.club-ouverture` ;
  - **section 6** : corps `highlighted`, groupe `history` ;
  - **section 10** : `/club`, frise lue par `src/data/timeline.ts`, images de partage `opengraph-image`, emplacement `club-ouverture` et son repli ;
  - **section 11** : case « Action marquante », carte « Histoire du club » ;
  - **section 14** : décision 21 étendue (histoire, huitième emplacement) et nouvelle décision 23 (« Actions marquantes : cochées par l'administrateur, trois au plus par année Rotary, publiées ou non ; la frise montre les publiées ») ;
  - **section 15** : étape 14.
- [X] T003 [P] Mettre à jour `PROJECT_CONTEXT.md` (six pages publiques, `/club`, frise, images de partage, galerie, finitions téléphone ; entrée « Fait ») et `CLAUDE.md` (état du projet : fonctionnalité 015 en une phrase, sur le modèle des autres).

---

## Phase 2: Foundational (prérequis communs)

Aucun prérequis bloquant commun à tous les récits : chaque récit pose ce dont il a besoin. La phase 6 (données) bloque seulement US3 et US4.

---

## Phase 3: User Story 5 - Un site qui se tient sur téléphone (Priority: P2)

**Goal** : barre d'état accordée, rien sous l'encoche, retour immédiat à l'appui, pas d'agrandissement automatique des champs.

**Independent Test** : `quickstart.md`, section 4, sur un iPhone à encoche et un Android réels.

- [X] T004 [US5] Dans `apps/web/src/app/[lang]/layout.tsx`, exporter `viewport` (`themeColor: "#ffffff"`, `viewportFit: "cover"`, sans `maximumScale` ni `userScalable`) ; vérifier dans le HTML servi `<meta name="theme-color" content="#ffffff">` et `viewport-fit=cover`.
- [X] T005 [US5] Dans `apps/web/src/app/globals.css` :
  - `html { -webkit-tap-highlight-color: transparent; -webkit-text-size-adjust: 100%; }` ;
  - `a, button, summary, label { touch-action: manipulation; }` ;
  - `button { user-select: none; -webkit-user-select: none; }` ;
  - `input, textarea, select { font-size: max(1rem, 16px); }`, si les champs du formulaire n'ont pas déjà au moins 16 px (vérifier `apps/web/src/app/[lang]/rejoindre/**` avant) ;
  - gouttière de `.container` en `max(<gouttière actuelle>, env(safe-area-inset-left))` et de même à droite.
- [X] T006 [P] [US5] Zones de l'encoche :
  - `apps/web/src/components/layout/SiteHeader.module.css` : `padding-top: env(safe-area-inset-top, 0px)` sur l'en-tête fixe, et décalage de l'ancre et du focus sous l'en-tête ajusté si l'en-tête grandit ;
  - `MobileMenu.module.css` : `padding-bottom: calc(<valeur> + env(safe-area-inset-bottom, 0px))` et marges latérales en `max()` ;
  - `SiteFooter.module.css` : `padding-bottom` avec `env(safe-area-inset-bottom, 0px)`.
- [X] T007 [P] [US5] États d'appui `:active` (changement de couleur seulement, 120 ms, mêmes couleurs que le survol), hors de la media query de survol :
  - `apps/web/src/components/ui/ArrowLink.module.css` ;
  - `components/layout/SiteNav.module.css`, `LanguageSwitch.module.css`, `MobileMenu.module.css` ;
  - les lignes du registre et des listes cliquables dans `app/[lang]/actualites/**` et `app/[lang]/actions/**` ;
  - `components/ui/button.module.css` : déjà présent, à vérifier.
- [X] T008 [US5] Vérification manuelle : `quickstart.md`, section 4, puis `npm run lint --workspace=web` et `npm run build:web`. Signaler ce qui n'a pas pu être vu sur un appareil réel.

**Checkpoint** : US5 livrable seule.

> Fait : les champs avaient déjà 16 px (`ApplicationForm.module.css`, `--text-body-size: 1rem`). Pied de page laissé sans marge basse : sous la barre d'accueil ne passe que le nom du club tracé au trait, décoratif. `:active` ajouté aux 23 règles de couleur au survol, plus le lien fléché, la navigation et le sommaire. Vu sur appareil réel : non (aucun téléphone branché), à confirmer.

---

## Phase 4: User Story 2 - Parcourir les photographies en plein écran (Priority: P1)

**Goal** : chaque photographie d'une page de détail s'ouvre dans une galerie plein écran, au clavier, aux boutons et au balayage.

**Independent Test** : `quickstart.md`, section 2.

- [X] T009 [P] [US2] Ajouter `gallery` aux dictionnaires `apps/web/src/content/fr/common.ts` et `content/en/common.ts` (sous `chrome`), avec les libellés de `contracts/front-office.md`, section « Galerie » :
  - `open(alt)`, `dialog(title)` ;
  - `previous`, `next`, `close` ;
  - `position(n, total)` (« 3 / 12 ») et `announce(n, total)`.
- [X] T010 [US2] Créer `apps/web/src/components/media/PhotoGallery.tsx` (`"use client"`), selon research R2. Props : `photos: Photo[]`, `title: string`, `labels`, et `children(open)`, une fonction de rendu qui laisse la planche existante placer ses boutons.
  - **Ouverture et fermeture** : `<dialog>` ouvert par `showModal()`. La fermeture (`cancel`/Échap, bouton « Fermer », `popstate`) rend le focus au bouton d'ouverture. `history.pushState({ gallery: true }, "")` à l'ouverture, `history.back()` à une fermeture qui ne vient pas de `popstate`.
  - **Piste** : `<ul>` horizontale en défilement accroché, une diapositive par photographie, avec `next/image` (`sizes="100vw"`, `object-fit: contain`, chargement immédiat de la diapositive courante et de ses voisines).
  - **Passage et position** : flèches du clavier et boutons par `scrollTo` (`behavior` `"auto"` si `prefers-reduced-motion`). Position par `IntersectionObserver`, région `aria-live="polite"`.
  - **Textes** : légende et crédit avec `lang` de `frenchLang()`. Une seule photographie : pas de position ni de flèches.
- [X] T011 [US2] Créer `apps/web/src/components/media/PhotoGallery.module.css` :
  - fond encre plein, image entière centrée ;
  - commandes de 44 × 44 px au moins, focus visible blanc ;
  - zones de l'encoche par `env(safe-area-inset-*)` ;
  - `overscroll-behavior: contain` sur la piste, `html:has(dialog[open]) { overflow: hidden }` ;
  - ouverture en fondu de 320 ms, fermeture de 200 ms, courbe des tokens, aucun mouvement en mouvement réduit ;
  - bouton d'ouverture sans style propre : il garde la photographie et ajoute seulement focus et appui.
- [X] T012 [US2] Brancher la galerie dans `apps/web/src/app/[lang]/actions/[slug]/_components/ActionStory.tsx` : photographie principale et planche, chaque image dans un bouton d'ouverture, photographies dans leur ordre. La composition de la page ne change pas.
- [X] T013 [P] [US2] Brancher la galerie dans `apps/web/src/app/[lang]/actualites/[slug]/_components/NewsArticle.tsx`, de la même façon. Adapter les chemins réels des composants s'ils diffèrent.
- [X] T014 [US2] Vérification manuelle : `quickstart.md`, section 2, en français et en anglais, au clavier, au lecteur d'écran et au téléphone. Puis lint et build de `web`.

**Checkpoint** : US2 livrable seule.

> Fait : architecture finale en fournisseur + déclencheur (`PhotoGallery` englobe la page, `GalleryTrigger` se pose dans le cadre de chaque photographie par `PhotoFrame` `children`), textes résolus sur le serveur par `lib/gallery.ts`. Base locale vide : vérifié sur une page de test temporaire (supprimée) — ouverture « 2 / 3 », légende et crédit, ← →, dernière photographie (« suivante » désactivée), Échap avec retour du focus et retrait de l'entrée d'historique, retour du navigateur, défilement accroché et annonce à 375 px. Reste : vrai téléphone (balayage), lecteur d'écran, page anglaise avec un contenu réel.

---

## Phase 5: Données (API et Back Office) — prérequis de US3 et US4

- [X] T015 [P] [US4] API, actions :
  - `apps/api/src/actions/schemas/action.schema.ts` : `@Prop({ type: Boolean, default: false }) highlighted` ;
  - `dto/create-action.dto.ts` : `@IsOptional() @IsBoolean({ message: "L'indication « marquante » est vraie ou fausse." }) highlighted?: boolean` ;
  - `dto/update-action.dto.ts` : le même champ.
- [X] T016 [US4] API, `apps/api/src/actions/actions.service.ts` :
  - vue admin avec `highlighted` (booléen) ; vue publique avec `highlighted: true` seulement si l'action est marquée ;
  - création et modification enregistrent `highlighted` ;
  - règle FR-027 : avant d'écrire une action dont le résultat est `highlighted: true` (création, `highlighted` passé à `true`, ou `rotaryYear` changé sur une action marquée), compter les actions `{ rotaryYear, highlighted: true, _id: { $ne: id } }`. À 3 ou plus : `400`, `details[{ field: "highlighted", message: "L'année <label> compte déjà trois actions marquantes." }]`, avec `<label>` donné par `rotaryYearLabel` et le format d'erreur commun existant.
- [X] T017 [P] [US3] API, réglages du site :
  - `common/enums/site-photo-slot.enum.ts` : `ClubOuverture = 'club-ouverture'` ;
  - `site-settings/schemas/site-settings.schema.ts` : `history` (texte, 4 000 au plus) et `en.history` ;
  - `dto/update-site-settings.dto.ts` : groupe `history` (`string | null`, `@Length(1, 4000)` après `trimOrNull`, message « L'histoire du club compte 4000 caractères au plus. ») et `en.history` (`IsEnglishText("L'histoire du club", 4000)`) ;
  - `site-settings.service.ts` : groupe `history` dans `update()` (`null` ou vide pour vider), et `history` et `en.history` dans les vues publique et admin quand ils sont saisis.
- [X] T018 [US3] [US4] Vérifier l'API avec `npx tsc --noEmit` dans `apps/api`, puis `npm run lint --workspace=api` et `npm run format --workspace=api`. Contrôler les cas de `contracts/api.md` sur le code compilé, par un script dans le dossier temporaire et sans jeton forgé, ou par le Back Office si une session est ouverte.
- [X] T019 [P] [US4] Back Office, actions :
  - `apps/admin/src/types/action.ts` : `highlighted: boolean` ;
  - `app/(admin)/actions/_components/ActionForm.tsx` : case « Action marquante (frise du club) » après l'année Rotary, aide « Trois au plus par année Rotary. », erreur `highlighted` sous la case ;
  - `app/(admin)/actions/actions.ts` : envoyer `highlighted` (case cochée ou non) à la création et à la modification ;
  - `[id]/page.tsx` : valeur initiale ;
  - inspecteur de la liste : mention « Marquante » quand c'est le cas.
- [X] T020 [P] [US3] Back Office, écran « Site » :
  - `apps/admin/src/types/site-settings.ts` : `history?`, `en.history?`, emplacement `club-ouverture` ;
  - `content/site.ts` : emplacement « Le club — ouverture » et son aide (`contracts/admin-screens.md`) ;
  - nouveau `app/(admin)/site/_components/HistoryForm.tsx` sur le modèle de `ClubForm` : « Histoire » et « Histoire (anglais) » multilignes, aide sur les paragraphes ;
  - `site/actions.ts` : action d'enregistrement du groupe `history` avec `en.history`, par `save()` ;
  - `site/page.tsx` : carte placée après « Présentation du club », valeurs initiales.
- [X] T021 [US3] [US4] `npm run lint --workspace=admin` et `npm run build:admin`.

---

## Phase 6: User Story 3 - Découvrir le club sur sa propre page (Priority: P2)

**Goal** : page `/club` (et `/en/club`) en sixième entrée de navigation, avec histoire, lien Rotaract–Rotary, club parrain et chiffres réels.

**Independent Test** : `quickstart.md`, section 3, lignes « En-tête » à « Déposer « Le club — ouverture » ».

- [X] T022 [P] [US3] Front Office, données :
  - `apps/web/src/types/site-settings.ts` : `history?: string[]`, `historyFrench?: true`, emplacement `club-ouverture` ;
  - `src/data/site-settings.ts` : `history` découpé en paragraphes comme la FAQ, résolu selon la langue (`en.history`, sinon `history` avec `historyFrench`), ignoré si `history` est vide ; photographie `club-ouverture` par `toPhoto` ;
  - `src/data/actions.ts` : `highlighted` passé dans le type `Action` (`src/types/action.ts`).
- [X] T023 [P] [US3] Dictionnaires :
  - nouveaux `apps/web/src/content/fr/club.ts` et `content/en/club.ts` : titre et métadonnées, intitulés des sections, texte « Le Rotaract et le Rotary » sans chiffre ni date inventés, libellés des chiffres clés, intitulé de la frise, liens de sortie ;
  - enregistrement dans `content/dictionaries.ts` ;
  - `chrome.navigation.club` : « Le club » / « The club » ;
  - `home.about` : lien « En savoir plus sur le club » / « More about the club ».
- [X] T024 [US3] `apps/web/src/config/routes.ts` : `routes.club = "/club"`, `NavKey` avec `"club"`, entrée `{ key: "club", href: routes.club }` entre `home` et `actions` dans `mainNavigation`. Vérifier que `SiteNav`, `MobileMenu` et `SiteFooter` l'affichent, puis contrôler l'en-tête à 1024 px et 1280 px en français et en anglais. Si les six entrées ne tiennent pas, resserrer seulement l'espacement dans `SiteNav.module.css`, dans les valeurs de la grille.
- [X] T025 [US3] Créer `apps/web/src/app/[lang]/club/page.tsx`, rendue à la demande comme l'accueil, avec `generateMetadata` (`staticPageMetadata("club", routes.club)` ou équivalent, `alternates` des deux langues) et ses sections dans `club/_sections/` :
  - `ClubOpening` : H1 et photographie `club-ouverture`, repli `accueil-club` puis gabarit ;
  - `ClubHistory` : paragraphes, `LangMark` et `lang="fr"` en repli ; section absente si rien n'est saisi ;
  - `RotaryLink` : texte fixe et club parrain s'il est saisi, avec la règle `clubFrench` ;
  - `ClubFigures` : `<dl>`, une ligne par chiffre présent (FR-013 et `data-model.md`), chiffres tabulaires, aucun mouvement ;
  - liens de sortie et rappel cranberry existants (`Onward`, `JoinReminder`).
- [X] T026 [US3] Styles de la page (`club/page.module.css` et modules des sections) selon la direction ajoutée à `DESIGN.md`, section 17 : tokens, grille, échelle, une colonne au téléphone, pas de grille de cartes.
- [X] T027 [P] [US3] `apps/web/src/app/[lang]/_sections/About.tsx` : ajouter le lien fléché vers `routes.club` (`ArrowLink`, lien localisé).
- [X] T028 [US3] Vérification manuelle : `quickstart.md`, section 3, lignes US3, avec et sans histoire ni fiche du club, en français et en anglais. Puis lint et build de `web`.

**Checkpoint** : US3 livrable seule. Sans frise, la page se lit sans la section.

> Fait : `/club` et `/en/club` répondent `200`, `/fr/club` → `308` ; six entrées sur une ligne à 1024 px en français et en anglais. Base vide : la page réelle montre l'ouverture (gabarit) et l'entrée « Rotaract » seules ; la composition remplie (histoire, club parrain, quatre chiffres) a été vérifiée sur une page d'aperçu temporaire à données fictives, supprimée, à 1280 px et 375 px. Corrigé au passage : « FR · EN » passait sur deux lignes dans la une à 375 px. Reste : vérification avec de vraies données saisies dans le Back Office.

---

## Phase 7: User Story 4 - Remonter les années du club (Priority: P3)

**Goal** : frise des années sur `/club` : présidents tirés des mandats et actions marquantes publiées, de la plus récente à la plus ancienne.

**Independent Test** : `quickstart.md`, section 3, lignes « Frise » à « Clic sur une action de la frise ».

- [X] T029 [US4] Créer `apps/web/src/data/timeline.ts`, fonction `getClubTimeline(): Promise<TimelineYear[]>` (`data-model.md`) :
  - lire `getMemberYears()` et `getActions()` ;
  - pour chaque année, `getMembers(year)` filtré sur `roles.includes("president")`, dans l'ordre du club ;
  - actions `highlighted` groupées par `rotaryYear`, dans l'ordre de la liste publique ;
  - union des années, tri décroissant, années vides écartées ;
  - en cas d'échec d'une lecture, liste vide pour la partie en échec, sans erreur de page.
- [X] T030 [US4] Créer `apps/web/src/app/[lang]/club/_sections/ClubTimeline.tsx` et son module CSS :
  - une `<ol>` le long d'un filet vertical ;
  - l'année au trait en très grand, en marge, masquée aux lecteurs d'écran et doublée d'un titre lisible (`DESIGN.md`, section 13) ;
  - le ou les présidents, puis les actions en `ArrowLink` vers `actionPath(slug)` ;
  - titres en repli français marqués ;
  - section absente si la frise est vide.

  Ajouter la section à `club/page.tsx`, et passer le nombre d'années à `ClubFigures`.
- [X] T031 [US4] Vérification manuelle : `quickstart.md`, section 3, lignes US4, avec la limite de trois et le changement d'année dans le Back Office si une session est ouverte. Puis lint et build de `web`.

**Checkpoint** : US4 livrable.

> Fait : frise vérifiée sur la page d'aperçu (trois années : président et deux actions, présidence partagée sans action, actions sans président). Reste : données réelles, limite de trois et changement d'année dans le Back Office (session admin nécessaire).

---

## Phase 8: User Story 1 - Partager avec un bel aperçu (Priority: P1)

**Goal** : chaque page publique a une image de partage composée, dans sa langue.

**Independent Test** : `quickstart.md`, section 1.

- [X] T032 [US1] Demander l'accord du porteur du projet, puis placer `OpenSans-CondensedBold.ttf` (Google Fonts, licence OFL) dans `apps/web/src/assets/fonts/`, avec sa licence `OFL.txt`. Variante : le porteur du projet fournit le fichier.
- [X] T033 [US1] Créer `apps/web/src/lib/share-image.tsx`, qui remplace `share-image.ts` (supprimer l'ancien fichier une fois ses usages retirés). Contenu :
  - `SHARE_SIZE = { width: 1200, height: 630 }` ;
  - `shareTitle(title)` : abrège à 90 caractères au dernier espace, avec « … » ;
  - `renderShareImage({ title, photo, lang })`, qui renvoie une `ImageResponse` :
    - fond en `background-image` avec `background-size: cover` et `background-position` = `photo.focus` ;
    - Voile encre à 50 % ;
    - logo `public/images/logo-club-sans-texte.png` lu en fichier ;
    - trait d'or de 4 px ;
    - titre blanc Open Sans condensée grasse, 64 px, ou 52 px au-delà de 60 caractères ;
    - police lue par `readFile(join(process.cwd(), "src/assets/fonts/…"))` ;
  - repli de photographie : photographie du contenu, puis emplacement fixe de la page, puis `accueil-ouverture`, puis `/images/Image-16-9.jpeg` en URL absolue.
- [X] T034 [US1] Créer les fichiers `opengraph-image.tsx`, avec `size`, `contentType = "image/png"` et un `alt` dynamique (« <titre> — Rotaract Club Ivandry »), langue lue par `currentLang()` :
  - `apps/web/src/app/[lang]/opengraph-image.tsx` (accueil et repli) ;
  - `actions/(liste)/`, `actualites/(liste)/`, `membres/`, `rejoindre/`, `club/` (titre de la page, emplacement d'ouverture de la page) ;
  - `actions/[slug]/` et `actualites/[slug]/` : lecture par `getActionBySlug` / `getNewsBySlug`, `notFound()` si le contenu est absent, titre résolu, `photos[0]`.

  Vérifier l'emplacement exact des groupes `(liste)` avant de créer les fichiers.
- [X] T035 [US1] Retirer `openGraph.images` et `shareImages()` de `apps/web/src/app/[lang]/actions/[slug]/page.tsx` et `actualites/[slug]/page.tsx`. Ajouter `twitter: { card: "summary_large_image" }` aux métadonnées de `app/[lang]/layout.tsx`. Vérifier qu'aucune page ne déclare plus d'`openGraph.images` qui masquerait le fichier.
- [X] T036 [US1] Vérifier le chemin des images derrière `src/proxy.ts` :
  - en développement puis en build de production, `curl -sI` sur l'URL `og:image` de `/`, `/actions/<A>`, `/en/actions/<A>` et `/club` : `200 image/png` ;
  - pour un contenu dépublié ou inconnu : `404` ;
  - corriger le `matcher` seulement si nécessaire, et documenter dans `ARCHITECTURE.md`, section 10.
- [X] T037 [US1] Vérification manuelle : `quickstart.md`, section 1. Regarder les images de chaque page en français et en anglais, avec un titre de 120 caractères et une photographie verticale. Les outils d'aperçu de Facebook et WhatsApp demandent une adresse publique : à faire après déploiement, à signaler. Puis lint et build de `web`.

**Checkpoint** : US1 livrable.

> Fait : `og:image` 1200 × 630, `og:image:alt` dans la langue, `twitter:card` sur les huit types de page ; images servies en `200 image/png` en français (`/fr/…/opengraph-image…`, que `proxy.ts` laisse passer sans `308`) et en anglais, `404` pour un contenu inconnu. Écarts rencontrés : `next/root-params` n'est pas disponible dans les routes d'image (les fonctions de données prennent un `lang` facultatif) ; `generateImageMetadata` sert aussi à lister les images, donc pas de 404 dedans ; Satori refuse une propriété de style `undefined` et n'étire pas les calques sans taille en pixels. Composition contrôlée sur l'image d'accueil, de Membres, de Nous rejoindre (FR et EN) et sur un titre de 120 caractères abrégé. Police : `OpenSans-CondensedBold.ttf` (145 Ko) et `OFL.txt`, tirés de `googlefonts/opensans` (`fonts/ttf/`), accord du porteur du projet le 2026-10-14. Reste : aperçu Facebook et WhatsApp après déploiement.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [X] T038 Vérifier la non-régression (`quickstart.md`, section 5) :
  - `curl` sur toutes les pages existantes, en français et en anglais : `200` ;
  - aucun texte fixe français sur les pages anglaises nouvelles (`/en/club`, galerie) ;
  - pages existantes inchangées hormis FR-025.
- [X] T039 `npm run lint` et `npm run build` à la racine, pour les trois applications. Arrêter le serveur de dev de l'API avant `build:api`.
- [X] T040 [P] Mettre à jour le guide publié (https://claude.ai/artifact/LNKaGG9d13Jesiqoc1nC4Y) :
  - page « Le club » ;
  - « Histoire du club » et photographie « Le club — ouverture » dans l'écran Site ;
  - case « Action marquante » ;
  - galerie ;
  - comment vérifier un aperçu de partage.

  Republier à la même adresse.
- [X] T041 Cocher les tâches dans ce fichier. Relire `ARCHITECTURE.md`, `DESIGN.md`, `PROJECT_CONTEXT.md` et `CLAUDE.md` contre le code livré, et corriger les écarts.

---

## Dependencies & Execution Order

- **Phase 1** (documents) avant tout code.
- **US5** (phase 3) : indépendante ; à faire avant US2, qui reprend ses zones de l'encoche (T006).
- **US2** (phase 4) : indépendante des données ; T010 dépend de T009 ; T012 et T013 dépendent de T010 et T011.
- **Données** (phase 5) : T016 dépend de T015 ; T019 dépend de T016 ; T020 dépend de T017.
- **US3** (phase 6) : dépend de T017 et T020 pour l'histoire et l'emplacement. La page peut se faire avant, mais elle n'affiche alors que les textes fixes et les chiffres.
- **US4** (phase 7) : dépend de T016 (`highlighted` public), de T022 et de la page de T025.
- **US1** (phase 8) : indépendante, mais placée en dernier pour couvrir `/club` (T034) ; T033 dépend de T032.
- **Polish** : après les récits livrés.

## Parallel Opportunities

- Phase 1 : T002 et T003, pendant que T001 avance.
- US5 : T006 et T007 après T005.
- US2 : T009 en parallèle de la préparation de T011 ; T013 en parallèle de T012.
- Données : T015 et T017 (deux modules API) ; T019 et T020 (deux écrans du Back Office).
- US3 : T022, T023 et T027.

## Implementation Strategy

- **Premier incrément utile (MVP)** : phase 1, puis US5 et US2. Le site gagne la galerie et les finitions téléphone sans toucher aux données.
- **Deuxième incrément** : phase 5, puis US3 et US4 (page « Le club » et frise).
- **Troisième incrément** : US1, les images de partage. On peut la remonter en tête si le partage presse : elle ne dépend que de T032, à `/club` près.
- Chaque phase se termine par sa vérification manuelle, son lint et son build. Aucun commit sans demande.
