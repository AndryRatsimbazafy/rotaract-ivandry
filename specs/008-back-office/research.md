# Research : Back Office

Constats faits sur le dépôt et sur la documentation embarquée de Next.js 16 (`apps/admin/node_modules/next/dist/docs/`), le 2026-10-02. Aucun point « NEEDS CLARIFICATION » ne subsiste.

## R1. État de `apps/admin`

- Gabarit `create-next-app` intact : Next.js 16.3.8, React 19.2.8, TypeScript 5 strict, ESLint (configuration plate, `eslint-config-next`), alias `@/*` → `./src/*`, port 3001. Une page d'accueil de gabarit, polices Geist, `lang="fr"`.
- `.gitignore` de l'application ignore `.env*` : un `.env.example` y serait ignoré aussi. **Décision** : ajouter l'exception `!.env.example`, comme le veut `ARCHITECTURE.md`, section 12 (« chaque application aura un `.env.example` versionné »).
- `API_URL` : variable serveur, lue dans `.env.local` (ignoré), créé à la main.

## R2. Dépendances

- **Décision** : les cinq paquets d'`ARCHITECTURE.md`, section 11 — `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/material-nextjs`, `@mui/icons-material`. Versions publiées au 2026-10-02 : MUI 9.4.0 (pairs : React 17 à 19 ; `@mui/material-nextjs` : Next 13 à 16), Emotion 11.14.
- `@mui/material-nextjs` a `@emotion/cache` pour dépendance paire obligatoire. **Constat à l'implémentation (2026-10-02), qui corrige l'hypothèse de ce plan** : avec l'installation sans hoisting du dépôt, npm place `@emotion/cache` sous `@emotion/react/node_modules`, où `@mui/material-nextjs` ne le trouve pas (« Module not found: Can't resolve '@emotion/cache' »). Il a donc été déclaré dans `apps/admin/package.json` : **six dépendances au lieu de cinq**. Ce n'est pas une bibliothèque de plus au sens fonctionnel — elle était déjà dans l'arbre — mais c'est un écart à la décision « exactement cinq », validé par le porteur du projet le 2026-10-02.
- **Écartées, faute de besoin réel** (constitution, principe IV) :

| Besoin | Bibliothèque écartée | Ce qui la remplace |
|---|---|---|
| Formulaires | react-hook-form, formik | `useActionState`, champs non contrôlés, valeurs renvoyées par l'action |
| Validation | zod, yup | L'API valide ; attributs natifs pour les seules règles identiques |
| Dates et fuseaux | dayjs, date-fns, luxon, `@mui/x-date-pickers` | `Intl.DateTimeFormat`, `<input type="date">` et `datetime-local`, décalage constant +03:00 |
| Tableaux | `@mui/x-data-grid` | `Table` de MUI ; tri, filtres et pagination sont faits par l'API |
| Ordre des mandats | dnd-kit, react-beautiful-dnd | Boutons « Monter » / « Descendre » |
| État, cache client | redux, zustand, swr, react-query | Server Components, adresse, `revalidatePath` |
| Avis | notistack | `Snackbar` de MUI |

## R3. Protection des écrans dans Next.js 16

- `src/proxy.ts` remplace `middleware.ts` (même fonctionnement). La documentation le réserve aux vérifications optimistes et déconseille d'y faire des lectures lentes : il ne teste que la **présence** du cookie. C'est le niveau 1 d'`ARCHITECTURE.md`.
- `cookies()` est asynchrone. **Écrire ou effacer un cookie n'est possible que dans une Server Function ou un Route Handler**, jamais pendant le rendu d'un Server Component. Conséquence : le « cookie effacé » d'un `401` reçu en lecture passe par un gestionnaire de route (`/session/fin`). Sans lui, le cookie invalide resterait, le proxy renverrait `/connexion` vers `/`, et l'administrateur tournerait en boucle.
- Un layout n'est pas réexécuté à chaque navigation côté client : la vérification du layout ne suffit pas. Chaque lecture et chaque écriture passe par l'API, qui répond `401` ; le client d'API le traite partout.
- `forbidden()` et `unauthorized()` sont **expérimentaux** (`authInterrupts`). **Décision** : non utilisés ; redirections ordinaires.
- `redirect()` fonctionne dans les Server Components, les Server Actions et les Route Handlers.

## R4. Formulaires

- `useActionState` (React 19) : l'action reçoit l'état précédent et renvoie le nouvel état ; `pending` désactive le bouton. C'est le modèle de la documentation de Next.js 16 (« Forms »).
- Les champs MUI ne sont pas contrôlés (`defaultValue`), sauf quand un comportement l'exige : date → année présélectionnée, cases à cocher multiples, ordre des mandats.
- En cas d'échec, React réinitialise un formulaire non contrôlé après l'action : l'action renvoie donc les valeurs saisies, qui redeviennent les `defaultValue`. La saisie est conservée (FR-015).

## R5. Listes

- `searchParams` est une promesse dans Next.js 16 : la page l'attend, puis appelle l'API. L'état de la liste vit dans l'adresse ; aucun stockage côté navigateur.
- Noms des paramètres d'adresse du Back Office en français (`annee`, `tri`, `publie`, `du`, `au`), traduits vers ceux de l'API par la page. Le tri reprend la valeur du contrat (`-date`, `lastName`…).
- Lectures en `cache: 'no-store'` : un administrateur doit voir l'état réel ; aucune donnée personnelle n'est mise en cache.

## R6. MUI avec l'App Router

- `AppRouterCacheProvider` (`@mui/material-nextjs/v16-appRouter` ou l'entrée la plus récente fournie par la version installée — à constater à l'installation) dans le layout racine, puis `ThemeProvider` et `CssBaseline` dans un Client Component (`ThemeRegistry`).
- Les composants MUI sont des Client Components : les pages restent des Server Components qui passent des données sérialisables à des composants `"use client"`.
- Police : `next/font/google` avec Open Sans, exposée en variable CSS et reprise par le thème.

## R7. Dates et fuseau

- Madagascar : UTC+3 toute l'année, sans changement d'heure. Identifiant IANA `Indian/Antananarivo`.
- Conversion à l'écriture : `new Date(valeur + ':00+03:00').toISOString()`, sur le serveur.
- Conversion à la lecture : `Intl.DateTimeFormat` avec `timeZone: 'Indian/Antananarivo'` et `formatToParts` pour reconstruire `AAAA-MM-JJTHH:mm`.
- Tout formatage se fait sur le serveur : aucun écart d'hydratation, aucun effet du fuseau de l'ordinateur.
- **Décision validée le 2026-10-02** : ces conversions vivent dans un utilitaire unique, `src/lib/dates.ts`, seul fichier à définir le fuseau et son décalage. Aucune bibliothèque de dates.
- Limite connue (spec, « Edge Cases ») : les années Rotary sont bornées en temps universel ; une actualité du 1er juillet avant 3 h, heure de Madagascar, appartient à l'année précédente selon l'API. L'année proposée suit l'API ; l'avertissement d'écart aussi.

## R8. Téléchargement du CV

- L'API renvoie le fichier lui-même, avec `Content-Disposition: attachment` et `Cache-Control: no-store` (contrat 007). Le gestionnaire de route du Back Office relaie le flux et ces en-têtes.
- Un lien ordinaire suffit : sur une réponse en pièce jointe, le navigateur reste sur la fiche. Sur un échec, le gestionnaire redirige vers la fiche avec un motif, plutôt que d'afficher du JSON.
- Constat de 007 : la lecture d'un CV de 5 Mo peut dépasser le délai de 10 secondes du stockage sur une liaison lente (`503`). Le Back Office affiche le message et permet de réessayer ; son propre délai (15 secondes) est supérieur à celui de l'API.
- À connaître pour un futur déploiement (hors périmètre) : certains hébergeurs limitent la taille d'une réponse de fonction ; un relais en flux y est en général admis.

## R9. Réutilisation sans abstraction prématurée

- Partagés, parce que réellement identiques d'un domaine à l'autre : la coque (`AppShell`), le dialogue de confirmation, l'avis, l'état vide, la barre de recherche et de filtres, l'en-tête triable.
- **Non factorisés** : les tableaux et les formulaires de chaque domaine. Leurs colonnes, champs et règles diffèrent ; un tableau ou un formulaire « générique » piloté par configuration coûterait plus qu'il ne rapporte pour cinq domaines. La section « année, slug, publication » commune aux actions et aux actualités est un composant partagé par ces deux seuls formulaires.
- Les libellés des valeurs fermées (dix fonctions, sept domaines, cinq types, deux situations) sont recopiés d'`ARCHITECTURE.md`, section 1, dans `lib/labels.ts` : chaque application déclare ses types (section 11), rien n'est importé de `apps/web` ni d'`apps/api`.

## R10. Compatibilité avec l'API existante

Relecture des contrats 002 à 007 et du code de `apps/api` : toutes les opérations nécessaires existent. Aucune incompatibilité bloquante ; aucune modification de l'API n'est demandée.

| Besoin de l'écran | Opération | Remarque |
|---|---|---|
| Noms dans l'écran d'ordre | `GET /admin/mandates?year=` et `GET /admin/members?year=&limit=100` | Le mandat ne porte que l'identifiant du membre ; deux lectures combinées côté serveur |
| Listes déroulantes d'années | `GET /admin/rotary-years` | Non paginée |
| Présélection de l'année | `startDate`, `endDate` de chaque année | Comparaison côté Back Office, visible et modifiable |
| Période des candidatures en jours de Madagascar | `from`, `to` avec décalage explicite | Le contrat accepte toute date ISO 8601 ; à constater au quickstart |
| Compte affiché dans la barre | `GET /auth/me` | |
