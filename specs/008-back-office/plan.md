# Implementation Plan: Back Office

**Branch**: `008-back-office` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-back-office/spec.md`

## Summary

Construire dans `apps/admin` l'interface par laquelle l'administrateur se connecte et gère les années Rotary, les membres et leurs mandats, les actions, les actualités et les candidatures, en s'appuyant exclusivement sur les opérations existantes de l'API (contrats 001 à 007).

Approche : celle d'`ARCHITECTURE.md`, section 11, sans variante. Le serveur Next.js de `apps/admin` est l'intermédiaire unique : lectures dans des Server Components, écritures par Server Actions, jeton dans un cookie `httpOnly`. Un client d'API côté serveur porte l'adresse, le jeton et la conversion des erreurs. L'état des listes (recherche, filtres, tri, page) vit dans l'adresse. Les écrans sont composés avec MUI et un seul thème. Aucune bibliothèque de formulaires, de dates, d'état ni de glisser-déposer : les mécanismes de React 19, de Next.js 16 et de la plateforme (`Intl`, `<input type="datetime-local">`) suffisent.

`apps/api`, `apps/web` et `DESIGN.md` ne sont pas modifiés.

## Technical Context

**Language/Version** : TypeScript 5 (strict), Node.js 22. Next.js 16.3.8 (App Router), React 19.2.8 — déjà installés dans `apps/admin`.

**Primary Dependencies** : à installer dans `apps/admin` seulement, par une commande lancée depuis la racine (`npm install … --workspace=admin`) — les cinq paquets prévus par `ARCHITECTURE.md`, section 11 : `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/material-nextjs`, `@mui/icons-material` (versions 9.4 pour MUI, compatibles Next 16 et React 19 ; Emotion 11). **Aucune autre dépendance** (research, R2) — à l'implémentation, `@emotion/cache` a dû être déclarée en plus : voir la section D.

**Storage** : aucun. Le Back Office ne conserve qu'un cookie de session. Les données viennent de l'API.

**Testing** : aucun test automatisé (constitution, principe IX). Vérification manuelle structurée dans [quickstart.md](./quickstart.md), plus `npm run lint` et `npm run build:admin`.

**Target Platform** : serveur Node.js 22 en local, port 3001 ; navigateurs récents. Hébergement hors périmètre.

**Project Type** : application web (Next.js) dans un monorepo npm workspaces, cliente d'une API HTTP existante.

**Performance Goals** : aucun objectif chiffré. Un administrateur à la fois, quelques dizaines à quelques centaines d'éléments par ressource.

**Constraints** : aucun appel du navigateur vers l'API ; ni jeton ni adresse de l'API dans le navigateur ; aucune référence de stockage à l'écran ; interface en français ; heure de Madagascar pour les actualités ; aucune modification de l'API.

**Scale/Scope** : 15 écrans, 2 gestionnaires de route, 6 domaines (connexion comprise), 29 opérations d'API consommées ([contracts/api-usage.md](./contracts/api-usage.md)).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification | État |
|---|---|---|
| I. Source de vérité | Structure, session, protection et erreurs reprises d'`ARCHITECTURE.md`, section 11. Les deux décisions closes par la spec (aspect, dates) ont été reportées dans `ARCHITECTURE.md` **avant** ce plan (section A). Aucune opération hors contrats. | Conforme |
| II. Étapes validées | Spec validée le 2026-10-02. Ce plan s'arrête après la phase 1 : ni tâches ni code. | Conforme |
| III. Préférence pour le manuel | Aucun script. `.env.local` de `apps/admin` est créé à la main par le porteur du projet. | Conforme |
| IV. Simplicité technique | Mécanismes natifs de Next.js 16 et React 19 (Server Actions, `useActionState`, `searchParams`, `loading.tsx`, `error.tsx`) ; `Intl` pour les dates ; boutons « monter / descendre » pour l'ordre. Cinq dépendances, toutes prévues par l'architecture. Pas de composant générique de liste ni de formulaire (R9). | Conforme |
| V. Architecture backend | Non modifiée. Seules les routes `/admin/*` et `/auth/*` existantes sont appelées, avec le jeton. | Conforme |
| VI. Intégrité du modèle métier | Mandat séparé du membre, plusieurs fonctions par mandat, année explicite et jamais déduite en silence, candidature sans état : les écrans suivent ces règles. | Conforme |
| VII. Front Office | Non touché. | Conforme |
| VIII. Qualité et contenu | Aucun contenu fictif, aucun chiffre sur l'accueil, aucun texte d'attente dans l'impact. | Conforme |
| IX. Tests | Aucun test, aucun outillage de test. | Conforme |
| X. Outillage et infrastructure | npm ; installation dans `apps/admin`, `node_modules` par application conservé ; ni Docker, ni CI/CD, ni déploiement. | Conforme |
| XI. Git et collaboration | Branche créée à la demande du porteur du projet. Aucun commit ni push sans demande. | Conforme |
| XII. Non-régression | `apps/web`, `apps/api` et `DESIGN.md` inchangés ; builds des trois applications revérifiés. | Conforme |

**Résultat de la porte** : passée. Aucune violation à justifier.

**Re-vérification après la phase 1** : inchangée. Les précisions P1 à P3 ont été validées le 2026-10-02 (section C).

**Remarque sur la constitution.** Sa section « Décisions ouvertes » cite encore « spécification visuelle du Back Office ». Elle énumère ce qu'`ARCHITECTURE.md` marquait ouvert à sa date ; elle n'est pas modifiée ici (un amendement passe par `/speckit-constitution`). Ce n'est pas une contradiction de règle : la décision appartient à `ARCHITECTURE.md`, section 14, où elle est désormais prise.

## A. Alignements d'ARCHITECTURE.md

**Appliqués le 2026-10-02, avant ce plan**, à la demande du porteur du projet. Aucune autre décision n'a changé.

| # | Section | Changement |
|---|---|---|
| 1 | 1.5, champ `date` | Ajout : « Enregistrée en temps universel ; saisie dans le Back Office en heure de Madagascar (voir 11). » |
| 2 | 10, « Écarts à traiter lors de la migration » | « Deux décisions » devient « Trois » ; ajout du point 3, « Fuseau des actualités » : le Front Office affichera cette date dans le fuseau approprié à sa migration. |
| 3 | 11, « Principe » | Ajout de la puce « Dates et fuseau » : saisie des actualités en heure de Madagascar, conversion en temps universel avant l'envoi ; affichage en heure de Madagascar de la date des actualités et des dates de création, de première publication et de candidature ; date d'une action sans heure ; API et contrats inchangés. |
| 4 | 11, dernier paragraphe | « La spécification visuelle du Back Office reste à écrire » est remplacé par le paragraphe « Aspect » : direction fonctionnelle, distincte de `DESIGN.md`, un seul thème MUI, détails renvoyés à ce plan. |
| 5 | 14, « Verrouillées » | Ajout des décisions 18 (« Aspect du Back Office ») et 19 (« Dates du Back Office »). |
| 6 | 14, « Encore ouvertes » | Retrait de la ligne « Spécification visuelle du Back Office ». |

Restent à faire **en fin d'implémentation**, quand le Back Office existe : l'en-tête d'`ARCHITECTURE.md` et le titre « Structure prévue (non créée) » de la section 11, `PROJECT_CONTEXT.md` (dont la ligne « Autres points repoussés », qui cite encore la spécification visuelle) et la ligne d'état de `CLAUDE.md`.

## B. Conception

### B1. Adresses et écrans

Adresses d'`ARCHITECTURE.md`, section 11 ; aucune sous `/admin`. Détail dans [contracts/screens.md](./contracts/screens.md).

| Adresse | Nature | Contenu |
|---|---|---|
| `/connexion` | écran public | Formulaire de connexion |
| `/` | écran protégé | Accueil : accès aux cinq domaines |
| `/annees` | écran protégé | Liste, création (dialogue), suppression |
| `/membres` | écran protégé | Liste paginée |
| `/membres/nouveau` | écran protégé | Création |
| `/membres/[id]` | écran protégé | Fiche : modification, mandats |
| `/membres/ordre` | écran protégé | Ordre d'une année (`?annee=`) |
| `/actions`, `/actions/nouvelle`, `/actions/[id]` | écrans protégés | Liste, création, modification |
| `/actualites`, `/actualites/nouvelle`, `/actualites/[id]` | écrans protégés | Liste, création, modification |
| `/candidatures`, `/candidatures/[id]` | écrans protégés | Liste, fiche |
| `/candidatures/[id]/cv` | gestionnaire de route protégé | Renvoie le fichier |
| `/session/fin` | gestionnaire de route | Efface le cookie, redirige vers `/connexion` |
| `/acces-refuse` | écran | Page du `403` |

### B2. Session et protection (FR-001 à FR-008b)

- **Connexion** : Server Action → `POST /auth/login` → cookie `rci_admin_session` : `httpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age` = `expiresIn` reçu. `Secure` : voir section C, P1.
- **Niveau 1 — `src/proxy.ts`** : sans cookie, toute adresse autre que `/connexion` et les fichiers statiques est redirigée vers `/connexion` ; avec cookie, `/connexion` est redirigée vers `/`. Aucun appel à l'API ici (R3).
- **Niveau 2 — layout de `(admin)`** : appelle `GET /auth/me` ; le compte obtenu alimente la barre de navigation.
- **Niveau 3 — chaque appel** : le client d'API traite `401` et `403` partout (B3) ; l'API reste l'autorité à chaque lecture et à chaque écriture, y compris après une navigation côté client où le layout n'est pas réexécuté.
- **Effacement du cookie** : Next.js interdit de modifier un cookie pendant le rendu d'un Server Component. Sur un `401` reçu en lecture, le serveur redirige vers `/session/fin?motif=expiree`, gestionnaire de route qui efface le cookie puis redirige vers `/connexion?motif=expiree`. Dans une Server Action, le cookie est effacé directement, puis la redirection a lieu.
- **Déconnexion** : Server Action, depuis la barre de navigation : efface le cookie, redirige vers `/connexion`. Les écrans protégés sont rendus à la demande (lecture du cookie) et servis sans cache : le bouton « précédent » ne rend rien.
- `403` : redirection vers `/acces-refuse`. La convention `forbidden()` de Next.js est expérimentale : elle n'est pas utilisée (R3).

### B3. Client d'API et erreurs (FR-015 à FR-017, FR-056)

`src/lib/api.ts`, côté serveur uniquement : lit le cookie, appelle `API_URL`, `cache: 'no-store'`, délai de 15 secondes. Une seule forme d'erreur, `ApiError` (`status`, `message`, `details?`).

| Réponse | Lecture (Server Component) | Écriture (Server Action) |
|---|---|---|
| `401` | redirection vers `/session/fin?motif=expiree` | cookie effacé, redirection vers `/connexion?motif=expiree` |
| `403` | redirection vers `/acces-refuse` | idem |
| `404`, ou `400` « Identifiant invalide. » sur une adresse | `notFound()` : page « introuvable » dans l'espace protégé | retour à la liste avec l'avis « Ressource introuvable. » |
| `400` avec `details` | paramètres de liste : message affiché au-dessus de la liste, liste précédente inchangée | chaque message sous son champ ; saisie conservée |
| `409` | — | message en tête de formulaire, précisé selon l'opération (table ci-dessous) ; saisie conservée |
| `429` | — | message de l'API (connexion) |
| `503` | message de l'API, possibilité de réessayer | message de l'API ; l'élément reste affiché |
| réseau, délai, `5xx` | `error.tsx` : message générique, bouton « Réessayer » | message générique en tête ; saisie conservée |

Message du `409` selon l'opération (le message de l'API est générique, sauf pour le doublon d'année) :

| Opération | Message affiché |
|---|---|
| Création d'une année | celui de l'API : « Cette année Rotary existe déjà. » |
| Suppression d'une année | « Cette année ne peut pas être supprimée : des mandats, des actions ou des actualités s'y rattachent. » |
| Création d'un mandat | « Ce membre a déjà un mandat pour cette année. » |
| Création ou modification d'une action ou d'une actualité | « Ce slug est déjà utilisé. » |

Ces trois messages sont nouveaux et propres au Back Office : section C, P3.

### B4. Listes (FR-010 à FR-012)

- L'état d'une liste est dans l'adresse : `?q=&annee=&…&tri=&page=`. La page (Server Component) lit `searchParams`, appelle l'API, rend le tableau. Rechargement, retour arrière et retour d'une fiche conservent donc l'état sans mécanisme supplémentaire ; le lien « retour » d'une fiche reprend l'adresse de la liste d'origine.
- La barre de recherche et de filtres est un Client Component qui met à jour l'adresse ; un changement de recherche ou de filtre remet `page` à 1.
- Tri : en-têtes de colonnes cliquables pour les seuls champs que le contrat autorise.
- Pagination : `TablePagination` de MUI, 20 par page (défaut de l'API), total affiché. Une page au-delà de la dernière est ramenée à la dernière.
- Attente : `loading.tsx` par segment (squelette du tableau). Erreur : `error.tsx`. Vide : deux textes, « aucun élément » avec l'action de création, et « aucun résultat » avec « Effacer les filtres ».
- Paramètres des contrats, sans ajout : [contracts/api-usage.md](./contracts/api-usage.md).

### B5. Formulaires et validations (FR-013 à FR-019)

- `useActionState` de React 19 : la Server Action renvoie `{ message?, fieldErrors?, values }`. Les valeurs saisies sont renvoyées et réaffichées en cas d'échec. Le bouton est inactif tant que l'action est en cours (`pending`).
- Contrôles avant l'envoi : uniquement les attributs natifs qui reproduisent exactement les règles de l'API (`required`, `maxLength`, `min`, `max`, `type`). Aucune règle n'est réécrite ; l'API tranche et ses messages sont affichés sous le champ (`helperText`, `aria-describedby`).
- Champs facultatifs : vides à la création, ils ne sont pas envoyés ; vidés en modification, ils sont envoyés à `null` (jamais de chaîne vide).
- Slug : envoyé seulement s'il est saisi (création) ou s'il a changé (modification).
- Succès : `revalidatePath` de la liste, puis redirection vers la liste avec un avis (`?avis=cree|modifie|supprime|publie|depublie|ordre`), rendu en `Snackbar` par un Client Component qui retire ensuite le paramètre. Les codes d'avis sont une liste fermée : aucun texte libre ne passe par l'adresse.
- Suppression : dialogue de confirmation qui nomme l'élément et annonce la conséquence (mandats supprimés avec le membre ; CV supprimé avec la candidature).

### B6. Années Rotary (FR-022 à FR-025)

Tableau : libellé, début, fin, mention « En cours » (valeurs de l'API). Création dans un dialogue à un seul champ numérique. Suppression confirmée. Aucune modification.

### B7. Membres et mandats (FR-026 à FR-033)

- Liste : nom, prénom, profession ou études, email, téléphone ; recherche, filtres année et fonction, tri `lastName` et `createdAt` dans les deux sens.
- Fiche `/membres/[id]` : formulaire du membre, puis section « Mandats » (lecture par `GET /admin/members/:id`) : ajout d'un mandat (année, fonctions par cases à cocher, zéro à dix), modification des fonctions, suppression. L'ordre n'est ni demandé ni modifiable ici.
- Ordre `/membres/ordre?annee=<label>` : `GET /admin/mandates?year=` donne les mandats dans l'ordre ; `GET /admin/members?year=&limit=100`, page après page, donne les noms. Chaque ligne porte deux boutons, « Monter » et « Descendre » (accessibles au clavier, sans dépendance). « Enregistrer l'ordre » envoie `PUT /admin/mandates/order` avec tous les identifiants. Un `400` sur `mandateIds` (liste devenue incomplète) affiche « La liste a changé. Rechargez-la avant d'enregistrer l'ordre. » et propose de recharger.
- Avertissement de sortie si l'ordre a été modifié sans être enregistré.

### B8. Actions et actualités (FR-034 à FR-047)

Un formulaire par ressource, utilisé en création et en modification.

- **Année Rotary** : liste déroulante des années de l'API. À la saisie de la date, l'année dont l'intervalle `startDate`–`endDate` contient l'instant est présélectionnée, avec la mention « Année proposée d'après la date » ; un choix manuel n'est plus écrasé ensuite. Si l'instant est hors de l'année choisie : alerte d'avertissement, non bloquante. Aucune année existante : alerte et lien vers `/annees`, formulaire inactif.
- **Slug** : champ facultatif, avec l'aide « Laissé vide, il est généré à partir du titre ». En modification, il affiche le slug existant ; il n'est jamais recalculé par le Back Office.
- **Changement de slug d'un contenu publié** : à l'envoi, si le contenu est publié et que le slug diffère du slug d'origine, un dialogue annonce « L'adresse publique de ce contenu va changer » ; « Confirmer » envoie, « Annuler » revient au formulaire.
- **Publication** : interrupteur « Publié » dans le formulaire, et action « Publier » / « Dépublier » depuis la liste (`PATCH { isPublished }`). État en pastille dans la liste ; « Première publication le … » dans la fiche quand `publishedAt` existe.
- **Actions** : date sans heure (`<input type="date">`, envoyée `AAAA-MM-JJ`) ; domaines par cases à cocher ; six rubriques d'impact, les partenaires un par ligne ; ordre manuel facultatif. Seules les rubriques renseignées sont envoyées ; toutes vides en modification : `impact: null`.
- **Actualités** : type (cinq valeurs) ; date et heure (B9) ; lieu, résumé, contenu.
- Description et contenu : zone de texte brut, avec l'aide « Séparez les paragraphes par une ligne vide ».

### B9. Dates et fuseau (FR-046, décision 19)

`src/lib/dates.ts`, fonctions pures, sans dépendance, **exécutées sur le serveur seulement** : c'est l'unique endroit où le fuseau (`Indian/Antananarivo`) et son décalage (+03:00, constant : Madagascar n'a pas de changement d'heure) sont définis. Les Server Actions, les pages et le gestionnaire de période des candidatures appellent ses fonctions ; aucun autre fichier n'écrit de décalage ni d'identifiant de fuseau. Les Client Components reçoivent des chaînes déjà formatées.

Fonctions prévues : heure de Madagascar saisie → instant UTC ; instant UTC → valeur du champ de saisie ; instant → texte (date, ou date et heure) ; date sans heure → texte ; jour de Madagascar → bornes de début et de fin en UTC.

| Besoin | Règle |
|---|---|
| Saisie d'une actualité | `<input type="datetime-local">`, libellé « Date et heure (heure de Madagascar) ». La valeur `AAAA-MM-JJTHH:mm` est convertie **sur le serveur** par l'utilitaire, puis envoyée à l'API en ISO 8601 UTC. Le fuseau de l'ordinateur n'intervient jamais. |
| Réouverture d'une actualité | L'instant reçu est converti sur le serveur en heure murale de Madagascar pour préremplir le champ. |
| Affichage d'un instant (date d'une actualité, création, première publication, candidature) | `Intl.DateTimeFormat` en français, dans le fuseau de l'utilitaire, formaté sur le serveur. |
| Date d'une action | Date sans heure, formatée avec `timeZone: 'UTC'` : le jour enregistré. |
| Dates de début et de fin d'une année Rotary | Formatées avec `timeZone: 'UTC'` : 1er juillet et 30 juin, tels que l'API les définit. |
| Période des candidatures | « Du » et « Au » sont des jours de Madagascar : convertis par l'utilitaire en bornes UTC (`from` = début du jour, `to` = fin du jour, à Madagascar), pour que le filtre corresponde aux dates affichées. Le contrat accepte toute date ISO 8601. |

### B10. Candidatures (FR-048 à FR-054)

- Liste : nom, prénom, email, situation (« Étudiant », « Professionnel »), date de candidature ; recherche, période, tri `createdAt` et `lastName` dans les deux sens. Aucun filtre par situation.
- Fiche : champs, CV (nom, type lisible, taille en Ko ou Mo), « Télécharger le CV », « Contacter par email » (`mailto:`), « Supprimer ».
- **CV** : lien vers `/candidatures/[id]/cv`. Ce gestionnaire de route lit le cookie, appelle `GET /admin/applications/:id/cv` et renvoie le flux avec les en-têtes de l'API (`Content-Type`, `Content-Length`, `Content-Disposition`, `Cache-Control: no-store`), sans en ajouter. En cas d'échec il redirige vers la fiche avec `?cv=introuvable` (`404`) ou `?cv=indisponible` (`503`, délai), où une alerte s'affiche. L'adresse de téléchargement est celle du Back Office : aucune adresse ni identifiant de stockage n'existe côté navigateur, l'API n'en fournissant aucun.
- **Suppression** : `204` → retour à la liste, avis « Candidature supprimée » (fichier présent ou déjà absent : même issue pour l'administrateur) ; `503` → alerte « Service indisponible. » sur la fiche, candidature conservée, nouvel essai possible ; `404` → retour à la liste, « Ressource introuvable. ».
- Aucune donnée de candidat n'est mise en cache ni journalisée : lectures en `no-store`, aucun `console.log` de réponse.

### B11. Thème et aspect (FR-055, décision 18)

Un seul thème, `src/theme/theme.ts`, clair uniquement.

| Sujet | Choix |
|---|---|
| Couleur principale | Bleu royal du club, `#17458f` ; texte `#0f1c36` ; fond de page `#f3f6f9`, surfaces blanches |
| Couleur secondaire | Canneberge `#d41367`, réservée à de rares accents (jamais pour une erreur) |
| États | Erreur `#b3261e`, succès `#0b6b34`, avertissement `#7a4a00` |
| Typographie | Open Sans (`next/font/google`, comme `apps/web`), 14 px de base dans les tableaux et formulaires. Ni Georgia ni l'échelle typographique éditoriale de `DESIGN.md`. Les polices Geist du gabarit sont retirées. |
| Densité | Tableaux `size="small"`, champs `size="small"`, boutons de taille moyenne |
| Formes | Rayon 6 px, élévation minimale (bordures plutôt qu'ombres) |
| Formulaires | Une colonne, 720 px au plus, libellés au-dessus, aide et erreur sous le champ, actions en bas à gauche |
| Icônes | `@mui/icons-material`, toujours accompagnées d'un libellé ou d'un `aria-label` |

Les valeurs de couleur sont recopiées dans le thème : rien n'est importé de `apps/web`.

### B12. Mise en page, écrans étroits, accessibilité (FR-009, FR-021)

- Barre latérale permanente de 240 px à partir de 900 px de large ; en dessous, tiroir ouvert par un bouton dans la barre supérieure. Barre supérieure : titre de l'écran, email du compte, « Se déconnecter ».
- Tableaux : défilement horizontal dans leur conteneur sous 900 px ; les colonnes secondaires (email, téléphone, date de création) sont masquées sous 600 px, la fiche les donnant. Formulaires en une colonne à toutes les largeurs.
- Accessibilité : composants MUI avec leurs rôles ; un `h1` par écran ; lien d'évitement vers le contenu ; libellés associés aux champs ; erreurs reliées par `aria-describedby` ; avis en `role="status"`, erreurs en `role="alert"` ; focus renvoyé au premier champ en erreur ; dialogues avec piège de focus (MUI) ; contrastes AA avec les couleurs ci-dessus ; tout est utilisable au clavier, y compris l'ordre des mandats.

## Project Structure

### Documentation (this feature)

```text
specs/008-back-office/
├── plan.md              ce fichier
├── research.md          phase 0
├── data-model.md        phase 1 : formes d'administration, session, états d'écran
├── quickstart.md        phase 1 : vérification manuelle
├── contracts/
│   ├── screens.md       phase 1 : adresses, écrans, avis, messages
│   └── api-usage.md     phase 1 : opérations de l'API consommées, écran par écran
└── checklists/requirements.md
```

### Source Code (repository root)

```text
apps/admin/
├── .env.example                 nom de API_URL, sans valeur (exception ajoutée à .gitignore)
├── package.json                 cinq dépendances ajoutées
└── src/
    ├── proxy.ts                 redirection sans cookie
    ├── app/
    │   ├── layout.tsx           html, police, fournisseur de thème MUI
    │   ├── globals.css          réduit au strict nécessaire (page.module.css du gabarit supprimé)
    │   ├── connexion/           page.tsx, actions.ts
    │   ├── acces-refuse/        page.tsx
    │   ├── session/fin/         route.ts
    │   └── (admin)/
    │       ├── layout.tsx       vérification de session, barre latérale, barre supérieure
    │       ├── page.tsx         accueil
    │       ├── loading.tsx, error.tsx, not-found.tsx
    │       ├── annees/          page.tsx, actions.ts, _components/
    │       ├── membres/         page.tsx, nouveau/, [id]/, ordre/, actions.ts, _components/
    │       ├── actions/         page.tsx, nouvelle/, [id]/, actions.ts, _components/
    │       ├── actualites/      page.tsx, nouvelle/, [id]/, actions.ts, _components/
    │       └── candidatures/    page.tsx, [id]/page.tsx, [id]/cv/route.ts, actions.ts, _components/
    ├── components/              AppShell, ConfirmDialog, Notice, EmptyState, ListToolbar, SortableHeader
    ├── lib/                     api.ts, session.ts, dates.ts, labels.ts, form-state.ts
    ├── theme/                   theme.ts, ThemeRegistry.tsx
    └── types/                   rotary-year.ts, member.ts, action.ts, news.ts, application.ts, api.ts
```

**Structure Decision** : celle d'`ARCHITECTURE.md`, section 11 (`proxy.ts`, `app/connexion`, `app/(admin)`, `lib/api.ts`, `lib/session.ts`, `theme/`, `types/`), complétée de ce que Next.js 16 impose (`session/fin`, `acces-refuse`) et d'un dossier `components/` pour les six éléments réellement partagés. Les composants propres à un domaine restent dans le dossier `_components` de ce domaine. Rien dans `packages/`.

## C. Précisions validées le 2026-10-02

- **P1 — Attribut `Secure` du cookie : validé.** Le cookie est `Secure` partout, en local comme en production, conformément à `ARCHITECTURE.md`. La vérification locale se fait avec Chrome ou Firefox, qui acceptent un cookie `Secure` sur `localhost`.
- **P2 — Deux adresses techniques : validé.** `/session/fin` (effacement du cookie, que Next.js interdit pendant un rendu) et `/acces-refuse` (page du `403`) sont conservées. Ce ne sont pas des domaines fonctionnels : les adresses fonctionnelles restent exactement celles d'`ARCHITECTURE.md`, section 11. Elles seront inscrites dans la structure de la section 11 lors de l'alignement de fin d'implémentation.
- **P3 — Messages propres au Back Office : validé.** Ils contextualisent des réponses de l'API (table B3, B7, [contracts/screens.md](./contracts/screens.md)) ; le contrat de l'API ne change pas.
- **Fuseau : un utilitaire unique, côté serveur.** Toute conversion Madagascar ↔ temps universel passe par `src/lib/dates.ts` ; le fuseau et son décalage n'y sont définis qu'une fois. Aucun autre fichier ne porte de valeur de décalage ni d'identifiant de fuseau.
- **Aucune bibliothèque de dates.**
- **Front Office hors périmètre.**

## D. Écarts constatés à l'implémentation (2026-10-02)

Aucun ne change une décision fonctionnelle. Tous ont été acceptés par le porteur du projet le 2026-10-02 : `@emotion/cache` est validée comme dépendance explicite, et les écarts de structure sont conservés tels quels.

- **Six dépendances au lieu de cinq.** `@emotion/cache`, dépendance paire obligatoire de `@mui/material-nextjs`, a dû être déclarée : l'installation sans hoisting ne la rend pas accessible autrement (research, R2).
- **`next.config.ts`** : les journaux de développement de Next.js (adresses appelées, arguments des Server Actions) sont désactivés, parce qu'ils écrivaient dans le terminal des termes de recherche et des saisies de formulaire (FR-054).
- **Fichiers en plus de la structure annoncée**, tous dans `apps/admin/src/` : `lib/navigation.ts` (adresse de retour, avis), `lib/lists.ts` (lecture d'une liste, page ramenée à la dernière), `lib/form-errors.ts` (séparé de `form-state.ts` pour qu'aucun composant du navigateur n'importe le client d'API), `lib/content-actions.ts` (publication et suppression, communes aux actions et aux actualités), `lib/session-cookie.ts` (nom du cookie, lu par le proxy) ; `components/` compte aussi `PageHeader`, `LinkButton`, `LoadingState`, `InfoAlert`, `DeleteSection`, `RowAction`, `ListPagination`, `RotaryYearField`, `SlugField`, `PublishedSlugDialog` et deux crochets ; `app/error.tsx` et `app/(admin)/[...introuvable]/page.tsx` (page « introuvable » avec la navigation pour toute adresse inconnue).
- **Un tableau commun aux actions et aux actualités** (`components/ContentTable.tsx`) remplace `ActionsTable.tsx` et `NewsTable.tsx` : leurs colonnes, tris et opérations sont identiques, seule une colonne diffère. Les tableaux des membres, des années et des candidatures restent propres à leur domaine.
- **Un avis de plus**, `introuvable` (« Ressource introuvable. »), pour le retour à la liste après une écriture sur une ressource supprimée entre-temps.
- **`apps/admin/.env.local`** : aucune tâche ne le crée ; les vérifications de l'implémentation ont passé `API_URL` au lancement. Il a été créé à la clôture, à la main, et reste non versionné.

## Complexity Tracking

Aucune violation de la constitution : section sans objet.
