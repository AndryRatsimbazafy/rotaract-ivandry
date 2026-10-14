# Research : Évolutions design du site public

Décisions techniques de la fonctionnalité 015. Chaque décision renvoie à la spec ([spec.md](./spec.md)) et aux documents de référence.

## R1. Composer les images de partage

- **Decision** : la convention de fichier `opengraph-image.tsx` de Next.js 16, avec `ImageResponse` de `next/og`, fourni avec Next.js. Un fichier par segment : `app/[lang]/opengraph-image.tsx` (accueil et repli de tout le site), puis un dans `actions`, `actualites`, `membres`, `rejoindre`, `club`, `actions/[slug]` et `actualites/[slug]`. Taille 1200 × 630 (1,91:1), PNG, `alt` exporté par `generateImageMetadata` ou `alt` dynamique. Rendu sur le runtime Node, à la demande, avec la même revalidation d'environ 60 secondes que les pages (décision 20).
- **Rationale** : rien à installer (constitution, principe IV ; `DESIGN.md`, décision 13). La convention de fichier ajoute d'elle-même `og:image`, `og:image:width`, `og:image:height`, `og:image:alt` et `twitter:image` à la page, et prend le pas sur `openGraph.images`. `shareImages()` (`src/lib/share-image.ts`) et les `openGraph.images` des pages de détail sont retirés.
- **Composition** (`DESIGN.md`, section 7) : la photographie en fond (`background-image`, `background-size: cover`, `background-position` = point d'intérêt `focus` de la photographie), le Voile (encre à 50 %, plein cadre), le titre en blanc en Open Sans condensée grasse sur six colonnes au plus, en bas à gauche, et le logo du club sans texte en haut à gauche. Ni paragraphe, ni étiquette, ni bouton. Trait d'or de 4 px au-dessus du titre (décision verrouillée 4, « le trait d'or uniquement »).
- **Titre trop long** (FR-004) : une fonction pure abrège à 90 caractères au dernier espace et ajoute « … » ; Satori renvoie les lignes à la ligne sans couper les mots ; le corps passe de 64 à 52 px au-delà de 60 caractères.
- **Police** : `ImageResponse` lit seulement `ttf`, `otf` et `woff`, et la page charge Open Sans par `next/font/google` (`woff2`, inutilisable ici). Un fichier statique `OpenSans-CondensedBold.ttf` (licence OFL, 145 Ko) est versionné dans `apps/web/src/assets/fonts/` et lu par `readFile(join(process.cwd(), …))`. C'est un fichier, pas une dépendance npm. Georgia, police système sous licence, n'est pas embarquée : l'image n'a pas de texte de l'étage éditorial.
- **Photographie** : l'URL publique de la photographie (déjà dans `Photo.src`) ; aucune connaissance du fournisseur côté Front Office (constitution, principe V). Repli : photographie d'ouverture de la page (emplacement fixe), puis `accueil-ouverture`, puis l'image livrée avec le site (`public/images/Image-16-9.jpeg`).
- **Contenu non publié** (FR-005) : le fichier de la page de détail lit le contenu par `getActionBySlug` / `getNewsBySlug` et appelle `notFound()` comme la page.
- **Alternatives considered** :
  - *Image composée par Cloudinary (transformations texte)* : refusé, le Front Office ne connaît pas le fournisseur (principe V), et les polices et le Voile de la charte n'y sont pas maîtrisés.
  - *Route Handler `/api/og?title=…`* : refusé, le titre passerait par l'adresse et n'importe qui pourrait composer une image au nom du club.
  - *Charger Open Sans depuis Google Fonts à chaque rendu* : refusé, rendu dépendant d'un service externe et plus lent ; le fichier versionné est stable.

**Point à vérifier à l'implémentation** : le `proxy.ts` réécrit les chemins sans point vers `/fr/…` ; l'adresse de l'image (`/actions/<slug>/opengraph-image-<hash>`) n'a pas d'extension et passe donc par la réécriture, ce qui est voulu (image française). À contrôler en développement et en production.

## R2. Galerie plein écran

- **Decision** : un composant client `PhotoGallery` (`src/components/media/PhotoGallery.tsx`) qui reçoit les photographies déjà résolues pour la langue et rend :
  - la planche existante inchangée, chaque photographie enveloppée d'un `<button>` (« Agrandir la photographie : <alt> ») ;
  - un `<dialog>` natif ouvert par `showModal()` : fond inerte et focus retenu par le navigateur, Échap via l'événement `cancel`, focus rendu au bouton d'ouverture à la fermeture.
- **Passage** : une piste horizontale en `scroll-snap-type: x mandatory`, une diapositive par photographie (`scroll-snap-align: center`, `object-fit: contain`). Le balayage est le défilement natif du navigateur (physique du système, aucun calcul de geste). Les boutons « Précédente » / « Suivante » et les flèches du clavier appellent `scrollTo` (`behavior: "smooth"`, `"auto"` en mouvement réduit). La position courante est lue par un `IntersectionObserver` sur les diapositives.
- **Annonce** (FR-008) : une région `aria-live="polite"` écrit « Photographie 3 sur 12 », puis la légende ; position visible « 3 / 12 » en chiffres tabulaires.
- **Retour du navigateur** (FR-007) : à l'ouverture, `history.pushState` d'un état `{ gallery: true }` sans changer l'adresse ; `popstate` ferme ; fermer par Échap ou par le bouton appelle `history.back()` pour ne pas laisser d'entrée orpheline.
- **Images** : `next/image` avec `sizes="100vw"`, chargement immédiat de la diapositive courante et de ses voisines, différé pour les autres ; aucune image n'est agrandie au-delà de sa taille d'origine (`DESIGN.md`, section 7).
- **Défilement de la page** : `html:has(dialog[open]) { overflow: hidden }` et `overscroll-behavior: contain` sur la piste.
- **Mouvement** (FR-010) : ouverture en fondu de 320 ms (`DESIGN.md`, section 12, « modale »), fermeture de 200 ms ; rien en mouvement réduit.
- **Rationale** : l'élément `<dialog>` et le défilement accroché couvrent le focus, l'inertie du fond, Échap et le balayage sans dépendance ni code de geste.
- **Alternatives considered** :
  - *Bibliothèque de visionneuse (PhotoSwipe, yet-another-react-lightbox)* : refusée, dépendance de design (décision verrouillée 13).
  - *Geste codé à la main (`pointermove` + transformation)* : refusé, plus de code et une physique moins naturelle que le défilement natif.
  - *Une adresse par photographie (`?photo=3`)* : refusée, hors besoin (aucun partage d'une photographie seule) ; l'état d'historique suffit pour le retour.

## R3. Page « Le club » et navigation

- **Decision** : route `apps/web/src/app/[lang]/club/page.tsx` (adresse `/club`, `/en/club` ; Q6), rendue à la demande comme l'accueil (décision 20). Sixième entrée de navigation `{ key: "club", href: routes.club }` entre `home` et `actions` dans `config/routes.ts` ; libellés « Le club » / « The club » dans `chrome.navigation`. Le lien « En savoir plus » de la section « Le club » de l'accueil mène à `/club`. Le pied de page reprend la navigation, donc l'entrée y apparaît d'elle-même.
- **Contenu** : textes fixes dans un nouveau fichier de dictionnaire `content/{fr,en}/club.ts` ; histoire depuis les réglages du site (R5) ; chiffres clés (FR-013) depuis `club.foundedYear`, `club.memberCount`, le nombre d'actions publiées (longueur de la liste déjà lue par `getActions`) et le nombre d'années Rotary de la frise ; club parrain depuis `club.sponsorClub`.
- **Lien Rotaract–Rotary** : texte fixe des dictionnaires (programme du Rotary International, parrainage par un Rotary club), rédigé sans chiffre ni date inventés.
- **En-tête** : six entrées doivent tenir sur une ligne dès la largeur où la navigation passe en ligne (`DESIGN.md`, section 14). Contrôle à 1024 px et 1280 px, en français et en anglais ; à défaut, l'espacement entre les entrées se resserre dans les valeurs de la grille, sans réduire le corps du texte. Le menu du téléphone n'a pas de contrainte.
- **Alternatives considered** : *section supplémentaire de l'accueil* au lieu d'une page : refusée par Q2 (page dans la navigation).

## R4. Frise des années rotariennes

- **Decision** : section de la page « Le club » (FR-018), lue par une nouvelle fonction `getClubTimeline()` dans `src/data/timeline.ts` :
  1. `GET /members/years` (années ayant des membres) et `getActions()` (toutes les actions publiées, déjà lues en entier par pages de 100) ;
  2. pour chaque année ayant des membres, `GET /members?year=<label>`, dont on garde les membres dont `roles` contient `president`, dans l'ordre du club ;
  3. les actions dont `highlighted` est vrai, groupées par `rotaryYear`, dans l'ordre de la liste publique (ordre manuel puis date) ;
  4. l'union des années, triée de la plus récente à la plus ancienne ; une année sans président ni action marquante est écartée.
- **Rationale** : aucune nouvelle route publique (principe IV) ; le club compte une dizaine d'années au plus, chaque lecture est mise en cache environ 60 secondes ; les présidents viennent des mandats (constitution, principe VI), jamais d'une propriété du membre.
- **Composition** : liste ordonnée (`<ol>`) le long d'un filet vertical ; chaque année en très grand au trait, en marge ; le ou les présidents en grand titre ; les actions marquantes en liens fléchés (`ArrowLink`) avec leur domaine. Une colonne au téléphone. Aucune carte, aucune photographie par année (seul l'emplacement « club-ouverture » est prévu, Q4).
- **Alternatives considered** :
  - *Nouvelle route publique `GET /members/presidents`* : plus économe en lectures, mais une route et un contrat de plus pour une dizaine d'appels mis en cache ; gardée en réserve si le nombre d'années grandit.
  - *Frise sur la page Membres* : refusée, FR-018 la place sur « Le club ».

## R5. Données nouvelles (API et Back Office)

- **Decision** :
  - **Action** : champ `highlighted` (booléen, `false` par défaut), exposé dans les vues admin et publique. Règle FR-027 dans `ActionsService` : à la création, à la modification de `highlighted` ou de `rotaryYear`, si l'action résultante est marquée, compter les autres actions marquées de la même année (publiées ou non) ; à trois ou plus, `400` avec `details[{ field: "highlighted", message: "L'année <label> compte déjà trois actions marquantes." }]`. Une seule écriture admin à la fois : pas de transaction.
  - **Réglages du site** : champ `history` (texte de 4 000 caractères au plus, paragraphes séparés par une ligne vide, comme les réponses de la FAQ), dans un nouveau groupe du `PATCH` (`history: string | null`), et `en.history` (même limite, facultatif) ; huitième emplacement photographique `club-ouverture` dans `SitePhotoSlot` (API, Back Office, Front Office), dossier `site/pages/` comme les sept autres.
  - **Back Office** : case « Action marquante (frise du club) » dans `ActionForm`, avec l'aide « Trois au plus par année Rotary. » ; écran « Site » : une carte « Histoire du club » (champ multiligne français et champ anglais), et l'emplacement « Le club — ouverture » dans la liste des photographies fixes.
- **Rationale** : des champs nommés, comme décidé en 012 (décision 21 : « aucun éditeur générique des textes ») ; la décision 21 s'étend d'un champ nommé et d'un emplacement, ce qui est écrit dans `ARCHITECTURE.md` avant le code.
- **Alternatives considered** : *ordre manuel pour désigner les actions marquantes* : refusé par Q3.

## R6. Finitions téléphone

- **Decision** :
  - `export const viewport` dans `app/[lang]/layout.tsx` : `themeColor: "#ffffff"` (fond de page `--bg-page`, sous l'en-tête), `viewportFit: "cover"` ; pas de `maximumScale` ni `userScalable` (FR-022).
  - Zones de l'encoche : `padding-inline` de l'en-tête fixe, du menu du téléphone, du pied de page et de la galerie en `max(<gouttière>, env(safe-area-inset-left|right))` ; `padding-top` de l'en-tête et `padding-bottom` du menu et de la galerie en `env(safe-area-inset-top|bottom, 0px)` ; le conteneur `.container` garde sa gouttière en `max()`.
  - Toucher : `html { -webkit-tap-highlight-color: transparent; }` ; `a, button, summary, label { touch-action: manipulation; }` ; états `:active` en changement de couleur (120 ms, `DESIGN.md`, section 12) pour les liens fléchés, la navigation, le sélecteur de langue, les boutons, les lignes du registre et les photographies cliquables ; `user-select: none` sur les boutons seulement.
  - Champs : `font-size` d'au moins 16 px (1 rem) sur `input`, `textarea`, `select` du formulaire de candidature ; à vérifier, les champs actuels en ont peut-être déjà.
- **Rationale** : tout est CSS ou métadonnée native ; les règles de `:hover` sont déjà réservées aux pointeurs précis (`DESIGN.md`, section 12).
- **Alternatives considered** : *`theme-color` par page selon la couleur de l'ouverture* : refusé, le haut de chaque page est l'en-tête blanc.

## R7. Écarts de documents à corriger avant le code

- `DESIGN.md` : précision de la section 7 (image de partage, R1) ; section 9 (galerie) ; section 12 (ouverture de la galerie, appui tactile) ; section 14 (zones de l'encoche) ; section 17 (direction de « Le club » et de la frise ; « six pages ») ; section 9 ou 14 pour la navigation à six entrées.
- `ARCHITECTURE.md` : section 1 (Action `highlighted`, SiteSettings `history`, `en.history`, `club-ouverture`), section 6 (routes), section 10 (Front Office : `/club`, frise, images de partage), décision 21 étendue, nouvelle décision 23 (actions marquantes).
- `PROJECT_CONTEXT.md` : pages du site (six), « Fait ».
- `CLAUDE.md` : état du projet.
- **Constitution, principe VII** (« Le Front Office reste en français pour la V1 ») : déjà contredite par 014, validée par le porteur du projet ; l'amendement relève de `/speckit-constitution` et n'est pas fait par cette fonctionnalité (signalé dans le plan).
