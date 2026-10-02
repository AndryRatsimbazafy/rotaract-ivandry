# Feature Specification: Back Office

**Feature Branch**: `008-back-office`

**Created**: 2026-10-02

**Status**: Clarifications closes le 2026-10-02 (Q1, Q2, cinq hypothèses, deux précisions) — en attente de validation avant le plan

**Input**: User description: « Feature 008 — Back Office. Construire l'interface Back Office de Rotaract Club Ivandry dans `apps/admin`. Le Back Office doit permettre à l'ADMIN de gérer les données métier déjà exposées par l'API 001–007 : authentification, années Rotary, membres et mandats, actions, actualités, candidatures, navigation et déconnexion. Ne pas refaire le design du Front Office ; ne pas réaliser la liaison API ↔ Front Office ; ne pas inventer d'endpoints ; aucune gestion de photos ; pas de tests automatisés ; pas de commit, push ni merge automatique. »

**Références** : `ARCHITECTURE.md` (sections 0, 1, 6, 7, 8, 9, 10 « Format des réponses » et « Erreurs », 11, 12, 13, 14, 15), `PROJECT_CONTEXT.md`, `CLAUDE.md`, `DESIGN.md` (pour ce qu'il **ne** régit **pas** : le Back Office), `.specify/memory/constitution.md` (principes I à XII et « Décisions ouvertes »), et les contrats de l'API :

- `specs/001-api-foundation/contracts/errors.md`
- `specs/002-rotary-years/contracts/rotary-years.md`
- `specs/003-admin-auth/contracts/auth.md`
- `specs/004-members/contracts/members.md` et `mandates.md`
- `specs/005-actions/contracts/actions.md`
- `specs/006-news/contracts/news.md`
- `specs/007-applications/contracts/applications.md`

## Contexte et périmètre

L'API expose déjà tout ce qu'un administrateur doit gérer : années Rotary, membres et mandats, actions, actualités, candidatures, derrière une connexion unique (fonctionnalités 001 à 007). `apps/admin` est encore le gabarit d'origine : aucun écran n'existe.

Cette fonctionnalité construit le **Back Office** : l'interface par laquelle l'administrateur se connecte et gère ces données. Elle regroupe, à la demande explicite du porteur du projet, les étapes 6 (« socle du Back Office ») et 7 (« écrans, ressource par ressource ») d'`ARCHITECTURE.md`, section 15. Elle précède la connexion du Front Office à l'API (étape 8), qui reste une étape distincte.

Le Back Office **n'invente rien** : chaque écran s'appuie sur une opération existante de l'API, avec ses champs, ses règles, ses codes et ses messages. Les contrats cités ci-dessus font foi ; cette spec y renvoie et ne les recopie pas.

### Dans le périmètre

1. La connexion de l'administrateur, la session, la protection de tous les écrans, la déconnexion.
2. La navigation entre les cinq domaines et l'accès à la déconnexion.
3. Les années Rotary : liste, création, suppression.
4. Les membres : liste, recherche, filtres, tri, création, modification, suppression ; leurs mandats : création, fonctions, suppression, ordre d'affichage d'une année.
5. Les actions : liste, recherche, filtres, tri, création, modification, publication et dépublication, suppression, impact, ordre manuel.
6. Les actualités : liste, recherche, filtres, tri, création, modification, publication et dépublication, suppression.
7. Les candidatures : liste, recherche, période, tri, fiche, téléchargement du CV, contact par le client de messagerie, suppression.
8. Les états d'attente, d'erreur et de liste vide, les confirmations de suppression et le retour après chaque opération.

### Hors périmètre

- Toute modification de `apps/web`, de `DESIGN.md` et la connexion du Front Office à l'API.
- Toute modification de `apps/api`. Si un écran se révèle impossible avec les opérations existantes, le besoin est **signalé** et soumis à décision ; il n'est pas résolu en modifiant l'API d'autorité.
- Toute photographie : portraits des membres, photographies des actions et des actualités. Le fournisseur des images est une décision ouverte (`ARCHITECTURE.md`, section 14) et l'API refuse ces champs.
- Toute gestion de compte : création, modification, changement de mot de passe, mot de passe oublié, second compte, autre rôle. Le compte se gère par la commande manuelle existante.
- Tout jeton de rafraîchissement et toute prolongation silencieuse de session.
- Toute modification d'une année Rotary ou d'une candidature, tout état de traitement d'une candidature : ces opérations n'existent pas dans l'API.
- Tout envoi d'email depuis le Back Office ou l'API.
- Le registre d'impact agrégé de la page Actions (décision ouverte, sans entité).
- L'aperçu d'un contenu tel que le Front Office l'affichera, et tout lien vers le Front Office : il n'est pas encore relié à l'API.
- L'anglais : l'interface est en français.
- Les tests automatisés (constitution, principe IX), Docker, CI/CD, déploiement.
- Toute donnée d'exemple : le Back Office ne crée aucun contenu fictif.

## Ce qui est déjà verrouillé

### Par ARCHITECTURE.md

| Sujet | Règle | Source |
|---|---|---|
| Intermédiaire | Le navigateur de l'administrateur ne parle qu'au Back Office ; le serveur du Back Office parle à l'API. Ni l'adresse de l'API ni le jeton n'atteignent le navigateur | 0, 11 |
| Session | Jeton rangé dans un cookie `httpOnly`, `Secure`, `SameSite=Lax`, de même durée que le jeton (8 heures au plus) ; jamais de stockage accessible au JavaScript du navigateur | 7, 11 |
| Protection | Deux niveaux : sans cookie, redirection vers la page de connexion ; puis vérification réelle auprès de l'API (`GET /auth/me`) | 11 |
| Erreurs | `401` : session effacée, retour à la connexion. `403` : page d'accès refusé. `400` avec `details` : chaque message sous son champ. `409` : message en tête de formulaire. Erreur réseau ou `5xx` : message générique, saisie conservée | 11 |
| Déconnexion | Le Back Office efface sa session ; aucune opération côté API | 6, 11 |
| Compte | Un seul compte `ADMIN`, créé par commande manuelle ; aucun écran de gestion des comptes ; pas de mot de passe oublié | 7 ; décision 5 |
| Écrans | Page de connexion ; espace protégé avec barre latérale ; accueil ; années, membres, actions, actualités, candidatures | 11 |
| Langue | Interface en français | 11 |
| Composants | MUI ; tableaux simples de MUI d'abord | 11 |
| Année d'un contenu | Jamais déduite en silence : l'année contenant la date saisie est présélectionnée de façon visible, l'administrateur peut en choisir une autre ; si la date tombe hors de l'année choisie, avertissement non bloquant | 1.4 ; décision 13 |
| Slug | Généré par l'API s'il n'est pas fourni ; modifiable à la main ; modifier le titre ne le régénère pas ; changer le slug d'un contenu publié change son adresse publique : le Back Office le signale sans l'empêcher | 8 ; décision 3 |
| Impact | Optionnel ; aucune rubrique n'est jamais estimée ni remplacée par un texte d'attente | 1.4 ; décision 12 |
| Candidature | Se consulte et se supprime, ne se modifie pas ; aucun état de traitement ; contact par `mailto:`, sans rien stocker | 1.6 ; décision 7 |
| Types | Chaque application déclare ses types ; `packages/` reste vide | 11 |

### Par les contrats 001 à 007

Les opérations, paramètres, champs, limites, codes et messages de chaque ressource ; le format d'erreur commun (`message` affichable tel quel, `details` par champ) ; la pagination `{ data, meta }` à 20 éléments par défaut et 100 au plus ; la recherche par mot entier de 2 caractères au moins ; l'ordre d'un mandat attribué par l'API à la création ; le réordonnancement indissociable d'une année ; `publishedAt` posé à la première publication et jamais réécrit ; les trois issues de la suppression d'une candidature (fichier présent, fichier déjà absent, stockage indisponible), validées contre le stockage réel le 2026-10-02.

## Points signalés avant rédaction

Trois écarts entre la demande et les documents de référence avaient été signalés. Le porteur du projet les a tranchés le 2026-10-02 (section « Clarifications »).

1. **« Protection de toutes les routes /admin ».** Les écrans du Back Office gardent les adresses d'`ARCHITECTURE.md`, section 11 : `/connexion`, puis `/annees`, `/membres`, `/actions`, `/actualites`, `/candidatures`. L'authentification protège les écrans métier ; elle n'impose pas que leurs adresses commencent par `/admin`. `/admin/*` désigne les routes de l'API.
2. **« Filtres » des candidatures.** Le contrat 007 ne prévoit qu'une recherche, une période (`from`, `to`) et un tri. Aucun filtre par situation n'est ajouté, ni dans le Back Office ni dans l'API.
3. **Spécification visuelle du Back Office.** Décision ouverte d'`ARCHITECTURE.md`, section 14 : close par Q1.

## Clarifications

### Session 2026-10-02

- **Q1 — L'orientation donnée dans la demande suffit-elle à clore la décision ouverte « Spécification visuelle du Back Office » ?** → A : Oui. L'orientation tient lieu de direction : lisibilité, densité adaptée à l'administration, formulaires clairs, tableaux et listes efficaces, états d'attente, d'erreur et de liste vide, confirmations des suppressions, retour après chaque opération, adaptation raisonnable aux écrans. Aucun document visuel distinct n'est écrit avant les écrans ; le thème (couleurs, typographie, densité) est proposé au plan et validé avec lui. `ARCHITECTURE.md`, section 14, est aligné sur cette décision avant tout code.
- **Q2 — Que saisit l'administrateur pour la date d'une actualité ?** → A : Une date et une heure, **en heure de Madagascar**. La valeur est convertie en temps universel avant l'enregistrement. À sa migration, le Front Office devra afficher cette date dans le fuseau approprié ; ce n'est pas fait par cette fonctionnalité.
- **P1 — Adresses des écrans.** Celles d'`ARCHITECTURE.md`, section 11. Protéger les écrans ne signifie pas les placer sous `/admin`.
- **P2 — Filtre par situation des candidatures.** Aucun : le contrat 007 ne le prévoit pas.
- **H1 — Ordre des mandats** : par déplacement dans la liste d'une année, enregistré d'un bloc. Validé.
- **H2 — Archives des actualités** : le filtre par année Rotary. Validé.
- **H3 — Accueil** : une page d'accès aux cinq domaines, sans statistiques. Validé.
- **H4 — Contact d'un candidat** : par le client de messagerie (`mailto:`). Validé.
- **H5 — Un seul lot** : les étapes 6 et 7 d'`ARCHITECTURE.md`, section 15, sont regroupées dans cette fonctionnalité. Validé.

## User Scenarios & Testing *(mandatory)*

Les vérifications sont manuelles (constitution, principe IX) : chaque récit dit ce que l'on fait et ce que l'on doit observer.

### User Story 1 - Se connecter et rester protégé (Priority: P1)

L'administrateur ouvre le Back Office, saisit son email et son mot de passe, et accède à l'espace d'administration. Tant qu'il n'est pas connecté, aucun écran ni aucune donnée ne lui sont montrés. Il peut se déconnecter à tout moment. Quand sa session expire, il est ramené à la connexion.

**Why this priority**: sans connexion, aucun autre écran n'est utilisable, et les données des membres et des candidats ne doivent jamais être visibles sans elle.

**Independent Test**: ouvrir un écran protégé sans être connecté, se connecter, naviguer, se déconnecter ; aucune autre ressource n'est nécessaire.

**Acceptance Scenarios**:

1. **Given** un visiteur non connecté, **When** il ouvre n'importe quel écran autre que la connexion, **Then** il est redirigé vers la page de connexion et ne voit aucune donnée.
2. **Given** la page de connexion, **When** l'administrateur saisit un email et un mot de passe corrects, **Then** il arrive sur l'accueil du Back Office.
3. **Given** la page de connexion, **When** l'email est inconnu ou le mot de passe faux, **Then** le même message « Email ou mot de passe incorrect. » s'affiche dans les deux cas et la saisie de l'email est conservée.
4. **Given** la page de connexion, **When** l'email ou le mot de passe est vide, **Then** le message de l'API s'affiche sous le champ concerné.
5. **Given** cinq tentatives dans la minute, **When** une sixième est envoyée, **Then** le message « Trop de requêtes. Réessayez plus tard. » s'affiche.
6. **Given** un administrateur connecté, **When** il choisit « Se déconnecter », **Then** sa session est effacée, il revient à la connexion, et le bouton « précédent » du navigateur ne lui rend aucun écran protégé.
7. **Given** une session expirée ou devenue invalide, **When** l'administrateur ouvre un écran ou envoie un formulaire, **Then** sa session est effacée et il est ramené à la connexion avec un message indiquant que la session a expiré.
8. **Given** une réponse « Accès refusé. » de l'API, **When** elle survient, **Then** une page d'accès refusé s'affiche, avec la possibilité de se déconnecter.
9. **Given** un administrateur déjà connecté, **When** il ouvre la page de connexion, **Then** il est conduit à l'accueil.
10. **Given** un administrateur connecté, **When** on inspecte ce que son navigateur reçoit et conserve, **Then** ni le jeton ni l'adresse de l'API n'y sont lisibles par un script.

---

### User Story 2 - Naviguer dans le Back Office (Priority: P1)

Une fois connecté, l'administrateur dispose d'une navigation permanente vers les cinq domaines et d'un accès à la déconnexion. Il sait à tout moment où il se trouve et avec quel compte.

**Why this priority**: c'est le cadre commun de tous les écrans ; il se livre avec la connexion.

**Independent Test**: connecté, parcourir les cinq entrées et revenir à l'accueil.

**Acceptance Scenarios**:

1. **Given** un administrateur connecté, **When** il regarde n'importe quel écran, **Then** il voit les entrées « Années Rotary », « Membres », « Actions », « Actualités », « Candidatures », l'entrée en cours mise en évidence, l'email du compte et « Se déconnecter ».
2. **Given** l'accueil, **When** il s'affiche, **Then** il donne accès aux cinq domaines et ne présente aucun indicateur ni chiffre fabriqué.
3. **Given** un écran étroit, **When** la navigation ne tient plus à côté du contenu, **Then** elle reste accessible par un bouton, et le contenu reste lisible.
4. **Given** une adresse inconnue dans l'espace protégé, **When** elle est ouverte, **Then** une page « introuvable » s'affiche, avec la navigation.

---

### User Story 3 - Gérer les années Rotary (Priority: P1)

L'administrateur crée les années Rotary dont les autres contenus ont besoin, les consulte et supprime celles qui ne servent pas.

**Why this priority**: un mandat, une action et une actualité exigent une année existante ; sans année, rien d'autre ne peut être créé.

**Independent Test**: créer une année, la voir dans la liste avec ses informations calculées, tenter un doublon, la supprimer.

**Acceptance Scenarios**:

1. **Given** la liste des années, **When** elle s'affiche, **Then** chaque année montre son libellé, ses dates de début et de fin et, pour l'année en cours, une mention visible ; les années vont de la plus récente à la plus ancienne. Ces informations sont celles que l'API calcule : le Back Office ne les recalcule pas.
2. **Given** aucune année, **When** la liste s'affiche, **Then** un état vide explique qu'il faut créer la première année.
3. **Given** le formulaire de création, **When** l'administrateur saisit une année de début valide, **Then** l'année est créée, apparaît dans la liste et une confirmation s'affiche.
4. **Given** une année de début hors règle, **When** le formulaire est envoyé, **Then** le message de l'API s'affiche sous le champ.
5. **Given** une année déjà existante, **When** l'administrateur tente de la recréer, **Then** le message « Cette année Rotary existe déjà. » s'affiche en tête du formulaire.
6. **Given** une année sans contenu, **When** l'administrateur confirme sa suppression, **Then** elle disparaît de la liste et une confirmation s'affiche.
7. **Given** une année référencée par un mandat, une action ou une actualité, **When** l'administrateur confirme sa suppression, **Then** l'année est conservée et un message explique qu'elle ne peut pas être supprimée tant que des mandats, des actions ou des actualités s'y rattachent.
8. **Given** la liste, **When** on la parcourt, **Then** aucune action de modification d'une année n'est proposée.

---

### User Story 4 - Gérer les membres et leurs mandats (Priority: P1)

L'administrateur tient la liste des membres du club, et pour chaque membre ses mandats : une année Rotary, zéro, une ou plusieurs fonctions. Pour chaque année, il fixe l'ordre dans lequel les membres apparaîtront.

**Why this priority**: l'annuaire est le premier contenu du site qui dépend entièrement du Back Office, et sa structure (mandat par année, plusieurs fonctions, ordre choisi par le club) est la plus délicate à saisir correctement.

**Independent Test**: avec une année existante, créer deux membres, leur donner un mandat chacun, changer les fonctions de l'un, inverser leur ordre, supprimer un mandat puis un membre.

**Acceptance Scenarios**:

1. **Given** la liste des membres, **When** elle s'affiche, **Then** elle est paginée et montre pour chaque membre son nom, son prénom, sa profession ou ses études, son email et son téléphone quand ils existent.
2. **Given** la liste, **When** l'administrateur cherche un nom ou un prénom entier, filtre par année, par fonction, ou change le tri (nom, date de création, dans les deux sens), **Then** la liste se met à jour, et la recherche, les filtres, le tri et la page sont conservés quand il revient d'une fiche.
3. **Given** une recherche d'un seul caractère, **When** elle est soumise, **Then** le message de l'API s'affiche et la liste précédente reste visible.
4. **Given** le formulaire d'un membre, **When** l'administrateur saisit un prénom et un nom, **Then** le membre est créé ; profession, email et téléphone sont facultatifs.
5. **Given** un membre existant, **When** l'administrateur vide sa profession, son email ou son téléphone et enregistre, **Then** la donnée est effacée.
6. **Given** un champ hors règle, **When** le formulaire est envoyé, **Then** chaque message de l'API s'affiche sous son champ et la saisie est conservée.
7. **Given** la fiche d'un membre, **When** elle s'affiche, **Then** elle montre tous ses mandats, de l'année la plus récente à la plus ancienne, avec leurs fonctions.
8. **Given** la fiche d'un membre, **When** l'administrateur ajoute un mandat en choisissant une année et des fonctions (aucune, une ou plusieurs), **Then** le mandat est créé et prend place à la suite des autres de l'année ; aucun ordre n'est demandé.
9. **Given** un membre qui a déjà un mandat pour une année, **When** l'administrateur tente d'en créer un second pour la même année, **Then** un message explique qu'un mandat existe déjà pour ce membre cette année-là.
10. **Given** un mandat, **When** l'administrateur modifie ses fonctions, **Then** la nouvelle liste remplace l'ancienne ; ni le membre ni l'année du mandat ne sont modifiables.
11. **Given** l'écran d'ordre d'une année, **When** l'administrateur déplace des membres et enregistre, **Then** l'ordre de toute l'année est remplacé en une seule opération et les membres sont numérotés de 1 à n.
12. **Given** l'écran d'ordre ouvert, **When** un mandat de l'année a été créé ou supprimé entre-temps, **Then** l'enregistrement est refusé, un message invite à recharger la liste, et aucun ordre n'a changé.
13. **Given** un mandat, **When** l'administrateur confirme sa suppression, **Then** il disparaît ; le membre et l'année restent.
14. **Given** un membre, **When** l'administrateur demande sa suppression, **Then** la confirmation annonce que ses mandats seront supprimés avec lui ; après confirmation, le membre et ses mandats disparaissent.
15. **Given** les formulaires des membres, **When** on les parcourt, **Then** aucun champ de portrait n'est proposé.

---

### User Story 5 - Gérer les actions (Priority: P1)

L'administrateur rédige les actions du club, les rattache à une année Rotary et à des domaines d'action, renseigne leur impact quand il existe, et décide de leur publication.

**Why this priority**: les actions sont le cœur du contenu public ; la publication et le slug engagent ce que les visiteurs verront.

**Independent Test**: avec une année existante, créer une action en brouillon, la modifier, la publier, changer son slug, la dépublier, la supprimer.

**Acceptance Scenarios**:

1. **Given** la liste des actions, **When** elle s'affiche, **Then** elle est paginée, montre brouillons et actions publiées avec leur état visible, leur titre, leur date, leur année et leur ordre quand il existe.
2. **Given** la liste, **When** l'administrateur cherche dans le titre et le résumé, filtre par année, par domaine, par état de publication, ou trie (date, titre, date de création, dans les deux sens), **Then** la liste se met à jour et ces réglages sont conservés au retour d'une fiche.
3. **Given** le formulaire de création, **When** l'administrateur saisit un titre, une date et une année, **Then** l'action est créée en brouillon ; le slug est généré par l'API et affiché une fois l'action créée.
4. **Given** une date saisie, **When** une année Rotary existante la contient, **Then** cette année est présélectionnée de façon visible, et l'administrateur peut en choisir une autre.
5. **Given** une date hors de l'année choisie, **When** le formulaire est rempli, **Then** un avertissement non bloquant le signale ; l'enregistrement reste possible et rien n'est corrigé à sa place.
6. **Given** aucune année Rotary, **When** l'administrateur ouvre la création d'une action, **Then** un message l'invite à créer d'abord une année, avec un accès à l'écran des années.
7. **Given** le formulaire, **When** l'administrateur renseigne certaines rubriques d'impact (objectif, bénéficiaires, lieu, période, partenaires, résultats), **Then** seules les rubriques renseignées sont enregistrées ; aucune rubrique vide ne reçoit de texte d'attente.
8. **Given** une action qui a un impact, **When** l'administrateur vide toutes les rubriques et enregistre, **Then** l'impact est retiré de l'action.
9. **Given** une action existante, **When** l'administrateur modifie son titre, **Then** son slug ne change pas.
10. **Given** une action publiée, **When** l'administrateur modifie son slug, **Then** un avertissement indique que son adresse publique va changer ; il peut confirmer ou renoncer.
11. **Given** un slug déjà pris, réservé ou mal formé, **When** le formulaire est envoyé, **Then** le message de l'API s'affiche (en tête pour un slug déjà pris, sous le champ sinon) et la saisie est conservée.
12. **Given** un brouillon, **When** l'administrateur le publie, **Then** son état devient « publié » et sa date de première publication s'affiche ; **When** il le dépublie puis le republie, **Then** cette date ne change pas.
13. **Given** le champ d'ordre manuel, **When** l'administrateur saisit un entier supérieur ou égal à 1 ou le vide, **Then** l'ordre est enregistré ou effacé ; deux actions peuvent porter le même ordre.
14. **Given** une action, **When** l'administrateur confirme sa suppression, **Then** elle disparaît de la liste.
15. **Given** les formulaires des actions, **When** on les parcourt, **Then** aucun champ de photographie n'est proposé.

---

### User Story 6 - Gérer les actualités (Priority: P1)

L'administrateur rédige les actualités du club, leur donne un type, une date, une année Rotary, et décide de leur publication.

**Why this priority**: même valeur que les actions pour la page Actualités ; même mécanique de publication et de slug.

**Independent Test**: avec une année existante, créer une actualité de chaque type, en publier une, filtrer par type et par année, la dépublier, la supprimer.

**Acceptance Scenarios**:

1. **Given** la liste des actualités, **When** elle s'affiche, **Then** elle est paginée, de la plus récente à la plus ancienne, avec pour chacune son état de publication, son type, son titre, sa date et son année.
2. **Given** la liste, **When** l'administrateur cherche dans le titre et le résumé, filtre par année, par type, par état de publication, ou trie (date, titre, date de création, dans les deux sens), **Then** la liste se met à jour et ces réglages sont conservés au retour d'une fiche.
3. **Given** le filtre par année, **When** l'administrateur choisit une année passée, **Then** il consulte les actualités de cette année, brouillons compris : c'est ainsi que les archives se parcourent dans le Back Office.
4. **Given** le formulaire, **When** l'administrateur choisit un type, **Then** seuls les cinq types existants sont proposés : Événement, Participation, Réunion, Formation, Annonce.
5. **Given** le formulaire de création, **When** l'administrateur saisit un titre, un type, une date et une année, **Then** l'actualité est créée en brouillon ; lieu, résumé et contenu sont facultatifs.
6. **Given** le formulaire d'une actualité, **When** l'administrateur saisit sa date, **Then** il saisit une date et une heure en heure de Madagascar, et le formulaire le dit ; **When** il rouvre l'actualité, **Then** il retrouve la date et l'heure qu'il a saisies, quel que soit le fuseau de son ordinateur.
7. **Given** une actualité datée entre minuit et 3 heures, heure de Madagascar, **When** elle est enregistrée, **Then** la liste et la fiche du Back Office affichent bien ce jour-là, et non la veille.
8. **Given** une actualité existante, **When** l'administrateur vide le lieu, le résumé ou le contenu et enregistre, **Then** la donnée est effacée.
9. **Given** l'année, le slug et la publication, **When** l'administrateur les manipule, **Then** les comportements sont ceux des actions (récit 5, scénarios 4, 5, 6, 9, 10, 11 et 12) ; l'année présélectionnée et l'avertissement d'écart se fondent sur l'instant enregistré, comparé aux dates de l'année fournies par l'API.
10. **Given** une actualité, **When** l'administrateur confirme sa suppression, **Then** elle disparaît de la liste.
11. **Given** les formulaires des actualités, **When** on les parcourt, **Then** ils ne proposent ni photographie, ni heure de fin, ni ordre manuel, ni impact, ni domaine d'action.

---

### User Story 7 - Consulter et supprimer les candidatures (Priority: P1)

L'administrateur consulte les candidatures reçues, ouvre une fiche, télécharge le CV, contacte la personne depuis son propre client de messagerie, et supprime la candidature quand il n'en a plus besoin.

**Why this priority**: les candidatures arrivent sans que personne ne puisse les lire tant que cet écran n'existe pas ; elles portent des données personnelles qui doivent pouvoir être supprimées.

**Independent Test**: avec des candidatures déposées par l'API, les lister, en chercher une, restreindre à une période, ouvrir une fiche, télécharger le CV, supprimer.

**Acceptance Scenarios**:

1. **Given** la liste des candidatures, **When** elle s'affiche, **Then** elle est paginée, la plus récente d'abord, avec pour chacune le nom, le prénom, l'email, la situation (« Étudiant » ou « Professionnel ») et la date de candidature.
2. **Given** la liste, **When** l'administrateur cherche un prénom, un nom ou un email par mot entier, restreint à une période (du, au, bornes incluses), ou trie (date de candidature, nom, dans les deux sens), **Then** la liste se met à jour et ces réglages sont conservés au retour d'une fiche.
3. **Given** une période dont le début est postérieur à la fin, **When** elle est appliquée, **Then** la liste est vide, avec l'état vide habituel.
4. **Given** une fiche, **When** elle s'affiche, **Then** elle montre le prénom, le nom, l'email, le téléphone, la situation, la date de candidature, et pour le CV son nom d'origine, son type et sa taille.
5. **Given** une fiche, **When** l'administrateur demande le CV, **Then** le fichier est téléchargé sous son nom d'origine, à l'identique de celui déposé.
6. **Given** une fiche, **When** l'administrateur choisit de contacter la personne, **Then** son client de messagerie s'ouvre sur l'email du candidat ; rien n'est envoyé ni enregistré par le Back Office.
7. **Given** une candidature dont le fichier n'existe plus au stockage, **When** l'administrateur demande le CV, **Then** un message indique que le fichier est introuvable ; la fiche reste consultable et la suppression reste possible.
8. **Given** un stockage indisponible, **When** l'administrateur demande le CV, **Then** le message « Service indisponible. » s'affiche et il peut réessayer.
9. **Given** une candidature dont le CV existe, **When** l'administrateur confirme sa suppression, **Then** elle disparaît de la liste et une confirmation s'affiche.
10. **Given** une candidature dont le fichier est déjà absent du stockage, **When** l'administrateur confirme sa suppression, **Then** elle est supprimée de la même façon, sans message d'erreur.
11. **Given** un stockage indisponible, **When** l'administrateur confirme une suppression, **Then** le message « Service indisponible. » s'affiche, la candidature est **toujours présente** dans la liste et dans sa fiche, et il peut réessayer.
12. **Given** n'importe quel écran des candidatures, **When** on inspecte ce qui est affiché et ce que le navigateur reçoit, **Then** on n'y trouve aucune adresse ni aucun identifiant de stockage, ni le nom du fournisseur.
13. **Given** les écrans des candidatures, **When** on les parcourt, **Then** ils ne proposent ni création, ni modification, ni état de traitement, ni note, ni filtre par situation.

---

### Edge Cases

- **Ressource supprimée entre-temps** : ouvrir, modifier ou supprimer une ressource qui n'existe plus affiche « Ressource introuvable. » et ramène à la liste, sans erreur technique.
- **Identifiant mal formé dans une adresse** : même traitement qu'une ressource introuvable.
- **API injoignable ou erreur interne** : un message générique s'affiche, la saisie en cours est conservée, la navigation reste utilisable ; aucun détail technique n'est montré.
- **Session expirée pendant une saisie** : l'administrateur est ramené à la connexion ; la saisie en cours est perdue, ce que le message de session expirée ne cache pas.
- **Double envoi** : pendant qu'une opération est en cours, son bouton est inactif ; un formulaire ne peut pas être envoyé deux fois.
- **Page au-delà de la dernière** (après une suppression, par exemple) : la liste revient à la dernière page existante au lieu d'afficher une page vide.
- **Liste vide** : un état vide distingue « aucun élément » de « aucun résultat pour cette recherche ou ces filtres », et propose alors de les effacer.
- **Conflit générique de l'API** : mandat en double, ordre déjà pris et année utilisée reçoivent tous le même message de l'API (« Conflit avec une ressource existante. ») ; le Back Office affiche un message propre à l'opération demandée (`PROJECT_CONTEXT.md`, « Points d'attention »).
- **Filtre par une année sans contenu** : liste vide, sans erreur.
- **Recherche par plusieurs mots** : la recherche de l'API renvoie les éléments qui contiennent l'un des mots ; le Back Office ne promet pas davantage.
- **Année comptant plus de membres qu'une page** : l'écran d'ordre montre tous les mandats de l'année ; un ordre partiel ne peut pas être enregistré.
- **CV volumineux** : le téléchargement peut prendre plusieurs secondes ; un état d'attente est visible, et un dépassement de délai du stockage reçoit le message « Service indisponible. » avec la possibilité de réessayer (constaté en 007).
- **Fuseau des actualités** : Madagascar n'a pas de changement d'heure ; l'écart avec le temps universel est constant (trois heures). Une actualité datée en début de nuit à Madagascar est enregistrée à la veille en temps universel : le Back Office affiche toujours l'heure de Madagascar.
- **Actualité en limite d'année Rotary** : les années commencent et finissent à minuit en temps universel ; une actualité datée du 1er juillet avant 3 heures, heure de Madagascar, tombe dans l'année précédente selon l'API. L'année présélectionnée suit l'API, et l'administrateur reste libre d'en choisir une autre.
- **Texte long** : description et contenu sont du texte brut, paragraphes séparés par une ligne vide ; aucune mise en forme n'est proposée.

## Requirements *(mandatory)*

### Functional Requirements

**Connexion, session et protection**

- **FR-001** : L'administrateur MUST pouvoir se connecter avec son email et son mot de passe, par l'opération de connexion existante de l'API.
- **FR-002** : La session MUST être conservée selon `ARCHITECTURE.md`, section 11 : hors de portée des scripts du navigateur, pour la durée du jeton, sans prolongation.
- **FR-003** : Tout écran autre que la connexion MUST être inaccessible sans session valide ; la validité MUST être vérifiée auprès de l'API, pas seulement par la présence de la session.
- **FR-004** : Le navigateur MUST NOT recevoir le jeton sous une forme lisible par un script, ni l'adresse de l'API, ni appeler l'API directement.
- **FR-005** : Une réponse « authentification requise » de l'API MUST effacer la session et ramener à la connexion ; une réponse « accès refusé » MUST afficher une page d'accès refusé.
- **FR-006** : L'administrateur MUST pouvoir se déconnecter depuis n'importe quel écran protégé ; la déconnexion efface la session.
- **FR-007** : Le Back Office MUST NOT proposer de création ou de modification de compte, de changement de mot de passe ni de mot de passe oublié.
- **FR-008** : Les messages de la connexion (identifiants incorrects, champ vide, trop de tentatives) MUST être ceux de l'API.

**Navigation et comportements communs**

- **FR-008b** : Les écrans MUST porter les adresses d'`ARCHITECTURE.md`, section 11 (`/connexion`, `/annees`, `/membres`, `/actions`, `/actualites`, `/candidatures`) ; aucune adresse d'écran n'est placée sous `/admin`.
- **FR-009** : L'espace protégé MUST offrir une navigation permanente vers Années Rotary, Membres, Actions, Actualités et Candidatures, indiquer l'écran en cours, le compte connecté, et donner accès à la déconnexion.
- **FR-010** : Chaque liste MUST présenter un état d'attente, un état d'erreur et un état vide ; l'état vide distingue l'absence d'élément de l'absence de résultat.
- **FR-011** : Chaque liste paginée MUST permettre de changer de page, afficher le nombre total d'éléments, et conserver recherche, filtres, tri et page au retour d'une fiche et au rechargement.
- **FR-012** : Les recherches, filtres et tris proposés MUST être exactement ceux que le contrat de la ressource prévoit, ni plus ni moins.
- **FR-013** : Chaque suppression MUST demander une confirmation qui nomme l'élément et annonce ses conséquences.
- **FR-014** : Chaque création, modification, publication, réordonnancement et suppression MUST être suivie d'un retour visible : confirmation en cas de succès, message en cas d'échec.
- **FR-015** : Une erreur de validation MUST afficher chaque message de l'API sous le champ qu'il désigne ; un conflit MUST s'afficher en tête du formulaire ; dans tous les cas d'échec, la saisie MUST être conservée.
- **FR-016** : Les messages de l'API MUST être affichés tels quels ; le Back Office ne les réécrit que pour préciser un conflit générique selon l'opération demandée.
- **FR-017** : Une erreur réseau ou interne MUST produire un message générique, sans détail technique.
- **FR-018** : Une opération en cours MUST empêcher son double envoi.
- **FR-019** : Les contrôles faits avant l'envoi MUST NOT être plus permissifs ni plus stricts que les règles de l'API ; l'API reste l'autorité, et ses refus sont toujours affichés.
- **FR-020** : L'interface MUST être en français. Les valeurs fermées (fonctions, domaines, types, situations) MUST être affichées avec les libellés d'`ARCHITECTURE.md`, section 1, jamais avec leur valeur technique.
- **FR-021** : Le Back Office MUST rester utilisable sur un écran d'ordinateur portable et lisible sur une tablette ; l'usage sur téléphone reste possible sans être optimisé.

**Années Rotary**

- **FR-022** : L'administrateur MUST pouvoir lister les années, avec le libellé, les dates et la mention d'année en cours fournis par l'API.
- **FR-023** : Il MUST pouvoir créer une année à partir de sa seule année de début, et la supprimer.
- **FR-024** : Le refus d'un doublon et le refus de supprimer une année utilisée MUST être expliqués ; l'année refusée à la suppression est conservée.
- **FR-025** : Aucune modification d'une année MUST NOT être proposée.

**Membres et mandats**

- **FR-026** : L'administrateur MUST pouvoir lister, chercher, filtrer (année, fonction), trier, créer, modifier et supprimer les membres, avec les champs du contrat : prénom, nom, profession ou études, email, téléphone.
- **FR-027** : Il MUST pouvoir effacer la profession, l'email et le téléphone d'un membre.
- **FR-028** : La fiche d'un membre MUST montrer tous ses mandats.
- **FR-029** : Il MUST pouvoir créer un mandat (membre, année, zéro à plusieurs fonctions), modifier ses fonctions et le supprimer. L'ordre MUST NOT être demandé à la création.
- **FR-030** : Les fonctions proposées MUST être les dix fonctions du club, sans doublon possible dans un mandat.
- **FR-031** : Il MUST pouvoir fixer l'ordre d'affichage des membres d'une année ; l'enregistrement remplace l'ordre de toute l'année en une seule opération.
- **FR-032** : La suppression d'un membre MUST annoncer la suppression de ses mandats.
- **FR-033** : Aucun champ de portrait MUST NOT être proposé.

**Actions**

- **FR-034** : L'administrateur MUST pouvoir lister, chercher, filtrer (année, domaine, publication), trier, créer, modifier et supprimer les actions, avec les champs du contrat : titre, slug, résumé, description, date, année Rotary, domaines, impact, publication, ordre.
- **FR-035** : L'année Rotary MUST être présélectionnée de façon visible à partir de la date, rester modifiable, et un écart entre la date et l'année choisie MUST être signalé sans bloquer.
- **FR-036** : Le slug MUST pouvoir être laissé à la génération de l'API ou saisi ; il MUST NOT être modifié par le Back Office quand le titre change.
- **FR-037** : La modification du slug d'un contenu publié MUST être précédée d'un avertissement sur le changement de son adresse publique.
- **FR-038** : L'administrateur MUST pouvoir publier et dépublier ; l'état et la date de première publication MUST être visibles.
- **FR-039** : L'impact MUST être facultatif, rubrique par rubrique ; le Back Office MUST NOT enregistrer de rubrique vide ni de texte d'attente, et MUST permettre de retirer l'impact entier.
- **FR-040** : L'ordre manuel MUST pouvoir être saisi et effacé.
- **FR-041** : Aucun champ de photographie MUST NOT être proposé.

**Actualités**

- **FR-042** : L'administrateur MUST pouvoir lister, chercher, filtrer (année, type, publication), trier, créer, modifier et supprimer les actualités, avec les champs du contrat : titre, slug, type, date, année Rotary, lieu, résumé, contenu, publication.
- **FR-043** : Les types proposés MUST être les cinq types existants.
- **FR-044** : FR-035 à FR-038 s'appliquent aux actualités à l'identique.
- **FR-045** : Il MUST pouvoir effacer le lieu, le résumé et le contenu.
- **FR-046** : La date d'une actualité MUST être saisie comme une date et une heure en heure de Madagascar, annoncée comme telle, et convertie en temps universel avant l'enregistrement. Le Back Office MUST l'afficher en heure de Madagascar, dans les listes comme dans les fiches, indépendamment du fuseau de l'ordinateur de l'administrateur.
- **FR-047** : Aucun champ de photographie, d'ordre, d'impact ni de domaine MUST NOT être proposé.

**Candidatures**

- **FR-048** : L'administrateur MUST pouvoir lister, chercher, restreindre à une période et trier les candidatures, selon le contrat 007.
- **FR-049** : Il MUST pouvoir ouvrir une fiche, télécharger le CV sous son nom d'origine, et ouvrir son client de messagerie sur l'email du candidat.
- **FR-050** : Il MUST pouvoir supprimer une candidature. Les trois issues MUST être rendues ainsi : fichier présent ou déjà absent — candidature retirée, confirmation ; stockage indisponible — message « Service indisponible. », candidature toujours affichée, nouvel essai possible.
- **FR-051** : Un CV introuvable ou un stockage indisponible au téléchargement MUST produire un message, sans rendre la fiche inutilisable.
- **FR-052** : Aucune adresse de stockage, aucun identifiant de stockage ni le nom du fournisseur MUST NOT apparaître à l'écran ni dans ce que le navigateur reçoit.
- **FR-053** : Aucune création, modification, état de traitement, note ni filtre par situation MUST NOT être proposé ; aucun filtre par situation MUST NOT être demandé à l'API.
- **FR-054** : Les données des candidats MUST NOT être conservées par le Back Office hors de l'affichage : ni copie, ni cache durable, ni journal.

**Aspect**

- **FR-055** : L'aspect du Back Office MUST suivre la direction validée en Q1 : lisibilité, densité adaptée à l'administration, formulaires clairs, tableaux et listes efficaces. Un seul thème MUST s'appliquer à tous les écrans. Il MUST NOT reprendre le système visuel éditorial du Front Office (`DESIGN.md`), qui ne régit pas le Back Office.

**Limites**

- **FR-056** : Le Back Office MUST NOT appeler d'opération qui n'existe pas dans les contrats 001 à 007, ni exiger une modification de l'API sans qu'elle ait été signalée et décidée.
- **FR-057** : Cette fonctionnalité MUST NOT modifier `apps/web`, `DESIGN.md` ni le comportement de l'API.

### Key Entities

Aucune entité nouvelle. Le Back Office manipule celles d'`ARCHITECTURE.md`, section 1, dans leur forme d'administration :

- **Session d'administration** : le fait d'être connecté, pour 8 heures au plus ; elle porte le compte (email, rôle). Rien d'autre n'est conservé par le Back Office.
- **Année Rotary** : année de début ; libellé, dates et « en cours » fournis par l'API.
- **Membre** : prénom, nom, profession ou études, email, téléphone.
- **Mandat** : un membre, une année, zéro à plusieurs fonctions, un ordre dans l'année.
- **Action** : titre, slug, résumé, description, date, année, domaines, impact facultatif, publication, ordre facultatif.
- **Actualité** : titre, slug, type, date, année, lieu, résumé, contenu, publication.
- **Candidature** : prénom, nom, email, téléphone, situation, CV (nom, type, taille), date. Lecture et suppression seulement.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** : Sans être connecté, 100 % des écrans autres que la connexion redirigent vers la connexion et ne montrent aucune donnée.
- **SC-002** : L'administrateur se connecte et atteint n'importe lequel des cinq domaines en moins de 30 secondes.
- **SC-003** : En partant d'une base vide, l'administrateur crée une année, un membre avec son mandat, une action publiée et une actualité publiée en moins de 10 minutes, sans consulter de documentation.
- **SC-004** : 100 % des opérations d'administration des contrats 002 à 007 sont réalisables depuis le Back Office, et aucune opération absente de ces contrats n'y est proposée.
- **SC-005** : 100 % des refus de l'API (validation, conflit, ressource introuvable, service indisponible) produisent un message en français à l'écran ; aucun ne produit d'écran d'erreur technique ni ne fait perdre la saisie.
- **SC-006** : Après chaque création, modification ou suppression, l'administrateur voit le résultat dans la liste sans recharger la page lui-même.
- **SC-007** : Aucune suppression ne s'exécute sans confirmation.
- **SC-008** : Réordonner les membres d'une année de 20 personnes prend moins de 2 minutes.
- **SC-009** : Le CV téléchargé est identique au fichier déposé, dans 100 % des cas où le stockage répond.
- **SC-010** : Aucun écran ni aucune réponse reçue par le navigateur ne contient le jeton sous forme lisible par un script, l'adresse de l'API, une adresse ou un identifiant de stockage.
- **SC-011** : Les trois issues de la suppression d'une candidature sont observées à l'écran conformément à FR-050.
- **SC-012** : Le Front Office, `DESIGN.md` et les réponses de l'API sont inchangés à la fin de la fonctionnalité.

## Assumptions

Les cinq premières ont été validées par le porteur du projet le 2026-10-02 (H1 à H5).

- **Un seul lot (H5).** La connexion, la navigation et les cinq domaines sont livrés par cette fonctionnalité ; les récits restent vérifiables un par un, dans l'ordre 1 à 7.
- **Accueil (H3).** Une page d'accès aux cinq domaines, sans tableau de bord ni chiffre.
- **Ordre des mandats (H1).** L'ordre d'une année se règle par déplacement dans la liste de l'année, enregistré par le réordonnancement d'ensemble. La modification isolée de l'ordre d'un seul mandat, que l'API permet, n'est pas proposée.
- **Archives des actualités (H2).** La consultation par année Rotary au moyen du filtre d'année. La lecture publique des archives, qui ne compte que les actualités publiées, n'est pas un écran d'administration.
- **Contact d'un candidat (H4).** Par le client de messagerie de l'administrateur.
- **Noms dans l'écran d'ordre.** Un mandat ne porte que l'identifiant de son membre ; l'écran d'ordre obtient les noms par la liste des membres de l'année. Les deux lectures existent ; la façon de les combiner relève du plan.
- **Date des actions.** Une action porte une date sans heure, affichée telle qu'elle est enregistrée (temps universel), comme le Front Office l'affiche aujourd'hui. Q2 ne concerne que les actualités.
- **Autres dates** (création, première publication, candidature) : affichées en heure de Madagascar, celle de l'administrateur.
- **Front Office et fuseau.** Le Front Office affiche aujourd'hui les dates en temps universel. À sa migration vers l'API, il devra afficher la date des actualités dans le fuseau approprié ; c'est un sujet de cette migration, consigné ici et non traité.
- **Actualités déjà enregistrées.** La base ne contient aucune actualité réelle ; aucune reprise de dates n'est à prévoir.
- **Téléchargement du CV.** Le fichier transite par le serveur du Back Office, comme toute autre lecture. Une limite de taille de réponse chez un futur hébergeur relève du déploiement, hors périmètre ; elle est à garder en tête au plan.
- **Dépendances.** L'ajout de MUI et de ses compagnons est celui que prévoit `ARCHITECTURE.md`, section 11 ; toute autre dépendance devra être justifiée au plan.
- **Environnement.** Le Back Office a besoin de l'adresse de l'API, côté serveur seulement (`ARCHITECTURE.md`, section 12) ; l'API et sa base sont disponibles pendant la vérification.
- **Documents à aligner.** `ARCHITECTURE.md` est aligné avant tout code : section 14 (la décision ouverte sur l'aspect du Back Office devient une décision prise) et, pour Q2, la saisie des actualités en heure de Madagascar. `PROJECT_CONTEXT.md` et `CLAUDE.md` sont mis à jour quand le Back Office existe.
- **Utilisateur.** Un seul administrateur à la fois ; aucun verrouillage ni détection de modification concurrente n'est prévu.
