---
name: Back Office — Rotaract Club Ivandry
description: Interface d'administration du site du club — années, membres, actions, actualités, candidatures — aux couleurs de la charte Rotary.
colors:
  rotaract-cranberry: "#d41367"
  cranberry-deep: "#a90f52"
  cranberry-night: "#f06a9f"
  cranberry-night-hover: "#b80f58"
  royal-blue: "#17458f"
  azure: "#0067c8"
  sky-blue: "#00a2e0"
  gold: "#f7a81b"
  lawn-green: "#009739"
  lawn-green-night: "#3fbf6f"
  cardinal: "#e02927"
  cardinal-night: "#ff6b5e"
  slate: "#657f99"
  mouse-gray: "#9ba4b4"
  pastel-blue: "#b9d9eb"
  grid-ink: "#152238"
  grid-muted: "#566173"
  grid-sheet: "#ffffff"
  grid-chrome: "#f4f5f8"
  grid-rule: "#e2e5eb"
  grid-rule-strong: "#c9ced8"
  grid-field: "#858e9e"
  night-ink: "#e6ebf2"
  night-muted: "#9aa4b6"
  night-sheet: "#0f1623"
  night-chrome: "#141d2c"
  night-rule: "#222d40"
  night-rule-strong: "#324059"
  night-field: "#64728c"
typography:
  headline:
    fontFamily: "Open Sans, Arial, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Open Sans, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.35
  title-sm:
    fontFamily: "Open Sans, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Open Sans, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "ss01"
  body-sm:
    fontFamily: "Open Sans, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Open Sans, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Open Sans, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    letterSpacing: "0.01em"
  zone-label:
    fontFamily: "Open Sans, Arial, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "0.08em"
  column-head:
    fontFamily: "Open Sans, Arial, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.06em"
  figure:
    fontFamily: "Red Hat Mono, Courier New, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  figure-summary:
    fontFamily: "Red Hat Mono, Courier New, monospace"
    fontSize: "0.9375rem"
    fontWeight: 600
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
rounded:
  none: "0px"
  base: "2px"
spacing:
  cell-y: "7px"
  cell-x: "12px"
  summary-cell: "6px 12px"
  panel-inset: "20px"
  page-x-mobile: "16px"
  page-x-tablet: "24px"
  page-x-desktop: "32px"
  topbar: "48px"
  sidebar: "216px"
  inspector: "360px"
  drawer: "400px"
  side-sheet: "480px"
  bottom-nav: "64px"
  content-max: "1440px"
components:
  button-primary:
    backgroundColor: "{colors.rotaract-cranberry}"
    textColor: "{colors.grid-sheet}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "4px 14px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.cranberry-deep}"
  button-outlined:
    textColor: "{colors.rotaract-cranberry}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "4px 13px"
    height: "32px"
  input-outlined:
    backgroundColor: "{colors.grid-sheet}"
    textColor: "{colors.grid-ink}"
    rounded: "{rounded.base}"
    height: "40px"
  table-head-cell:
    backgroundColor: "{colors.grid-chrome}"
    textColor: "{colors.grid-muted}"
    typography: "{typography.column-head}"
    padding: "8px 12px"
  table-cell:
    backgroundColor: "{colors.grid-sheet}"
    textColor: "{colors.grid-ink}"
    typography: "{typography.body-sm}"
    padding: "7px 12px"
  status-mark:
    textColor: "{colors.grid-ink}"
    typography: "{typography.label}"
    size: "8px"
  neutral-mark:
    textColor: "{colors.grid-muted}"
    typography: "{typography.label}"
    size: "8px"
  summary-cell:
    backgroundColor: "{colors.grid-chrome}"
    typography: "{typography.figure-summary}"
    padding: "6px 12px"
  topbar:
    backgroundColor: "{colors.grid-sheet}"
    height: "48px"
  nav-item:
    textColor: "{colors.grid-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    height: "34px"
  nav-item-active:
    backgroundColor: "{colors.grid-sheet}"
    textColor: "{colors.grid-ink}"
    rounded: "{rounded.base}"
---

# Design System : Back Office — « La grille »

Référence visuelle du Back Office (`apps/admin`), selon `ARCHITECTURE.md`, décision 18. La direction vient de l'application de trésorerie du club (`rotaract-app/rotaract-ivandry-runner`, son `DESIGN.md` et `client/src/app/theme.ts`). Elle est adaptée ici à l'administration du site. `DESIGN.md`, à la racine, régit le Front Office et ne s'applique pas ici. Une valeur visuelle se change dans ce document avant de se changer dans le code (`src/theme/theme.ts`).

## Overview

**Creative North Star : « La grille »**

Le Back Office est un outil de travail, pas un site. Chaque écran de gestion est une grille dense en pleine largeur. Les surfaces blanches (ardoise marine en sombre) ne sont séparées que par des filets de cellule de 1 px. Les en-têtes de colonnes sont figés, en petites capitales espacées. Les nombres sont en chiffres tabulaires.

On agit sans quitter la grille. Choisir une ligne ouvre sa fiche dans un aperçu persistant à droite sur grand écran, et dans un tiroir en dessous. Les saisies courtes (une année, un mandat) passent par un panneau latéral. Les formulaires longs (membre, action, actualité) gardent leur page. La charte Rotary signe l'ensemble sans le remplir : le cranberry marque la sélection, le focus et l'action principale ; un état s'affiche en carré de couleur doublé d'un libellé.

Refusé : l'ossature d'administration par défaut (titre, `Paper` de filtres, `Paper` de table, pile de cartes), les cartes et les ombres au repos, les pilules, les coins arrondis au-delà de 2 px.

**Caractéristiques :**
- Grille à plat : surfaces `sheet`, bords outillés `chrome`, filets `rule` et `ruleStrong`, aucune carte.
- Coins de 2 px partout ; boutons pleins et à contour chanfreinés au coin inférieur droit (6 px).
- État = carré de 8 px + libellé : plein pour un état, vide cerclé pour un état neutre.
- Red Hat Mono tabulaire pour les nombres seuls ; Open Sans à chiffres alignés pour un texte qui mêle mots et chiffres.
- Barre supérieure de 48 px, aperçu de 360 px dès `lg`, recherche rapide Ctrl+K.
- Couleurs officielles Rotary sans retouche ; thèmes clair et sombre au choix ; logos par `ClubLogo` et `ClubEmblem`.

## Colors

La charte Rotary telle quelle, posée sur des neutres de grille dérivés du Royal Blue. Chaque couleur vive signifie quelque chose.

### Primary
- **Cranberry Rotaract** (`rotaract-cranberry`) : bouton plein de l'action principale, contour de focus, icône de la navigation active, trait de l'onglet actif, fond de la ligne choisie (à 7 %), sélection de texte (à 20 %), `accent-color` et curseur de saisie. **Cranberry profond** (`cranberry-deep`) au survol du bouton plein en clair.
- En sombre, le texte cranberry passe au **Cranberry de nuit** (`cranberry-night`) et la ligne choisie à 12 %. Le bouton plein garde le cranberry officiel et passe à `cranberry-night-hover` au survol.

### Secondary
- **Royal Blue** (`royal-blue`) : l'institution. Avatar du compte, panneau de l'emblème sur la page de connexion (sur une trame de filets de 32 px). En sombre, le rôle `secondary` passe au **Pastel Blue**.
- **Azure** (`azure`) : information, marque « En cours » d'une année Rotary. En sombre, **Sky Blue**.

### Tertiary (couleurs d'état de la charte)
- **Lawn Green** (`lawn-green`, `lawn-green-night` en sombre) : marque « Publié ».
- **Cardinal** (`cardinal`, `cardinal-night` en sombre) : erreurs, bouton plein d'une suppression.
- **Gold** (`gold`) : avertissements (année hors de la date, ressource introuvable). Le texte posé dessus est en encre, jamais en blanc.
- **Slate** (`slate`) : teinte des barres de défilement.

### Neutral
- **Encre de grille** (`grid-ink`) : texte principal ; fond des infobulles et des avis. **Encre secondaire** (`grid-muted`) : libellés, en-têtes de colonnes, métadonnées, marque neutre.
- **Feuille** (`grid-sheet`) : fond de page et de toutes les données (cellules, fiches, aperçu, barre supérieure).
- **Chrome** (`grid-chrome`) : bords outillés. Barre latérale, en-têtes de colonnes, barre de chiffres, pied des dialogues, tête des panneaux latéraux.
- **Filet** (`grid-rule`) : filets de cellule et séparateurs. **Filet fort** (`grid-rule-strong`) : séparation de zone (sous l'en-tête de colonnes, sous un titre de section, au-dessus de la pagination). **Contour de champ** (`grid-field`) : bord des champs, à 3:1 sur la feuille et le chrome.
- En sombre : `night-*` dans les mêmes rôles. Le panneau se distingue par sa teinte, sans voile clair.

### Règles
**La charte intacte.** Les couleurs de marque sont les valeurs officielles (`BRAND` dans `src/theme/theme.ts`). Seuls les dérivés de lisibilité du thème sombre s'en écartent.

**Couleur = sens.** Une couleur vive désigne toujours la même chose : un état, la sélection ou l'action principale. Pas de fond de section coloré, pas de couleur décorative.

## Typography

**Police de titre :** aucune ; les titres sont en Open Sans gras.
**Police de texte :** Open Sans (`next/font`, variable `--font-sans`, repli Arial), avec l'ensemble stylistique `ss01`.
**Police des nombres :** Red Hat Mono (`next/font`, variable `--font-mono`, repli Courier New).

### Hiérarchie
- **Headline** (700, 1.375rem) : titre de page, un seul `h1` par page, dans `PageHeader`.
- **Title small** (700, 0.9375rem) : titre de section (`SectionHeading`), de panneau, d'aperçu.
- **Body** (0.9375rem) et **Body small** (0.8125rem) : contenu, cellules, ligne de contexte, `FieldList`.
- **Label** (600, 0.8125rem, casse normale) : boutons, navigation, marques d'état.
- **Zone label** (600, 0.6875rem, 0.08em, capitales) : libellé d'une zone ou d'un chiffre (barre de chiffres, pied de la barre latérale, sections de l'aperçu).
- **Column head** (600, 0.6875rem, 0.06em, capitales) : en-têtes de colonnes.
- **Figure** (Red Hat Mono, tabulaire) : dates courtes, années, rangs, ordres, compteurs, pagination, tailles de fichier. **Figure summary** (600, 0.9375rem) dans la barre de chiffres.

### Règles
**Le mono pour les nombres seuls.** `tabularNums` ne sert qu'aux nombres seuls. Un texte qui mêle mots et chiffres (« Première publication le 3 octobre 2026 », « 12 Ko, PDF ») garde Open Sans avec chiffres alignés (`tabularText`).

**Les capitales pour les zones.** Les capitales espacées sont réservées aux libellés de colonne et de zone. Titres, boutons et libellés d'action restent en casse normale.

## Layout

Le cadre de l'application a deux zones.

**Dès `md` (900 px) :**
- Barre latérale collante de 216 px sur fond chrome : logo dans un bandeau de 48 px, navigation (Accueil, Années Rotary, Membres, Actions, Actualités, Candidatures), année Rotary en cours en pied. Un filet la borde à droite.
- Barre supérieure collante de 48 px : fil d'Ariane « Rotaract Club Ivandry / section », recherche Ctrl+K (champ de 280 px), thème, compte.

**Sous `md` :** la barre supérieure porte le logo, qui mène à l'accueil. Une barre d'onglets fixe en bas (64 px plus la zone sûre) porte les cinq domaines. Les avis se placent au-dessus.

**Contenu :** jusqu'à 1440 px, avec des marges de 16, 24 et 32 px (téléphone, tablette, ordinateur). Chaque page s'ouvre par `PageHeader` (retour, titre, marques, ligne de contexte, actions à droite, filet dessous). Viennent ensuite la barre d'outils (recherche et filtres en ligne), puis la grille pleine largeur.

**Listes :**
- Dès `lg` (1200 px), la zone se coupe en « grille | aperçu de 360 px ». En dessous, l'aperçu devient un tiroir droit de 400 px.
- À côté de l'aperçu, les colonnes secondaires n'apparaissent qu'à partir de `xl` : dès `lg`, une grille tient sans défilement horizontal. Sur téléphone et tablette, les grilles défilent en largeur, jamais la page.

**Rythme :** grille MUI de 8 px, dense. Cellules de 7 × 12 px, cases de chiffres de 6 × 12 px, panneaux et dialogues à 20 px de marge intérieure. Sur téléphone, les panneaux de saisie passent en plein écran, les boutons à 40 px de haut, les champs à 16 px (pas de zoom iOS).

**Connexion :** c'est la seule composition à part. Formulaire de 360 px sur la feuille et, dès `md`, un panneau Royal Blue tramé de filets qui porte l'emblème du club.

## Elevation & Depth

Système plat. Au repos, rien n'a d'ombre : boutons sans élévation, `Paper` sans voile en sombre, aucune carte. La profondeur vient de deux teintes (`sheet` pour les données, `chrome` pour l'outillage) et de deux épaisseurs de filet. Seules les surfaces flottantes portent une ombre douce teintée d'encre (noire en sombre).

- **Dialogue** (`0 24px 48px -12px`, encre à 35 %) : dialogues et recherche rapide, avec filet de 1 px.
- **Tiroir** (`0 0 48px -12px`, encre à 30 %) : aperçu en tiroir et panneaux latéraux, coins droits.
- **Popover** (`0 12px 32px -8px`, encre à 25 %) : menus (ligne, thème, compte), avec filet de 1 px.

**Plat au repos.** Une surface posée dans la page n'a jamais d'ombre. L'aperçu en colonne est posé : il se sépare de la grille par un filet, sans ombre.

## Shapes

Les coins sont presque droits : 2 px sur les boutons, champs, menus, infobulles, alertes, dialogues ; 0 sur les tiroirs et la barre d'onglets. La seule géométrie de signature est le chanfrein de 6 px au coin inférieur droit des boutons pleins et à contour : le contour suit la diagonale, et le focus passe à l'intérieur. Les marques d'état sont des carrés de 8 px sans arrondi. Les bordures sont des filets de 1 px. Les seuls traits de 2 px sont le focus, l'onglet actif et la barre de progression.

## Components

### Boutons
- **Forme :** coins de 2 px, chanfrein en bas à droite (plein et contour), casse normale, 600, 0.8125rem.
- **Principal :** cranberry plein, texte blanc, 32 px de haut (40 px sous `md`). Une seule action principale par zone. Une suppression confirmée est en cardinal plein.
- **Survol et focus :** cranberry profond, 120 ms ; pressé, décalage de 1 px vers le bas ; focus clavier par contour de 2 px. Pas d'effet d'onde.
- **Texte :** actions tertiaires, retours, « Annuler ».
- **Boutons-icônes :** coins de 2 px ; sous `md`, cible de 40 × 40 px au moins (menu de ligne, fermeture).

### Marques d'état
- `StatusMark` : carré plein de 8 px de la couleur d'état, suivi d'un libellé 600 en encre, sans fond ni pilule. **Publié** en Lawn Green ; **En cours** en Azure.
- `NeutralMark` : carré vide cerclé de 1 px, libellé en encre secondaire. **Brouillon**.
- La couleur est toujours doublée du libellé.

### Grilles
- **Cellules :** filets de 1 px horizontaux et verticaux, 7 × 12 px, 0.8125rem ; la dernière ligne n'a pas de filet bas.
- **En-tête :** fond chrome, capitales espacées en encre secondaire, filet fort dessous, figé sous la barre de 48 px dès `lg`. Tri par lien sur l'en-tête.
- **Lignes :** survol en encre à 4 %, ligne choisie en cranberry à 7 % (`aria-selected`). Clic ou Espace : choisir, et la sélection entre dans l'adresse (`selection`). ↑ ↓ : ligne voisine. Entrée ou double-clic : fiche complète. Ces raccourcis ne valent que quand la grille a le focus.
- **Menu de ligne :** bouton-icône « Actions pour <élément> », avec Ouvrir, Publier ou Dépublier, Supprimer.
- **Pagination :** filet fort au-dessus, compteurs en mono.

### Aperçu (signature)
Colonne de 360 px dès `lg`, collante sous la barre supérieure, filet à gauche. Tiroir de 400 px en dessous. L'aperçu est lu sur le serveur à partir de `selection`. Ses états :
- **invitation :** « Choisissez une ligne pour voir sa fiche. » et le rappel des raccourcis ;
- **attente :** squelettes ;
- **affiché :** titre, marques, `FieldList`, sections à libellé de zone, actions ;
- **introuvable :** « Ressource introuvable. » ;
- **erreur :** « Une erreur est survenue. Réessayez. » avec « Réessayer ».

L'aperçu ne modifie aucun champ : il propose les actions de la ligne et le lien vers la fiche.

### Champs
`TextField` outlined en taille small (normale sur la connexion), coins de 2 px, fond feuille, contour `grid-field`, focus cranberry. Les champs numériques et de date sont en mono tabulaire. Les erreurs de champ s'affichent sous le champ ; les erreurs de l'API en tête du formulaire, dans une alerte à filet teinté (fond à 6 %). Sur téléphone, le corps des champs est de 16 px.

### Navigation
- **Barre latérale :** éléments de 34 px, icône outlined de 18 px, libellé 600 en encre secondaire. Élément actif : fond feuille, filet de 1 px, icône cranberry.
- **Barre supérieure :** fil d'Ariane, recherche Ctrl+K, thème (Clair, Sombre, Comme le système), compte (avatar Royal Blue ; email, « Administrateur », « Se déconnecter »).
- **Téléphone :** barre d'onglets du bas, six onglets (l'accueil s'atteint par le logo), libellé 0.75rem 600, onglet actif en cranberry avec un trait de 2 px en haut. Lien d'évitement « Aller au contenu ».
- **Écran « Site » :** réglages du site public, en trois sections l'une sous l'autre : « Photographies » (cartes d'emplacement sur deux colonnes à partir de 900 px), « Réseaux sociaux », « Textes » (présentation du club, puis questions fréquentes). Chaque formulaire s'enregistre seul.

### Recherche rapide
Ctrl+K ou ⌘K, même dans un champ. Dialogue à ombre de dialogue (plein écran sur téléphone). Les écrans sont filtrés dans le navigateur ; les membres, actions, actualités et candidatures passent par une action serveur, jamais par l'API depuis le navigateur. Les résultats sont groupés par nature et parcourus au clavier ; « Aucun résultat » quand il n'y en a pas.

### Barre de chiffres (accueil)
`SummaryBar` : cases réglées côte à côte sur fond chrome (2 × 2 sur téléphone). Un libellé de zone surmonte une valeur en mono 600 ; chaque case mène à sa liste. Seuls des totaux lus dans l'API y figurent. Une valeur absente s'affiche « — », jamais 0.

### Panneaux latéraux et dialogues
`SideSheet` (480 px, plein écran sous `sm`) pour une saisie courte : nouvelle année, ajout d'un mandat, modification de ses fonctions. Tête sur chrome, titre, bouton Fermer. Les dialogues (confirmation de suppression, adresse publique d'un contenu) ont un titre à filet dessous et un pied sur chrome à filet dessus. `FieldList` : lignes libellé / valeur sur deux colonnes, « — » pour une valeur absente.

### Images (portrait, photographies)
- **Panneau image** (`ImageSheet`) : panneau latéral pour ajouter, remplacer ou modifier une image. L'image choisie est préparée dans le navigateur (réduite à 3000 px au plus sur le côté le plus long), avec « Préparation de l'image… » sur une barre fine. Champs : texte alternatif (obligatoire), légende, crédit. Les dimensions sont en chiffres tabulaires. Sous la largeur conseillée (1200 px pour un portrait, 1600 px pour une photographie), un avertissement s'affiche, sans bloquer.
- **Point d'intérêt** (`FocusPicker`) : l'image entière, sans recadrage, avec un repère circulaire de 16 px (contour cranberry, liseré blanc pour rester visible sur toute image). Un clic place le repère ; au clavier, les flèches le déplacent par pas de 5 % ; « Recentrer » le remet à 50 %, 50 %.
- **Portrait** (`PortraitSection`) : sur la fiche d'un membre, entre le formulaire et les mandats. Vignette 4:5 de 160 px recadrée selon le point d'intérêt ; sans portrait, un aplat d'outillage 4:5 et « Aucun portrait. ».
- **Photographies d'un contenu** (`PhotosSection`) : sur la fiche d'une action ou d'une actualité. Titre « Photographies · N / 20 » ; une grille avec le rang (marque « Principale » en Azure au rang 1), une vignette 3:2 de 96 px, le texte alternatif, les dimensions, « Monter » et « Descendre », et un menu de ligne avec « Modifier » et « Retirer ». L'ordre s'enregistre à chaque déplacement.
- **Section English** (fonctionnalité 014) : dans les fiches d'action et d'actualité, après l'impact ou le calendrier, un titre de section « English (facultatif) », une ligne d'aide (« Laissés vides, ces champs affichent le texte français sur le site anglais. ») et les mêmes champs que le français, mêmes limites. Dans le panneau image, « Texte alternatif (anglais) » et « Légende (anglais) » sous les champs français ; dans l'écran « Site », un champ « … (anglais) » sous chaque texte du club et chaque réponse de la FAQ. Rien d'autre du Back Office n'est traduit.
- **Carte d'emplacement photographique** (`SitePhotoCard`, écran « Site ») : une photographie fixe du site public. En tête, la page en surtitre et l'emplacement en titre, puis le format en chiffres tabulaires et la description de l'image attendue. Vignette de 160 px au format de l'emplacement ; vide, un aplat d'outillage au même format et le repli du site (« Aucune photographie. », « Photographie livrée avec le site. », « Reprend l'ouverture de l'accueil. »). Mêmes boutons et même panneau que le portrait ; largeur conseillée de l'emplacement (2400 ou 1600 px).
- **Vignettes** (`ImageThumb`) : cadre à filet sur fond d'outillage ; l'image est servie à la taille de la vignette.
- **Aperçus** : l'image principale (portrait en 4:5, photographie en 3:2) en tête de l'aperçu, sur toute sa largeur.
- Une image ne s'ajoute que sur la fiche d'un contenu enregistré ; les formulaires de création le disent en une ligne d'encre secondaire.

### Avis
En bas, centrés, sur fond encre, au-dessus de la barre d'onglets sur téléphone. Textes de la liste fermée des avis du Back Office.

## Do's and Don'ts

### À faire
- Utiliser `BRAND`, `GRID`, `MONO`, `TOPBAR_HEIGHT`, `tabularNums`, `tabularText` et la palette du thème plutôt que des valeurs en dur.
- Garder des coins de 2 px (0 pour les tiroirs) et laisser le thème chanfreiner les boutons.
- Séparer les zones par des filets de 1 px et la teinte chrome, jamais par une carte.
- Exprimer un état par `StatusMark` ou `NeutralMark`.
- Écrire les nombres seuls en mono tabulaire, et un texte qui mêle mots et chiffres en `tabularText`.
- Ouvrir chaque page par `PageHeader`, et donner à chaque liste son aperçu.
- Garder 16 px pour les champs et 40 px pour les boutons sur téléphone.
- Vérifier chaque écran dans les deux thèmes.
- Passer par `ClubLogo` et `ClubEmblem` pour les logos, et mettre `justifyContent` et `alignItems` dans `sx` sur les `Stack` (MUI 9).

### À éviter
- Retoucher les couleurs officielles de la charte, ou en inventer.
- Empiler des cartes ou reconstruire l'ossature titre, `Paper` de filtres, `Paper` de table.
- Mettre une ombre sur une surface au repos.
- Utiliser une pilule, un badge à fond coloré ou un rayon au-delà de 2 px.
- Mettre en mono un texte qui mêle mots et chiffres.
- Modifier une valeur dans une cellule ou dans l'aperçu.
- Montrer un état par la couleur seule, ou afficher un chiffre qui n'est pas lu dans l'API.
- Ajouter une animation décorative : seules les transitions brèves d'état existent, et elles sont coupées quand l'utilisateur demande moins d'animations.
