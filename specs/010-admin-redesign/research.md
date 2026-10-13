# Recherche : refonte visuelle du Back Office

Décisions techniques prises pour réaliser `spec.md`. La référence visuelle est l'application de trésorerie du club : `../rotaract-app/rotaract-ivandry-runner` (abrégée « la référence » ; chemins relatifs à `client/`).

## R1. Thème : reprise du thème de la référence

- **Décision** : remplacer `apps/admin/src/theme/theme.ts` par une adaptation de `src/app/theme.ts` de la référence : `BRAND`, `GRID` (clair et sombre), `MONO`, `EASE_OUT`, `TOPBAR_HEIGHT`, ombres des surfaces flottantes, chanfrein des boutons, `tabularNums`, `tabularText`, et les surcharges de composants (bouton, table, champ, alerte, dialogue, tiroir, menu, onglets, avis). Les surcharges et variables propres à la trésorerie (`--figure-in`, couleurs de caisse) sont retirées.
- **Pourquoi** : la décision 18 demande la direction complète ; la reprendre telle quelle garantit la fidélité et évite de réinventer des valeurs déjà validées (contrastes, focus, densité).
- **Écarté** : réécrire un thème à partir du seul `DESIGN.md` de la référence (risque d'écarts) ; partager le fichier entre les deux projets (dépôts distincts, aucun paquet commun).

## R2. Thèmes clair et sombre sans éclair au chargement

- **Décision** : `createTheme({ cssVariables: { colorSchemeSelector: "class" }, colorSchemes: { light, dark } })`, `InitColorSchemeScript attribute="class"` en tête de `<body>` dans `app/layout.tsx`, `suppressHydrationWarning` sur `<html>`, `CssBaseline enableColorScheme`. Le choix (clair, sombre, système) passe par `useColorScheme()` ; MUI le conserve dans le `localStorage` du navigateur. Valeur par défaut : système.
- **Pourquoi** : c'est le montage de la référence ; le script pose la classe avant le premier affichage (aucun éclair) et tout est déjà dans `@mui/material` : aucune dépendance.
- **Écarté** : cookie lu par le serveur (plus de code, sans gain pour un seul administrateur) ; `prefers-color-scheme` seul (pas de choix manuel, exigé par FR-007).
- **Conséquence** : `ThemeRegistry.tsx` est simplifié ou fondu dans le layout ; `globals.css` reste minimal.

## R3. Polices

- **Décision** : `Open_Sans` (déjà chargée) et `Red_Hat_Mono` par `next/font/google`, variables `--font-sans` et `--font-mono`, comme dans la référence. La variable actuelle `--font-open-sans` est renommée.
- **Pourquoi** : même mécanisme qu'aujourd'hui, sans dépendance ; Red Hat Mono est une police variable (un seul fichier).

## R4. Logo et emblème

- **Décision** : copier `public/images/logo-club-light.png`, `logo-club-dark.png` et `logo-emblem.png` de la référence vers `apps/admin/public/images/` ; composants `ClubLogo` (variante choisie en CSS par le thème actif) et `ClubEmblem`, repris de la référence, avec `next/image`.
- **Pourquoi** : mêmes fichiers du même club (hypothèse de la spec) ; le choix de variante en CSS évite tout écart d'hydratation.
- **Écarté** : les fichiers de `apps/web/public/images/` (pas de variante pour fond sombre, pas d'emblème seul).

## R5. Cadre de l'application

- **Décision** : nouvel `AppShell` adapté de la référence : barre latérale collante de 216 px (`md` et plus), barre supérieure collante de 48 px, barre d'onglets fixe en bas sous `md`, lien d'évitement, contenu limité à 1440 px. Ce qui diffère de la référence :
  - la navigation est fixe (six entrées, cinq onglets sans l'accueil), sans lecture de droits ;
  - le compte vient du layout serveur (`GET /auth/me`, comme aujourd'hui), passé en propriété ; le menu du compte n'a que l'email, « Administrateur » et « Se déconnecter » (formulaire vers l'action serveur `logout` existante) ;
  - l'année Rotary en cours du pied de la barre latérale est lue par le layout serveur (`GET /admin/rotary-years`, `isCurrent`) ; à défaut, « — ».
- **Pourquoi** : la référence lit sa session côté navigateur ; ici, tout reste côté serveur (session `httpOnly`).
- **Conséquence** : `Notice` (avis en bas) est conservé et placé au-dessus de la barre d'onglets sur téléphone (surcharge `MuiSnackbar` de la référence).

## R6. Aperçu à droite des listes, sélection dans l'adresse

- **Décision** :
  - Le paramètre d'adresse `selection` (identifiant) s'ajoute aux paramètres existants de chaque liste.
  - La page (composant serveur) lit `selection`. Si l'identifiant est celui d'une ligne affichée, elle lit la fiche par l'opération de détail existante et rend l'aperçu dans un `Suspense` dont la clé est l'identifiant : la grille s'affiche pendant que l'aperçu attend. Pour les années, l'aperçu se fait sans lecture supplémentaire.
  - Côté navigateur, un composant de grille marque la ligne choisie tout de suite, puis remplace l'adresse (`router.replace(…, { scroll: false })`) après un court délai (environ 150 ms) pendant un parcours au clavier. Une navigation plus récente remplace la précédente : seul le dernier élément choisi s'affiche.
  - Dès `lg`, l'aperçu occupe une colonne de 360 px collante sous la barre supérieure ; en dessous, il s'affiche dans un tiroir droit de 400 px. Le tiroir s'ouvre quand une sélection existe. Fermer (bouton, Échap, clic à côté) retire `selection` de l'adresse.
- **Pourquoi** : la clarification Q3 met la sélection dans l'adresse. La lecture côté serveur garde la règle « lectures dans des composants serveur, le navigateur n'appelle jamais l'API ». Next.js garantit qu'une navigation plus récente l'emporte.
- **Coût accepté** : chaque sélection relit aussi la liste de la page (lecture `no-store`). Pour un seul administrateur et des pages de 20 lignes, c'est négligeable. Le délai au clavier évite une lecture par ligne survolée.
- **Écarté** :
  - une action serveur appelée par le navigateur pour lire la fiche : moins de lectures, mais un second chemin de lecture, et la sélection ne serait pas dans l'adresse ;
  - les routes parallèles ou interceptées : plus complexes, sans gain ici.

## R7. Largeur des grilles avec l'aperçu

- **Décision** : à 1200 px, la grille dispose d'environ 560 px à côté de l'aperçu.
  - Colonnes : les colonnes principales restent toujours visibles (état, titre, date ; nom et prénom ; nom, prénom et date). Les colonnes secondaires (année, ordre ou type, création, email, téléphone, situation) ne s'affichent qu'à partir de `xl` (1536 px) quand l'aperçu est en colonne, et à partir de `sm` sinon.
  - Actions de ligne : les boutons « Ouvrir / Publier / Supprimer » deviennent un bouton-icône de menu par ligne, avec les mêmes actions et des noms accessibles qui nomment l'élément. Les mêmes actions sont dans l'aperçu.
- **Pourquoi** : la référence règle ses colonnes pour tenir sans défilement dès `lg`. Les informations retirées restent visibles dans l'aperçu.
- **Écarté** : un aperçu seulement à partir de `xl` (contraire à FR-014) ; le défilement horizontal dès `lg` (refusé par la référence).

## R8. Recherche rapide (Ctrl+K)

- **Décision** :
  - Un composant `CommandSearch` adapté de la référence filtre dans le navigateur les six écrans par leur libellé.
  - Pour les contenus, il appelle une action serveur `quickSearch(q)` (environ 250 ms après la dernière frappe, à partir de 2 caractères). Cette action lit en parallèle `/admin/members`, `/admin/actions`, `/admin/news` et `/admin/applications` avec `q` et `limit=5`, par le client d'API côté serveur existant (`apiRead`, qui gère déjà le `401` en ramenant à la connexion).
  - L'action renvoie au plus cinq résultats par nature, sous une forme réduite : identifiant, libellé, ligne secondaire, adresse de la fiche. Si une nature échoue, son groupe est simplement absent.
  - Une réponse arrivée pour un texte dépassé est ignorée.
- **Pourquoi** : FR-021 interdit au navigateur d'appeler l'API. Les recherches de l'API existent déjà, avec leur minimum de 2 caractères. La journalisation des arguments des actions serveur est déjà coupée (`next.config.ts`), ce qui protège les termes recherchés.
- **Écarté** :
  - un gestionnaire de route `GET /recherche?q=` : le terme apparaîtrait dans les adresses et les journaux ;
  - une recherche limitée aux écrans : contraire à FR-020.

## R9. Accueil : barre de chiffres

- **Décision** :
  - L'accueil (composant serveur) lit en parallèle : les années (pour trouver l'année en cours), puis `/admin/members?year=<label>&limit=1`, `/admin/actions?published=true&limit=1`, `/admin/news?published=true&limit=1` et `/admin/applications?limit=1`. Il affiche le `meta.total` de chacune dans un `SummaryBar` repris de la référence.
  - Une lecture qui échoue, ou l'absence d'année en cours pour le chiffre des membres, donne « — ».
  - Chaque case est un lien vers la liste filtrée correspondante (`/membres?annee=…`, `/actions?publie=true`, `/actualites?publie=true`, `/candidatures`).
  - Sous la barre de chiffres, les cinq accès de l'accueil actuel restent, dans le nouveau style.
- **Pourquoi** : la clarification Q1 demande des chiffres lus, jamais inventés (constitution, principe VIII). `limit=1` réduit chaque lecture au minimum.
- **Écarté** : un nouvel endpoint de statistiques (aucune modification de l'API, FR-025).

## R10. Panneaux latéraux

- **Décision** : composant `SideSheet` repris de la référence (tiroir droit de 480 px, plein écran sous `sm`, tête sur fond d'outillage, bouton Fermer). Il remplace le dialogue de création d'une année (`YearsView`) et celui d'un mandat (`MandatesSection`). Les actions serveur, `useActionState`, les messages et les avis restent inchangés.
- Les dialogues de confirmation (`ConfirmDialog`) et d'adresse publique (`PublishedSlugDialog`) restent des dialogues, simplement restylés par le thème.

## R11. Marques d'état

- **Décision** : composants `StatusMark` (carré plein de 8 px + libellé) et `NeutralMark` (carré vide cerclé + libellé), adaptés de la référence (`DotChip`, `NeutralMark`). Ils remplacent les `Chip` d'état.
  - Publié : Lawn Green.
  - Brouillon : marque neutre.
  - Année en cours : Azure.
  - CV : aucune marque (pas d'état).
- **Pourquoi** : FR-005, et la règle « Couleur = Sens » de la référence.

## R12. Pages à part

- **Décision** :
  - La page de connexion reprend la composition de la référence : formulaire de 360 px, et dès `md` un panneau Royal Blue tramé de filets de 32 px qui porte `ClubEmblem`. `LoginForm` garde sa logique.
  - Les pages d'accès refusé, d'introuvable et d'erreur (`error.tsx`) prennent l'en-tête de page et les états du nouveau style.

## R13. Mouvement et accessibilité

- **Décision** : `motion.reducedMotion: "system"` et la coupure globale des transitions sous `prefers-reduced-motion` (thème de la référence). Pas d'effet d'onde. Focus visible : contour de 2 px.
  - Grille : `role` et `aria-selected` sur la ligne choisie, `aria-live="polite"` sur l'aperçu.
  - Raccourcis de grille actifs seulement quand la grille a le focus, jamais dans un champ.
  - Ctrl+K écouté sur le document, y compris dans un champ.

## R14. `apps/admin/DESIGN.md`

- **Décision** : un document au format du `DESIGN.md` de la référence (en-tête de valeurs, puis Overview, Colors, Typography, Layout, Elevation, Shapes, Components, Do's and Don'ts). Nom de la direction : « La grille ».
  - Retirés : barre de calcul, ruban des mois, solde et deux caisses, montants, Vert d'entrée.
  - Ajoutés : aperçu des listes, recherche rapide côté serveur, barre de chiffres de l'accueil, marques d'état du Back Office.
  - Il renvoie à `ARCHITECTURE.md` (décision 18) et cite la référence comme origine.
- Il est écrit en premier, avant le code (règle « décision d'abord »).

## R15. Ce qui ne change pas

Le client d'API, la session, le proxy, les actions serveur, la validation, les dates (`lib/dates.ts`) et les adresses ne changent pas.

Les écrans conservent leurs données et leurs opérations. Seuls changent leur composition et leurs composants de présentation :
- `PageHeader` reçoit `back`, `marks`, `meta` et `actions` ;
- `ListToolbar`, `EmptyState`, `LoadingState`, `ListPagination` et `SortableHeader` sont restylés ;
- `ContentTable`, `MembersTable` et `ApplicationsTable` gagnent la sélection, le menu de ligne et l'aperçu.

Aucune dépendance n'est ajoutée : tout ce qui précède est dans `@mui/material`, `@mui/icons-material` et `next`.
