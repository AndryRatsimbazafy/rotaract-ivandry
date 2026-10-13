# Feature Specification: Refonte visuelle du Back Office

**Feature Branch**: `010-admin-redesign`

**Created**: 2026-10-13

**Status**: Clarification close le 2026-10-13 (Q1) — en attente de validation avant le plan

**Input**: User description: « Fonctionnalité 010 : refonte visuelle complète du Back Office (apps/admin) selon la direction « La grille » de l'application de trésorerie du club (`rotaract-app/rotaract-ivandry-runner`). Direction complète : grille dense à filets, couleurs officielles Rotary, coins de 2px, boutons chanfreinés, marques d'état carrées, Open Sans + Red Hat Mono, thèmes clair et sombre, barre latérale + barre supérieure (fil d'Ariane, Ctrl+K, thème, compte), barre d'onglets sur téléphone, en-tête de page, aperçu à droite des tables, panneaux latéraux, page de connexion avec panneau Royal Blue. Les éléments propres à la trésorerie ne s'appliquent pas. Rien ne change côté API ni Front Office. Pas de nouvelle dépendance sauf justification. Direction consignée dans `apps/admin/DESIGN.md`. Pas de tests automatisés. Le stockage des images est la fonctionnalité 011. »

**Références** : `ARCHITECTURE.md` (section 11 « Aspect », section 14 décisions 18 et 19), `PROJECT_CONTEXT.md` (Back Office), `CLAUDE.md`, `.specify/memory/constitution.md`, `specs/008-back-office/spec.md` et `specs/008-back-office/contracts/screens.md` (écrans, champs, messages et avis, qui restent valables sauf ce que cette spec change), et la référence visuelle : `../rotaract-app/rotaract-ivandry-runner/DESIGN.md`, `client/src/app/theme.ts`, `client/src/components/` (`AppShell`, `PageHeader`, `SideSheet`, `SummaryBar`, `CommandSearch`, `ClubLogo`, `ColorModeButton`, `MemberInspector`).

## Contexte et périmètre

Le Back Office (fonctionnalité 008) fonctionne : l'administrateur gère les années Rotary, les membres et leurs mandats, les actions, les actualités et les candidatures. Son aspect, un thème MUI fonctionnel par défaut, ne convient plus au porteur du projet. Le 2026-10-13, il a décidé de reprendre la direction visuelle de l'application de trésorerie du club, « La grille », et de la reprendre **en entier** (décision 18 de `ARCHITECTURE.md`, révisée).

Cette fonctionnalité change **la façon dont le Back Office se présente et se parcourt**, pas ce qu'il permet de faire. Chaque opération de la fonctionnalité 008 reste disponible, avec les mêmes champs, les mêmes règles, les mêmes messages et les mêmes appels à l'API.

### Dans le périmètre

1. Un document de direction visuelle propre au Back Office, `apps/admin/DESIGN.md`, adapté de celui de la référence, et un thème qui l'applique.
2. Le cadre de l'espace protégé : barre latérale, barre supérieure, barre d'onglets sur téléphone, lien d'évitement.
3. Le choix du thème clair, sombre ou celui du système.
4. La recherche rapide (Ctrl+K / ⌘K).
5. L'en-tête de page commun à tous les écrans.
6. Les listes en grille, avec un aperçu de l'élément choisi.
7. Les panneaux latéraux pour les saisies courtes ; les formulaires longs restent des pages.
8. La page de connexion, la page d'accès refusé et les pages d'erreur et d'élément introuvable.
9. Le logo et l'emblème du club.

### Hors périmètre

- Toute modification de l'API, de ses contrats ou de ses règles ; aucune nouvelle opération n'est appelée.
- Le Front Office (`apps/web`) et `DESIGN.md` (racine), qui ne régissent pas le Back Office.
- Les photographies et les portraits, qui relèvent de la fonctionnalité 011.
- Toute fonction nouvelle : gestion du compte, changement de mot de passe, statut des candidatures, édition dans une cellule, export.
- Les éléments propres à la trésorerie : cotisations, caisses, ruban des mois, barre de calcul, soldes, montants.
- Les tests automatisés (constitution, principe IX).

## Ce qui est déjà verrouillé

- **Session et sécurité** (`ARCHITECTURE.md`, section 11) : jeton dans un cookie `httpOnly` et `Secure`, lectures côté serveur, écritures par actions côté serveur ; le navigateur n'appelle jamais l'API et ne connaît ni son adresse ni le jeton. La recherche rapide et l'aperçu respectent cette règle.
- **Dates** (décision 19) : affichage et saisie en heure de Madagascar, quel que soit le fuseau de l'ordinateur.
- **Adresses** : les adresses des écrans de la fonctionnalité 008 restent valables ; un lien enregistré continue de mener au même contenu.
- **Messages** : les messages de l'API et ceux propres au Back Office (`specs/008-back-office/contracts/screens.md`) sont conservés mot pour mot.
- **Exigences fonctionnelles de l'aspect** (décision 18) : états d'attente, d'erreur et de liste vide, confirmation des suppressions, retour après chaque opération.

## Points signalés avant rédaction

- **La constitution est en retard.** Sa section « Décisions ouvertes » cite encore « spécification visuelle du Back Office » et « fournisseur de stockage des images », tranchés le 2026-10-13, et son principe V dit qu'aucun fournisseur n'est imposé. Un amendement (`/speckit-constitution`) est à proposer au porteur du projet. Il ne bloque pas cette fonctionnalité, puisque la décision est consignée dans `ARCHITECTURE.md`, qui fait foi.
- **Ce que la référence fait autrement.** La recherche rapide de la référence interroge l'API depuis le navigateur ; ici elle passe par le serveur du Back Office. La référence propose un changement de mot de passe, que l'API du site n'offre pas ; il n'est pas repris.

## Clarifications

### Session 2026-10-13

- Q: L'accueil doit-il afficher une barre de chiffres réels, ou rester sans chiffres comme décidé par la fonctionnalité 008 ? → A: Barre de chiffres réels (membres de l'année en cours, actions publiées, actualités publiées, candidatures), lus par les opérations de liste existantes (FR-016).
- Q: L'aperçu montre-t-il seulement les colonnes de la ligne, ou la fiche complète de l'élément ? → A: La fiche complète, lue à la sélection, avec un bref état d'attente (FR-014).
- Q: La ligne choisie est-elle inscrite dans l'adresse, comme la recherche, les filtres et la page ? → A: Oui, remplacée à chaque choix sans s'empiler dans l'historique ; un rechargement ou un lien partagé rouvre l'aperçu (FR-015).

## User Scenarios & Testing *(mandatory)*

Vérifications manuelles uniquement (constitution, principe IX). Chaque récit dit ce que l'on fait et ce que l'on doit observer.

### User Story 1 - Retrouver le Back Office sous sa nouvelle direction (Priority: P1)

L'administrateur se connecte et parcourt les cinq domaines. Chaque écran a l'aspect « La grille » : surfaces blanches séparées par des filets fins, outillage sur fond gris clair, couleurs officielles Rotary, coins presque droits, aucune carte ni ombre sur ce qui est posé dans la page. Les écrans s'ouvrent tous de la même manière : un en-tête de page, puis la barre d'outils, puis le contenu.

**Why this priority**: c'est l'objet de la fonctionnalité ; tout le reste s'appuie sur ce thème et ce cadre.

**Independent Test**: se connecter, ouvrir chacun des écrans de `specs/008-back-office/contracts/screens.md` et vérifier l'aspect et l'en-tête de page.

**Acceptance Scenarios**:

1. **Given** l'administrateur connecté sur un écran large, **When** il ouvre n'importe quel écran, **Then** une barre latérale fixe à gauche porte le logo, les six entrées (Accueil, Années Rotary, Membres, Actions, Actualités, Candidatures) et l'année Rotary en cours ; l'entrée en cours est marquée ; une barre supérieure porte le fil d'Ariane « Rotaract Club Ivandry / <domaine> », la recherche, le choix du thème et le menu du compte.
2. **Given** un écran de liste ou de fiche, **When** il s'affiche, **Then** il commence par un en-tête de page : retour quand il y a lieu, titre, marques d'état éventuelles, ligne de contexte, actions à droite, filet dessous.
3. **Given** un état (publié ou brouillon, année en cours), **When** il est affiché, **Then** il prend la forme d'un carré de couleur suivi de son libellé, jamais d'une couleur seule ni d'une pastille arrondie.
4. **Given** le bouton de l'action principale d'une zone, **When** il est affiché, **Then** il est plein, de couleur cranberry, aux coins de 2px, avec le coin inférieur droit chanfreiné ; une suppression utilise la couleur d'erreur.
5. **Given** une date, un compteur, un rang ou une année affichés seuls, **When** ils apparaissent dans une grille, **Then** ils sont écrits dans la police à chasse fixe ; un texte qui mêle mots et chiffres garde la police de l'interface.

---

### User Story 2 - Parcourir les listes et voir un élément sans quitter la grille (Priority: P1)

L'administrateur parcourt une liste (membres, actions, actualités, candidatures, années). Il choisit une ligne : un aperçu de l'élément s'affiche à droite de la grille sur grand écran, dans un tiroir sur un écran plus étroit. Il ouvre la fiche complète quand il veut modifier.

**Why this priority**: c'est le changement de navigation le plus visible de la direction « La grille », et il touche les cinq domaines.

**Independent Test**: sur la liste des actions, choisir une ligne à la souris puis au clavier, lire l'aperçu, ouvrir la fiche, revenir.

**Acceptance Scenarios**:

1. **Given** une liste sur un écran d'au moins 1200 px de large, **When** l'administrateur clique sur une ligne ou la choisit avec Espace, **Then** la ligne est marquée comme sélectionnée et un aperçu de 360 px à droite montre, après un bref état d'attente, la fiche de l'élément (par exemple les mandats d'un membre, l'impact d'une action) et ses actions (ouvrir, publier ou dépublier quand il y a lieu, supprimer).
2. **Given** aucune ligne choisie, **When** la liste s'affiche, **Then** l'emplacement de l'aperçu rappelle comment choisir une ligne et les raccourcis clavier.
3. **Given** un écran de moins de 1200 px, **When** une ligne est choisie, **Then** l'aperçu s'ouvre dans un tiroir à droite, qui se ferme par un bouton, par Échap ou par un clic à côté.
4. **Given** une ligne choisie, **When** l'administrateur appuie sur ↑ ou ↓, **Then** la ligne voisine est choisie ; sur Entrée ou un double-clic, la fiche complète s'ouvre à son adresse habituelle.
5. **Given** une liste, **When** elle se charge, échoue ou est vide, **Then** les états d'attente, d'erreur (« Réessayer ») et de liste vide (« Effacer les filtres » quand des filtres sont actifs) de la fonctionnalité 008 s'affichent dans le nouveau style.
6. **Given** une liste avec recherche, filtres, tri et page dans l'adresse, **When** l'administrateur recharge ou partage l'adresse, **Then** il retrouve la même vue, ligne choisie et aperçu compris.

---

### User Story 3 - Saisir sans perdre le fil (Priority: P1)

L'administrateur crée une année Rotary, ajoute un mandat à un membre ou modifie ses fonctions, sans quitter l'écran où il se trouve : la saisie s'ouvre dans un panneau latéral. Pour un membre, une action ou une actualité, le formulaire reste une page entière, dans le nouveau style.

**Why this priority**: les saisies sont le cœur du travail de l'administrateur ; leurs règles ne doivent pas changer.

**Independent Test**: créer une année depuis `/annees`, ajouter puis modifier un mandat depuis la fiche d'un membre, créer une action ; vérifier les messages d'erreur et l'avis de réussite.

**Acceptance Scenarios**:

1. **Given** l'écran des années, **When** l'administrateur choisit « Nouvelle année », **Then** un panneau latéral s'ouvre avec le champ « Année de début » ; l'enregistrement le ferme, la liste se met à jour et l'avis « Enregistrement créé. » s'affiche.
2. **Given** la fiche d'un membre, **When** il ajoute un mandat ou modifie des fonctions, **Then** la saisie se fait dans un panneau latéral, avec les mêmes champs et les mêmes messages qu'aujourd'hui.
3. **Given** une saisie refusée par l'API, **When** la réponse revient, **Then** chaque message s'affiche sous son champ, les messages généraux en tête du formulaire, et la saisie est conservée.
4. **Given** un téléphone, **When** un panneau latéral ou un dialogue de saisie s'ouvre, **Then** il occupe tout l'écran ; les champs ont un corps de 16 px et les boutons 40 px de haut.
5. **Given** une suppression demandée, **When** l'administrateur confirme dans le dialogue qui nomme l'élément, **Then** la suppression a lieu et l'avis s'affiche, comme aujourd'hui.

---

### User Story 4 - Choisir son thème (Priority: P2)

L'administrateur choisit entre le thème clair, le thème sombre et celui de son système. Son choix est conservé d'une visite à l'autre sur le même navigateur.

**Why this priority**: retenu explicitement par le porteur du projet, mais le Back Office reste complet sans lui.

**Independent Test**: passer en sombre, recharger, se déconnecter et se reconnecter ; vérifier chaque écran dans les deux thèmes.

**Acceptance Scenarios**:

1. **Given** le menu du thème dans la barre supérieure, **When** l'administrateur choisit « Sombre », **Then** tout le Back Office passe en sombre, y compris la page de connexion, sans éclair du thème clair au rechargement.
2. **Given** « Comme le système », **When** le système change de thème, **Then** le Back Office suit.
3. **Given** chaque écran, **When** il est affiché dans l'un ou l'autre thème, **Then** les textes, contours de champ et marques d'état gardent un contraste conforme à la direction (WCAG 2.2 AA).

---

### User Story 5 - Aller vite au bon endroit avec la recherche rapide (Priority: P2)

L'administrateur appuie sur Ctrl+K (⌘K sur Mac) ou clique sur le champ de recherche de la barre supérieure. Il tape quelques lettres et voit les écrans correspondants ainsi que les membres, actions, actualités et candidatures dont le nom ou le titre correspond. Entrée ouvre le résultat surligné.

**Why this priority**: accélère le travail quotidien, sans être nécessaire à aucune opération.

**Independent Test**: depuis n'importe quel écran, Ctrl+K, taper le début d'un nom de membre, Entrée : la fiche s'ouvre.

**Acceptance Scenarios**:

1. **Given** n'importe quel écran protégé, **When** l'administrateur appuie sur Ctrl+K ou ⌘K, **Then** un dialogue de recherche s'ouvre, le champ prêt à la saisie.
2. **Given** un texte saisi, **When** la recherche aboutit, **Then** les résultats sont regroupés par nature (écrans, membres, actions, actualités, candidatures) et ↑ ↓ Entrée permettent de les parcourir et d'en ouvrir un.
3. **Given** aucun résultat, **When** la recherche aboutit, **Then** « Aucun résultat » s'affiche.
4. **Given** la recherche, **When** elle interroge les contenus, **Then** elle passe par le serveur du Back Office : le navigateur n'appelle jamais l'API.
5. **Given** une session expirée pendant la recherche, **When** la réponse revient, **Then** l'administrateur est ramené à la connexion avec « Votre session a expiré. Reconnectez-vous. ».

---

### User Story 6 - Utiliser le Back Office sur téléphone (Priority: P2)

Sur un téléphone ou une tablette étroite, la barre latérale disparaît ; une barre d'onglets fixe en bas de l'écran donne accès aux cinq domaines, et la barre supérieure porte le logo, qui ramène à l'accueil.

**Why this priority**: le Back Office doit rester utilisable en déplacement ; la plupart des saisies se font cependant sur ordinateur.

**Independent Test**: ouvrir le Back Office à 375 px de large et effectuer une création d'actualité complète.

**Acceptance Scenarios**:

1. **Given** un écran de moins de 900 px, **When** un écran protégé s'affiche, **Then** une barre d'onglets en bas porte Années, Membres, Actions, Actualités et Candidatures, l'onglet actif marqué en cranberry, et les avis s'affichent au-dessus d'elle.
2. **Given** une grille plus large que l'écran, **When** elle s'affiche sur téléphone ou tablette, **Then** elle défile en largeur sans faire défiler la page entière.
3. **Given** un téléphone, **When** un champ reçoit le focus, **Then** l'écran ne zoome pas.

---

### User Story 7 - Se connecter sur la nouvelle page de connexion (Priority: P3)

La page de connexion devient la seule composition à part : le formulaire sur fond blanc et, sur grand écran, un panneau Royal Blue tramé de filets qui porte l'emblème du club.

**Why this priority**: vue une fois par session ; son comportement ne change pas.

**Independent Test**: se déconnecter, vérifier la page sur grand écran et sur téléphone, se connecter avec un mauvais puis un bon mot de passe.

**Acceptance Scenarios**:

1. **Given** un écran d'au moins 900 px, **When** la page de connexion s'affiche, **Then** le formulaire est à côté d'un panneau Royal Blue tramé qui porte l'emblème du club ; sous 900 px, seul le formulaire est affiché, avec le logo.
2. **Given** une session expirée, **When** la page s'affiche avec ce motif, **Then** le message « Votre session a expiré. Reconnectez-vous. » apparaît, comme aujourd'hui.
3. **Given** des identifiants refusés, **When** la réponse revient, **Then** le message de l'API s'affiche en tête du formulaire et l'email est conservé.

---

### Edge Cases

- **Thème avant chargement** : au premier affichage, le thème choisi est appliqué avant que la page soit visible ; aucun éclair du mauvais thème.
- **Sélection et filtres** : quand la ligne choisie disparaît de la liste (filtre, page suivante, suppression), la sélection est retirée de l'adresse et l'aperçu revient à son état d'invitation.
- **Sélection invalide dans l'adresse** : un identifiant qui ne correspond à aucune ligne affichée (mal formé, inconnu, sur une autre page) n'empêche pas la liste de s'afficher ; il est ignoré et l'aperçu montre son état d'invitation. Si la ligne est affichée mais que sa fiche n'existe plus au moment de la lecture, l'aperçu indique « Ressource introuvable. »
- **Sélections rapides** : en parcourant la grille avec ↑ ↓, seul l'élément finalement choisi s'affiche dans l'aperçu ; une réponse arrivée en retard pour une ligne précédente est ignorée.
- **Élément supprimé entre-temps** : un aperçu ou une fiche d'un élément supprimé ailleurs affiche « Ressource introuvable. », comme aujourd'hui.
- **Recherche rapide pendant la saisie d'un formulaire** : Ctrl+K ouvre la recherche sans perdre la saisie en cours ; quitter l'écran par un résultat suit la même règle que n'importe quel lien.
- **Raccourci déjà pris** : Ctrl+K dans un champ de texte ouvre quand même la recherche ; les raccourcis de grille (↑ ↓ Espace Entrée) ne s'appliquent que quand la grille a le focus, jamais dans un champ.
- **Préférences d'animation réduites** : les transitions sont coupées ; les indicateurs de chargement prennent leur variante fixe.
- **Lecteur d'écran et clavier** : la sélection d'une ligne, l'ouverture de l'aperçu et les résultats de recherche sont annoncés ; tout se fait au clavier ; le focus est visible partout (contour de 2 px).
- **Logo absent du thème sombre** : la variante claire du logo n'est jamais posée sur fond sombre, et inversement.
- **Accueil** : sans année Rotary en cours, ou si une lecture échoue, le chiffre concerné affiche « — » et l'accueil reste utilisable (FR-016).

## Requirements *(mandatory)*

### Functional Requirements

**Direction et thème**

- **FR-001**: Le Back Office MUST avoir un document de direction visuelle, `apps/admin/DESIGN.md`, adapté de celui de la référence : couleurs, typographie, mise en page, profondeur, formes, composants, à faire et à éviter. Il retire tout ce qui est propre à la trésorerie et devient la référence visuelle du Back Office (`ARCHITECTURE.md`, décision 18).
- **FR-002**: Les couleurs de marque MUST être les valeurs officielles de la charte Rotary reprises de la référence, sans retouche ; seuls les dérivés de lisibilité du thème sombre peuvent s'en écarter. Une couleur vive MUST toujours signifier la même chose (action principale, sélection, focus, état, erreur) et MUST NOT servir de décor.
- **FR-003**: Les surfaces posées dans la page MUST NOT avoir d'ombre ; elles se séparent par des filets de 1 px et par la teinte d'outillage. Seuls les dialogues, tiroirs, panneaux latéraux, menus et popovers portent une ombre.
- **FR-004**: Les coins MUST faire 2 px (0 pour les tiroirs et la barre d'onglets) ; les boutons pleins et à contour MUST porter le chanfrein du coin inférieur droit ; aucune pilule, aucun badge à fond coloré.
- **FR-005**: Un état MUST s'exprimer par un carré de 8 px suivi de son libellé : plein pour un état (publié, année en cours), vide et cerclé pour un état neutre (brouillon).
- **FR-006**: L'interface MUST utiliser Open Sans ; les nombres seuls (dates courtes, années, rangs, ordres, compteurs, tailles de fichier) MUST utiliser Red Hat Mono à chiffres tabulaires ; un texte qui mêle mots et chiffres garde Open Sans.
- **FR-007**: L'administrateur MUST pouvoir choisir le thème clair, le thème sombre ou celui du système ; le choix MUST être conservé sur le navigateur et appliqué sans éclair au chargement ; tous les écrans MUST être lisibles dans les deux thèmes (WCAG 2.2 AA).

**Cadre**

- **FR-008**: Dès 900 px de large, l'espace protégé MUST avoir une barre latérale fixe de 216 px (logo, six entrées dont l'active est marquée, année Rotary en cours en pied) et une barre supérieure fixe de 48 px (fil d'Ariane, recherche rapide, thème, compte).
- **FR-009**: Sous 900 px, la barre latérale MUST être remplacée par une barre d'onglets fixe en bas, portant les cinq domaines, et la barre supérieure MUST porter le logo, qui mène à l'accueil.
- **FR-010**: Le menu du compte MUST montrer l'email du compte, le rôle « Administrateur » et « Se déconnecter » ; rien d'autre (aucun changement de mot de passe : l'API n'en offre pas).
- **FR-011**: Un lien d'évitement « Aller au contenu » MUST être le premier élément atteint au clavier.
- **FR-012**: Chaque écran protégé MUST commencer par un en-tête de page commun : retour quand il y a lieu, titre (un seul titre principal par page), marques d'état, ligne de contexte, actions à droite.

**Listes, aperçu et saisie**

- **FR-013**: Les listes MUST être des grilles pleine largeur : filets horizontaux et verticaux, en-têtes de colonnes en petites capitales sur fond d'outillage, figés en haut dès 1200 px ; survol et sélection visibles ; pagination séparée par un filet fort. Les colonnes, filtres, tris et la pagination restent ceux de la fonctionnalité 008, et leur état reste dans l'adresse.
- **FR-014**: Dès 1200 px, les listes des années, membres, actions, actualités et candidatures MUST se présenter en « grille | aperçu de 360 px » ; en dessous, l'aperçu MUST s'ouvrir dans un tiroir de 400 px. L'aperçu MUST montrer la fiche de l'élément choisi, lue à la sélection par l'opération de détail existante : pour un membre, ses coordonnées et ses mandats (année, fonctions) ; pour une action, état, date, année, résumé, domaines et impact quand il existe ; pour une actualité, état, type, date et heure (Madagascar), année, lieu et résumé ; pour une candidature, coordonnées, situation, date et informations du CV ; pour une année, qui n'a pas d'opération de détail, ce que la liste fournit déjà (dates, en cours), sans lecture supplémentaire. Il propose les actions déjà offertes par la ligne (ouvrir, publier ou dépublier, supprimer, télécharger le CV pour une candidature). Pendant la lecture, l'aperçu montre un état d'attente ; si elle échoue, un message d'erreur avec « Réessayer », sans affecter la grille. Une sélection plus récente remplace toujours une lecture encore en cours.
- **FR-015**: Dans une grille ayant le focus : clic ou Espace choisit une ligne, ↑ ↓ passent à la voisine, double-clic ou Entrée ouvrent la fiche complète à son adresse habituelle. La ligne choisie MUST être inscrite dans l'adresse de la liste, avec la recherche, les filtres, le tri et la page ; chaque choix remplace l'adresse courante sans ajouter d'entrée à l'historique. Un rechargement ou un lien partagé rouvre la même ligne choisie et son aperçu ; fermer l'aperçu retire la sélection de l'adresse.
- **FR-016**: L'accueil MUST rester un point d'entrée vers les cinq domaines, dans le nouveau style, et MUST afficher une barre de chiffres réels : membres ayant un mandat dans l'année Rotary en cours, actions publiées, actualités publiées, candidatures reçues. Chaque chiffre est le total renvoyé par une opération de liste existante de l'API, avec les filtres déjà offerts ; aucun chiffre n'est calculé ni estimé autrement. Un chiffre qui ne peut pas être lu (erreur, aucune année en cours) MUST être remplacé par « — », jamais par zéro ni par une valeur inventée ; les autres restent affichés. Chaque case mène à la liste correspondante. Cela remplace la règle « aucun chiffre » de la fonctionnalité 008.
- **FR-017**: Les saisies courtes (création d'une année, ajout d'un mandat, modification des fonctions d'un mandat) MUST se faire dans un panneau latéral de 480 px, plein écran sur téléphone. Les formulaires d'un membre, d'une action et d'une actualité MUST rester des pages entières à leurs adresses actuelles. L'ordre des mandats d'une année reste une page entière.
- **FR-018**: Les champs, règles de saisie, messages d'erreur, dialogues de confirmation et avis de la fonctionnalité 008 MUST être conservés mot pour mot ; les erreurs de l'API s'affichent en tête du formulaire dans une alerte à filet teinté, les erreurs de champ sous le champ.
- **FR-019**: Sur téléphone, les dialogues de saisie et les panneaux latéraux MUST passer en plein écran, les boutons à 40 px de haut, les champs à 16 px de corps, les cibles tactiles à 40 × 40 px au moins.

**Recherche rapide**

- **FR-020**: Ctrl+K (⌘K sur Mac) et le champ de la barre supérieure MUST ouvrir une recherche qui trouve les écrans du Back Office, les membres (prénom et nom), les actions et les actualités (titre et résumé), et les candidatures (prénom, nom et email), exactement selon les recherches déjà offertes par l'API (2 caractères au moins) ; résultats regroupés par nature, parcourus au clavier, Entrée ouvre le résultat.
- **FR-021**: La recherche MUST passer par le serveur du Back Office, avec la session de l'administrateur ; le navigateur MUST NOT appeler l'API ni connaître le jeton. Une session expirée ramène à la connexion.

**Pages à part**

- **FR-022**: La page de connexion MUST présenter le formulaire et, dès 900 px, un panneau Royal Blue tramé de filets portant l'emblème du club ; son comportement (champs, messages, redirections) ne change pas.
- **FR-023**: Les pages d'accès refusé, d'élément introuvable et d'erreur MUST adopter le nouveau style, avec leurs textes actuels.
- **FR-024**: Le logo du club MUST exister en variante pour fond clair et pour fond sombre, et l'emblème seul pour la page de connexion ; chaque variante n'apparaît que dans le thème qui lui convient.

**Limites**

- **FR-025**: La refonte MUST NOT modifier l'API, le Front Office, les adresses des écrans, les règles de session ni le traitement des dates en heure de Madagascar.
- **FR-026**: La refonte MUST NOT ajouter de dépendance au-delà de celles déjà installées dans `apps/admin`, sauf justification écrite dans le plan et validée par le porteur du projet.
- **FR-027**: Les mouvements MUST se limiter aux transitions brèves d'état (survol, ouverture d'un panneau) ; aucune animation décorative ; tout est coupé quand l'utilisateur demande moins d'animations.

### Key Entities

Aucune donnée nouvelle. Une seule information nouvelle est conservée, et seulement dans le navigateur : **la préférence de thème** (clair, sombre ou système). Elle n'est envoyée ni au serveur ni à l'API.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % des écrans listés dans `specs/008-back-office/contracts/screens.md` sont présentés dans la nouvelle direction, dans les deux thèmes, sans écran resté dans l'ancien aspect.
- **SC-002**: 100 % des opérations de la fonctionnalité 008 (création, modification, publication, ordre, suppression, téléchargement du CV, connexion, déconnexion) restent réalisables, avec les mêmes messages, vérifiées une à une à la main.
- **SC-003**: Depuis n'importe quel écran, l'administrateur atteint la fiche d'un membre, d'une action, d'une actualité ou d'une candidature dont il connaît le nom en moins de 10 secondes avec la recherche rapide.
- **SC-004**: Consulter les informations principales de cinq éléments d'une liste à la suite ne demande aucun changement de page.
- **SC-005**: Les textes, contours de champ et marques d'état atteignent les contrastes WCAG 2.2 AA dans les deux thèmes ; tout le Back Office se parcourt au clavier, avec un focus toujours visible.
- **SC-006**: À 375 px de large, chaque écran s'utilise sans défilement horizontal de la page (seules les grilles défilent en largeur), et une création d'actualité complète est réalisable.
- **SC-007**: Aucune requête du navigateur vers l'API n'est observée pendant une session complète, recherche rapide comprise.

## Assumptions

- La préférence de thème est conservée dans le navigateur ; par défaut, le Back Office suit le thème du système.
- La barre d'onglets du téléphone porte les cinq domaines ; l'accueil s'atteint par le logo, pour ne pas dépasser cinq onglets.
- Les fichiers du logo et de l'emblème sont repris de la référence (`client/public/images/`), qui appartient au même club.
- Red Hat Mono se charge comme Open Sans aujourd'hui, par le chargement de polices du framework déjà en place, sans nouvelle dépendance.
- La recherche rapide affiche au plus quelques résultats par nature (de l'ordre de cinq), et ne cherche qu'à partir de deux caractères.
- L'aperçu ne permet aucune modification de champ ; il propose les mêmes actions que la ligne et le lien vers la fiche.
- Les formulaires longs gardent leur page pour conserver leurs adresses et la place nécessaire aux groupes de champs.
- Une seule personne administre : aucun conflit d'affichage entre plusieurs sessions n'est traité.
