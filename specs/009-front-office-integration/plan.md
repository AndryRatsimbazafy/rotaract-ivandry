# Implementation Plan: Intégration du Front Office avec l'API

**Branch**: `009-front-office-integration` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-front-office-integration/spec.md`

## Summary

Relier le Front Office existant (`apps/web`) à l'API : l'accueil et les pages Actions, Actualités et Membres affichent ce que le club publie dans le Back Office ; le formulaire de la page Rejoindre dépose réellement la candidature et son CV.

Approche : celle d'`ARCHITECTURE.md`, section 10. Les pages lisent déjà leurs données par les seules fonctions de `apps/web/src/data/` : **le corps de ces fonctions change, les pages presque pas**. Un petit client d'API côté serveur (`src/lib/api.ts`) porte l'adresse, la revalidation par durée (environ 60 secondes) et le traitement des échecs. La couche de données convertit les formes publiques de l'API vers les types que les composants attendent déjà (paragraphes, photographies vides), ce qui limite les retouches des composants à trois écarts de modèle : domaines au pluriel, fonctions fournies par année, description d'une action. Le formulaire passe par une Server Action qui relaie le `multipart` à l'API.

Aucune dépendance nouvelle. `apps/api` et `apps/admin` ne sont pas modifiés. Les compositions de `DESIGN.md` sont conservées ; deux sections disparaissent par décision (registre d'impact, profils de démonstration).

## Technical Context

**Language/Version** : TypeScript 5 (strict), Node.js 22. Next.js 16.3.8 (App Router), React 19.2.8 — déjà installés dans `apps/web`.

**Primary Dependencies** : aucune à installer. `apps/web` ne dépend que de Next.js et de React ; cela ne change pas.

**Storage** : aucun. Le site ne conserve rien ; il lit l'API et garde ses réponses en cache, avec une revalidation d'environ 60 secondes (cache de données de Next.js).

**Testing** : aucun test automatisé (constitution, principe IX). Vérification manuelle structurée dans [quickstart.md](./quickstart.md), plus `npm run lint` et `npm run build:web`.

**Target Platform** : serveur Node.js 22 en local, port 3000 ; navigateurs récents. Hébergement hors périmètre.

**Project Type** : application web (Next.js) dans un monorepo npm workspaces, cliente d'une API HTTP existante.

**Performance Goals** : aucun objectif chiffré. Une page de lecture se rend à partir du cache dans le cas courant ; une visite ne déclenche pas systématiquement une lecture de l'API.

**Constraints** : aucun appel du navigateur vers l'API ; adresse de l'API côté serveur seulement ; aucune pagination visible ; heure de Madagascar pour le jour et le mois des actualités ; CV de 5 242 880 octets au plus, relayé sans être conservé ; design inchangé.

**Scale/Scope** : cinq pages, quatre fichiers de données réécrits, un client d'API, huit opérations d'API consommées, une Server Action.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification | État |
|---|---|---|
| I. Source de vérité | Mode de consommation, format des réponses et correspondance des modèles repris d'`ARCHITECTURE.md`, section 10. Les décisions closes par la spec (Q1, P1, P2, P3) demandent d'aligner `ARCHITECTURE.md` et `DESIGN.md` **avant le code** : section A, première tâche. | Conforme, alignements à appliquer en premier |
| II. Étapes validées | Spec validée le 2026-10-02. Ce plan s'arrête après la phase 1 : ni tâches ni code. | Conforme |
| III. Préférence pour le manuel | Aucun script. `apps/web/.env.local` est créé à la main ; le contenu de vérification se saisit dans le Back Office. | Conforme |
| IV. Simplicité technique | `fetch` de Next.js avec revalidation, Server Action, `Intl` pour le fuseau. Aucune dépendance, aucune bibliothèque de cache, de formulaires ni de dates. Pas de client d'API générique : une fonction de lecture, une d'envoi. | Conforme |
| V. Architecture backend | Non modifiée. Seules des routes publiques sont appelées. | Conforme |
| VI. Intégrité du modèle métier | Année d'un contenu lue telle que l'API la fournit ; fonctions par année ; impact facultatif sans texte d'attente. | Conforme |
| VII. Front Office | Français seulement. Compositions de `DESIGN.md` conservées ; aucun gabarit générique, aucune pagination. Deux changements de design, tous deux décidés (P1, P2), reportés dans `DESIGN.md` d'abord. | Conforme |
| VIII. Qualité et contenu | Profils fictifs et indicateurs « Donnée à venir » retirés ; aucun contenu inventé pour combler un champ absent. | Conforme |
| IX. Tests | Aucun test, aucun outillage de test. | Conforme |
| X. Outillage et infrastructure | npm ; aucune installation ; ni Docker, ni CI/CD, ni déploiement. | Conforme |
| XI. Git et collaboration | Branche créée à la demande du porteur du projet. Aucun commit ni push sans demande. | Conforme |
| XII. Non-régression | `apps/api` et `apps/admin` inchangés. `DESIGN.md` modifié sur deux points validés, rien d'autre. Les cinq routes sont revérifiées. | Conforme |

**Résultat de la porte** : passée. Aucune violation à justifier.

**Re-vérification après la phase 1** : inchangée. Tous les points soumis avec ce plan ont été tranchés le 2026-10-02 (section C).

## A. Alignements documentaires, à appliquer avant le code

**Aucun n'est appliqué par ce plan.** Ils forment la première tâche de l'implémentation, et rien d'autre n'est modifié dans ces deux documents. Aucune direction visuelle nouvelle n'est ajoutée à `DESIGN.md`.

### DESIGN.md

| # | Passage | Texte actuel | Changement |
|---|---|---|---|
| D1 | Section 8, « Profils de démonstration » | La page Members peut montrer quelques profils fictifs tant que le club n'a pas fourni les siens… | Puce supprimée. La règle « Rien n'est inventé » reste ; une année sans membre montre l'état vide de l'annuaire. |
| D2 | Section 10, « Le registre d'impact » | La page Actions peut réunir l'impact de l'ensemble des actions… Une valeur absente s'écrit « Donnée à venir »… | Paragraphe remplacé par : aucun registre d'impact agrégé n'est affiché tant qu'aucune donnée réelle ne le porte ; « Donnée à venir » n'est écrit nulle part. La phrase « L'impact n'affiche que des données réelles. » reste. |
| D3 | Compositions des pages, ligne « Actions » | … chacune dans l'une de trois compositions qui alternent… **Registre d'impact sur champ encre.** Rappel cranberry. | La phrase « Registre d'impact sur champ encre. » est supprimée. |
| D4 | Toute autre mention du registre d'impact ou des profils de démonstration (table des couleurs, liste de contrôle, table des composants) | à relever à l'application | Alignée sur D1 et D2, sans autre changement. |

### ARCHITECTURE.md

Limités à quatre sujets : la revalidation, la conservation d'un contenu déjà lu, les dates des actualités, la lecture complète des listes. **La décision ouverte sur un éventuel registre d'impact agrégé n'est ni fermée ni modifiée.**

| # | Passage | Changement |
|---|---|---|
| A1 | Section 10, « Mode de consommation », puce « Cache » | « revalidation par durée (60 s proposées) **[ouvert]** » devient : revalidation par durée, configurée à environ 60 secondes ; l'objectif est qu'un changement fait dans le Back Office soit visible en une minute environ, **sans garantie à la seconde près** ; une visite ne déclenche pas systématiquement une lecture de l'API. |
| A2 | Même puce | Ajout : une revalidation qui échoue ne remplace pas volontairement par un état vide un contenu déjà correctement mis en cache ; cela vaut tant que le cache existe (il est propre au serveur du site et repart de zéro après un build). |
| A3 | Section 10, « Écarts à traiter », point 3 « Fuseau des actualités » | « il l'affichera dans le fuseau approprié » devient : le Front Office affiche le jour et le mois d'une actualité en heure de Madagascar, jamais l'heure, et groupe son fil par mois dans ce fuseau. |
| A4 | Section 10, « Mode de consommation » | Ajout : les listes d'actions et d'actualités sont lues en entier, par pages de 100 éléments au plus ; aucune pagination n'est visible. Nécessaire à l'architecture : c'est ce qui fixe le nombre de lectures et l'absence de pagination côté site. |
| A5 | Section 14, « Verrouillées » | Ajout de la décision 20, « Cache du Front Office », qui reprend A1 et A2 ; complément de la décision 19 par A3. |
| A6 | Section 14, « Encore ouvertes » | Retrait de la seule ligne « Cache du Front Office ». Les autres lignes, dont « Registre d'impact agrégé de la page Actions », restent telles quelles. |

`PROJECT_CONTEXT.md`, `CLAUDE.md`, l'en-tête d'état d'`ARCHITECTURE.md` et sa décision 15 (« Front Office sur ses données locales ») sont mis à jour **à la fin**, pour décrire ce qui existe ; ce ne sont pas des décisions.

## B. Conception

### B1. Accès à l'API depuis Next.js (FR-001 à FR-004)

- `src/lib/api.ts`, côté serveur : `API_URL` (variable serveur, `apps/web/.env.local`), une fonction de lecture `apiGet(chemin, paramètres)` et rien d'autre pour les lectures. Aucune variable `NEXT_PUBLIC_*`.
- Toute lecture : `fetch(adresse, { next: { revalidate: 60 }, signal: délai de 10 secondes })`. Une réponse autre que `200` lève une erreur, pour ne pas être mise en cache.
- Les fonctions de `src/data/*` appellent `apiGet`, convertissent la réponse, et **attrapent tout échec** pour renvoyer leur valeur vide (liste vide, 0). Les pages ne voient jamais d'erreur : c'est la règle d'`ARCHITECTURE.md` (« emplacements sans contenu plutôt qu'une erreur »).
- Aucune route d'administration, aucun jeton. Le navigateur ne reçoit que du HTML rendu sur le serveur.
- Détail des fonctions et des opérations : [contracts/data-layer.md](./contracts/data-layer.md).

### B2. Fraîcheur : revalidation d'environ 60 secondes (FR-009, SC-013)

- **Réglage** : le cache de données de Next.js, par requête `fetch`, avec une durée de revalidation de 60 (secondes). Il est indexé par adresse : chaque combinaison de filtres a sa propre entrée. La valeur est écrite une seule fois, dans `src/lib/api.ts`.
- **Objectif de fraîcheur** : environ 60 secondes. **Ce n'est pas une garantie à la seconde près.**
- **Fonctionnement** (« périmé pendant la relecture ») : tant que l'entrée est fraîche, elle est servie sans appeler l'API. Une fois périmée, **la visite suivante reçoit encore l'ancienne réponse** et déclenche une relecture en arrière-plan ; c'est la visite d'après qui voit le nouveau contenu. Le délai réel est donc d'environ une minute, plus l'attente de la visite suivante, plus une relecture.
- **Vérification** : SC-013 se vérifie avec une tolérance de 90 secondes, en rechargeant la page deux fois une fois la minute écoulée.
- **Aucune lecture systématique** : une visite ne déclenche pas d'appel à l'API tant que l'entrée est fraîche, quel que soit le nombre de visiteurs.
- **Revalidation qui échoue** : elle ne remplace pas volontairement par un état vide un contenu déjà correctement mis en cache (B3).
- L'accueil (`/`) et la page Rejoindre n'utilisent aucune donnée de requête : ils sont générés statiquement et régénérés selon la même durée. Les trois pages à filtres sont rendues à la demande, à partir du cache de données.
- L'envoi d'une candidature n'utilise aucun cache.

### B3. Indisponibilité de l'API (FR-043, récit 6)

- **Aucun contenu jamais lu** (première lecture, ou cache vidé) : la fonction de données renvoie sa valeur vide ; la page affiche ses emplacements sans contenu, comme avec une base vide.
- **Contenu déjà lu, revalidation qui échoue** : Next.js ne remplace une entrée du cache que par une réponse `200`. L'entrée périmée reste servie, et une nouvelle relecture est tentée à la visite suivante. Un contenu déjà correctement mis en cache n'est donc pas volontairement remplacé par un état vide. La couche de données ne fait rien qui contredise ce mécanisme : elle n'écrit jamais de valeur vide dans le cache.
- **Limites, à ne pas présenter comme une garantie** : le cache vit sur le serveur du site ; il est vidé par un nouveau build ou un redéploiement, n'est pas partagé entre plusieurs instances, et peut être évincé. Après l'un de ces événements, une API indisponible donne des pages à l'état vide jusqu'à son retour. Le comportement de `next dev` diffère (cache de rechargement à chaud) : ces vérifications se font sur `next build` puis `next start`.
- Au build, une API indisponible ne fait pas échouer la génération : l'accueil est alors généré à l'état vide et se met à jour à la première relecture réussie.

### B4. Listes longues : tout lire, sans pagination visible (FR-010, SC-014)

- `GET /actions` et `GET /news` sont lues avec `limit=100`. La première page donne `meta.totalPages` et `meta.total` ; les pages suivantes sont lues en parallèle, puis assemblées dans l'ordre. Chaque page est une requête `fetch` à part, avec sa propre entrée de cache. Les filtres (`year`, `focusArea`, `type`) sont transmis à l'API, pas appliqués localement.
- **Avec 120 actions** : deux demandes (100 + 20) à la première lecture, puis aucune tant que les entrées sont fraîches ; les 120 sont rendues dans l'ordre de l'API, dans les trois compositions alternées. **Avec 120 actualités** : de même ; la première est à la une, les 119 autres forment le fil groupé par mois. Les nombres affichés en ouverture viennent de `meta.total`.
- Aucun composant de pagination, aucun « voir plus ». Les filtres par année, par domaine et par rubrique restent le moyen de réduire une liste.
- Les membres ne sont pas concernés : l'annuaire d'une année tient en une réponse.

**Récupération partiellement échouée — comportement technique retenu.** La fonction de données renvoie la liste **et** un indicateur « complète ou non » ; elle ne présente jamais un résultat partiel comme complet, et ne transforme jamais une lecture partielle en liste vide.

| Cas | Ce que la page affiche |
|---|---|
| 1. La première page ne peut pas être lue, et aucune entrée en cache n'existe | L'état vide de repli prévu : emplacements sans contenu, comme pour une API indisponible (B3). Rien n'est mis en cache ; la lecture est retentée à la visite suivante. |
| 2. Une page (la première ou une suivante) est périmée et sa revalidation échoue | La dernière réponse correcte de cette page reste servie par le cache : la liste affichée est le dernier contenu complet correctement lu. Aucun signalement. |
| 3. Une page suivante n'a aucune entrée en cache et ne peut pas être lue | Les éléments des pages lues sont affichés, **et la liste est signalée comme incomplète** par la phrase unique « Cette liste est incomplète pour le moment. », près du titre de la section, dans le style de la mention « Contenu à venir » ; ni compteur, ni pagination. Le nombre affiché reste `meta.total`, le vrai total. Rien n'est mis en cache pour la page en échec ; elle est relue à la visite suivante. |
| 4. Aucune page n'a pu être lue ni n'est en cache | Cas 1. |

- Le cas 3 ne se produit qu'à une première lecture d'une liste de plus de 100 éléments pendant une panne partielle : il est rare, mais son comportement est défini.
- Aucune règle métier n'est créée : le contenu, son ordre et ses filtres restent ceux de l'API.
- Aucune nouvelle tentative immédiate n'est faite : la visite suivante relit, ce qui suffit et évite d'allonger le rendu d'une page.
- Limite connue : deux pages lues à des instants différents peuvent refléter deux états de la liste si un contenu a été publié entre-temps ; l'écart se résorbe à la revalidation suivante.

### B5. Années Rotary et filtres (FR-008, FR-012, FR-019, FR-026, FR-044)

- **Année en cours** : `GET /rotary-years`, l'année dont `isCurrent` est vrai. Sans année en cours dans l'API (ou API indisponible) : l'année Rotary du calendrier, calculée par la fonction existante `rotaryYearOf` (hypothèse de la spec). La constante `currentRotaryYear` écrite en dur est supprimée.
- **Années proposées** : `GET /actions/years` pour les actions, `GET /members/years` pour les membres, `GET /news/archives` pour les actualités (avec leur nombre). Sans aucune année : seule l'année en cours est proposée, comme aujourd'hui.
- **Filtres** : les paramètres d'adresse existants sont conservés (`annee`, `domaine`, `rubrique`) et traduits vers ceux de l'API (`year`, `focusArea`, `type`). Un filtre inconnu ou mal formé reçoit un `400` de l'API : la fonction de données renvoie une liste vide, et la page montre son état « aucun résultat » existant.
- **Année d'un contenu** : celle que l'API renvoie. `rotaryYearOf` ne sert plus à ranger une actualité.

### B6. Actualités : heure de Madagascar, date seule (FR-018 à FR-024, P3)

- `src/lib/dates.ts` reste **le seul fichier** à porter un fuseau. Les formateurs du jour et du mois d'une actualité (`formatDay`, `formatMonthYear`), aujourd'hui en temps universel, passent au fuseau `Indian/Antananarivo`. Ils ne servent qu'aux actualités (une, fil, accueil) ; `formatFullDate` est supprimé : il n'a aucun appelant dans `apps/web`, aucune exigence de la spec n'affiche de date complète, et aucune page n'en a besoin ; le laisser en temps universel à côté de formateurs en heure de Madagascar prêterait à confusion.
- Le regroupement par mois du fil s'appuie sur ces mêmes formateurs : il suit donc le fuseau de Madagascar sans autre changement.
- Tout est formaté sur le serveur : le fuseau du visiteur n'intervient pas. L'heure n'est affichée nulle part ; l'attribut `datetime` des balises `<time>` garde l'instant exact.
- Contenu : `content` est découpé en paragraphes sur les lignes vides par la couche de données, qui fournit `body` aux composants existants. Sans contenu, pas de « Lire la suite ».
- Archives : années et nombres de `GET /news/archives` ; plus aucun calcul local.

### B7. Actions (FR-011 à FR-017, P1)

- Type `Action` : `focusArea?: string` devient `focusAreas: string[]` ; `description?` et `date` sont ajoutés ; `photos` reste, toujours vide.
- `ActionsIndex` et `LatestActions` : tous les domaines d'une action sont nommés dans ses métadonnées ; la description est lue dans la fiche dépliable, au-dessus des rubriques d'impact, découpée en paragraphes ; la fiche est proposée dès qu'il y a une description, une rubrique d'impact ou une photographie supplémentaire.
- Impact : inchangé dans son principe — seules les rubriques renseignées s'affichent.
- **Registre d'impact supprimé** : la section `ImpactLedger`, sa feuille de style, ses textes (`impactLedger`, dont « Donnée à venir »), `getImpactIndicators` et le type `ImpactIndicator`. La page Actions se termine par l'index puis le rappel d'adhésion.
- Nombre d'actions : `meta.total` d'une lecture sans filtre.

### B8. Membres (FR-025 à FR-029, P2)

- Type `Member` : les fonctions de l'année demandée sont portées par le membre (`roles`), avec `order` ; `mandates`, `isDemo` et la fonction `rolesForYear` disparaissent, comme le prévoit `ARCHITECTURE.md`, section 10.
- `MembersDirectory`, `MembersFunctions`, `MembersPreview` lisent `member.roles`. Les sept profils de démonstration, leur mention et leur style sont supprimés.
- Année affichée par défaut : la plus récente de `GET /members/years` ; à défaut l'année en cours. `GET /members?year=<label>` renvoie l'annuaire dans l'ordre du club ; l'ordre n'est jamais retrié.
- Accueil : `GET /members?limit=4`, qui porte sur l'année en cours par défaut.
- Ni email ni téléphone : l'API publique ne les renvoie pas.

### B9. Candidature : relais du CV jusqu'à 5 Mo (FR-032 à FR-041)

- **Chemin** : navigateur → Server Action du site → `POST /applications` de l'API → stockage. C'est le chemin d'`ARCHITECTURE.md`, section 10. Le navigateur n'envoie rien ailleurs qu'au site.
- **Server Action** `submitApplication(formData)` dans `src/data/applications.ts` : elle reconstruit un `FormData` avec **exactement** les six champs du contrat (`firstName`, `lastName`, `email`, `phone`, `applicantStatus`, `cv`) — l'API refuse tout champ en plus — et l'envoie par `fetch`, sans cache. `fetch` écrit lui-même l'en-tête `multipart/form-data` et sa frontière ; le fichier garde son nom et ses octets. Le type annoncé par le navigateur n'a pas d'importance : l'API constate le type sur le contenu.
- **Taille** : une Server Action refuse par défaut un corps de plus de 1 Mo. Réglage `experimental.serverActions.bodySizeLimit` de `apps/web/next.config.ts` à **`6mb`** : 5 242 880 octets de fichier, les champs, et l'habillage `multipart` (10 à 20 Ko selon la documentation de Next.js), avec une marge pour qu'un fichier de 5 242 881 octets atteigne l'API et reçoive son `413`.
- **Contrôle avant l'envoi**, dans le formulaire : taille du fichier (5 Mo au plus), en plus des contrôles existants ; le motif du téléphone est aligné sur celui de l'API. L'API reste l'autorité : ses refus sont affichés.
- **Délai technique de l'appel** : 60 secondes. L'envoi d'un CV de 5 Mo de l'API vers le stockage a pris une vingtaine de secondes sur la liaison de vérification (constat de 007) ; un délai court ferait échouer des dépôts valides.
- **Retour d'interface (SC-007)** : dès le clic, le bouton devient inactif et « Envoi en cours… » est annoncé ; l'issue est ensuite un résultat clair, de succès ou d'échec, jamais un état indéterminé. SC-007 porte sur ce retour d'interface, non sur la durée physique du transfert d'un fichier volumineux.
- **Issues** : [contracts/application-form.md](./contracts/application-form.md). `201` → confirmation existante, formulaire vidé. `400` avec détails → message de l'API sous chaque champ. `413`, `415` → message sous le champ du CV. `429` et `503`, réseau, délai → message d'ensemble. Dans tous les cas d'échec la saisie est conservée ; rien n'est journalisé.
- **Aucune exposition du stockage** : l'API ne renvoie que `{ "received": true }` ou une erreur abstraite ; la Server Action ne transmet au navigateur qu'un résultat typé, sans corps de réponse brut.
- **Vérification obligatoire du passage de 5 Mo** : le passage d'un fichier de 5 242 880 octets par une Server Action est documenté, non encore constaté dans ce dépôt. Il est **réellement vérifié** — fichier de 5 242 880 octets envoyé par le formulaire, retrouvé dans le Back Office, téléchargé et comparé par empreinte — avant que la tâche de la candidature puisse être considérée comme terminée.
- **Aucun repli automatique** : la Server Action est l'architecture cible. Si le passage de 5 Mo échoue, l'implémentation **s'arrête** : l'incompatibilité est décrite précisément (taille atteinte, message, réglage essayé) et soumise au porteur du projet. Aucun gestionnaire de route n'est substitué à la Server Action sans cette validation ; ce repli ne fait pas partie de ce plan.

### B10. États : vide, attente, erreur (FR-005, FR-042 à FR-045)

- **Vide** : les emplacements et messages existants sont conservés (« Contenu à venir », registre vide, « Aucune action ne correspond à ces filtres. », année sans membre). Les emplacements fictifs ne complètent plus une liste partielle : avec une ou deux actions, l'accueil n'en montre qu'une ou deux.
- **Champ absent** : l'API omet un champ facultatif vide ; le composant ne rend pas l'élément. Aucun texte de remplacement.
- **Attente** : un fichier `loading.tsx` pour chacune des trois pages de lecture à filtres, qui reprend l'ouverture de la page et un squelette du bloc de liste aux dimensions du contenu (`DESIGN.md`, section 9). Avec le cache, il n'apparaît que lors d'une lecture réelle de l'API.
- **Erreur** : aucune page d'erreur n'est ajoutée, la couche de données n'en laissant passer aucune. Les seuls messages d'erreur sont ceux du formulaire.

### B11. Design, accessibilité, écrans (FR-046, FR-047, récit 7)

- Aucun composant nouveau en dehors des trois squelettes ; aucune feuille de style nouvelle hors ceux-ci. Les modules CSS existants sont retouchés seulement là où un élément apparaît (liste de domaines, paragraphes de description) ou disparaît (registre, profils de démonstration).
- Les contenus réels sont de longueurs variables : la vérification porte sur un titre de 120 caractères, un résumé de 500, sept domaines, dix fonctions, aux largeurs 1280, 768 et 375 px.
- Formulaire : la forme d'erreur existante (« Erreur : … » sous le champ, `aria-describedby`, focus sur le premier champ en erreur) est réutilisée pour les refus de l'API ; le résultat d'ensemble reste dans la zone `role="status"` existante.

### B12. Contenu statique supprimé ou remplacé

| Fichier de `apps/web/src/` | Changement |
|---|---|
| `data/actions.ts`, `data/news.ts`, `data/members.ts` | Corps remplacés par des lectures de l'API ; listes locales et profils de démonstration supprimés |
| `data/applications.ts` | Devient la Server Action de dépôt |
| `data/rotary-years.ts` (nouveau) | Année en cours |
| `lib/api.ts` (nouveau) | Lecture avec revalidation |
| `lib/dates.ts` | Fuseau de Madagascar pour les actualités ; `formatFullDate` supprimé |
| `lib/rotary-year.ts` | `currentRotaryYear` supprimée ; `rotaryYearOf` conservée pour le seul repli de l'année en cours |
| `types/action.ts`, `types/member.ts`, `types/news.ts`, `types/application.ts` | Alignés sur les formes publiques ([data-model.md](./data-model.md)) |
| `app/actions/_sections/ImpactLedger.tsx` et son style | Supprimés |
| `content/actions.ts` | `impactLedger` supprimé |
| `content/members.ts` | `demoNote` supprimé |
| `content/join.ts` | « non relié » supprimé ; aide du CV avec la taille ; messages des refus ; `status` → `applicantStatus` |
| `app/page.tsx`, `app/actions/page.tsx`, `app/actualites/page.tsx`, `app/membres/page.tsx` | Année en cours lue par la couche de données ; registre retiré |
| Sections des actions, des actualités, des membres et de l'accueil | Retouches limitées aux trois écarts de modèle |
| `app/rejoindre/_sections/ApplicationForm.tsx` | Envoi réel, refus de l'API, contrôle de taille |
| `next.config.ts` | Taille admise pour la Server Action |
| `.env.example` (nouveau), `.gitignore` | Nom `API_URL`, sans valeur ; exception pour `.env.example` |

Les contenus éditoriaux (présentation du club, valeurs, domaines, parcours, questions fréquentes, réseaux sociaux, photographies d'ouverture) ne sont pas touchés.

### B13. Vérification manuelle

[quickstart.md](./quickstart.md) : contenu saisi dans le Back Office, site lancé depuis son build (`next build` puis `next start`), API et Back Office en fonctionnement. Dix sections : les cinq routes, le formulaire et ses refus, la fraîcheur (SC-013), les listes de 120 éléments (SC-014), l'API arrêtée, la forme (largeurs, clavier), le nettoyage et la non-régression.

## Project Structure

### Documentation (this feature)

```text
specs/009-front-office-integration/
├── plan.md              ce fichier
├── research.md          phase 0
├── data-model.md        phase 1 : formes publiques lues, types du Front Office
├── quickstart.md        phase 1 : vérification manuelle
├── contracts/
│   ├── data-layer.md        phase 1 : fonctions de src/data et opérations de l'API
│   └── application-form.md  phase 1 : issues du formulaire, messages
└── checklists/requirements.md
```

### Source Code (repository root)

```text
apps/web/
├── .env.example                 nom de API_URL, sans valeur
├── next.config.ts               taille admise pour la Server Action
└── src/
    ├── lib/        api.ts (nouveau), paragraphs.ts (nouveau), dates.ts, rotary-year.ts
    ├── data/       actions.ts, news.ts, members.ts, applications.ts, rotary-years.ts (nouveau)
    ├── types/      action.ts, member.ts, news.ts, application.ts
    ├── content/    actions.ts, members.ts, join.ts, common.ts (mention de liste incomplète)
    └── app/
        ├── page.tsx, _sections/ (LatestActions, LatestNews, MembersPreview, Opening)
        ├── actions/     page.tsx, loading.tsx (nouveau), _sections/ (ImpactLedger supprimé)
        ├── actualites/  page.tsx, loading.tsx (nouveau), _sections/
        ├── membres/     page.tsx, loading.tsx (nouveau), _sections/
        └── rejoindre/   _sections/ApplicationForm.tsx
```

**Structure Decision** : la structure existante de `apps/web`, inchangée. Deux fichiers nouveaux dans `lib/` et `data/`, trois squelettes d'attente, aucun dossier nouveau. La règle du dépôt est conservée : les pages ne lisent leurs données que par `src/data/*`.

## C. Décisions du 2026-10-02 sur ce plan

- **P1 — Messages du formulaire : validé.** Cinq messages d'interface propres au Front Office, qui ne modifient aucun contrat de l'API : « Le fichier est trop volumineux. » ; « Le format du CV n'est pas accepté. » ; « Trop de demandes. Veuillez réessayer plus tard. » ; « Service temporairement indisponible. Veuillez réessayer plus tard. » ; « Envoi en cours… ». Détail : [contracts/application-form.md](./contracts/application-form.md).
- **P2 — Envoi du CV : pas de repli automatique.** La Server Action reste l'architecture cible ; le passage de 5 Mo est réellement vérifié ; en cas d'échec, arrêt et signalement, sans changer d'architecture (B9).
- **P3 — `loading.tsx` : validé.** Trois fichiers, comme mécanisme technique d'attente. Ils respectent `DESIGN.md`, section 9 (squelettes aux dimensions du contenu), restent sobres, reprennent les tokens et les dimensions existants, n'introduisent ni composition éditoriale ni direction visuelle nouvelle, et ne demandent aucune modification de `DESIGN.md`.
- **P4 — SC-007 : conservé tel quel.** Le critère porte sur le retour d'interface. La spec n'est pas modifiée.
- **Récupération partiellement échouée** : comportement défini en B4.
- **`formatFullDate`** : suppression documentée en B6.

### Derniers points, tranchés le 2026-10-02

- **P5 — Phrase de liste incomplète : validée.** Texte exact : « Cette liste est incomplète pour le moment. » Une seule occurrence, dans le style de l'état existant (la mention « Contenu à venir ») ; ni compteur, ni pagination. C'est un état technique exceptionnel, pas un contenu éditorial.
- **Aide du champ CV : validée.** Texte exact : « Un fichier PDF ou Word, de 5 Mo au plus. » Elle fait partie de l'interface du formulaire.
- **Vérification du cas de liste partielle.** Relecture du code et essai d'arrêt de l'API ; les états internes du cache qui ne sont pas observables ne sont pas présentés comme vérifiés.
- **SC-013.** La spec n'est pas modifiée : « visible en 90 secondes au plus » reste le seuil de vérification, distinct de l'objectif de fraîcheur d'environ 60 secondes.

## Complexity Tracking

Aucune violation de la constitution : section sans objet.
