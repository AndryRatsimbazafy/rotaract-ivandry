# Research: Version anglaise

Décisions du plan de la fonctionnalité 014. Chaque entrée : décision, raison, alternatives écartées. Source principale : `apps/web/node_modules/next/dist/docs/01-app/02-guides/internationalization.md` et `03-api-reference/04-functions/next-root-params.md` (Next 16.3).

## R1. Adresses : segment `[lang]` et `proxy.ts`

**Décision** :
- Toutes les routes publiques passent sous `apps/web/src/app/[lang]/`, avec la mise en page racine `app/[lang]/layout.tsx`, qui pose `<html lang>`. `lang` ∈ `fr`, `en` ; toute autre valeur → `notFound()`.
- `apps/web/src/proxy.ts` (convention Next 16, déjà utilisée par le Back Office) :
  - `/en` et `/en/…` : passent tels quels ;
  - `/fr` et `/fr/…` : redirection permanente (`308`) vers l'adresse sans préfixe, pour qu'une page n'ait qu'une adresse française ;
  - toute autre adresse : **réécriture** interne vers `/fr/…` ; l'adresse du navigateur ne change pas ;
  - `matcher` : tout sauf `_next`, `images`, `icon.png` et les fichiers à extension.
- `app/[lang]/[...missing]/page.tsx` appelle `notFound()` : une adresse inconnue rend `app/[lang]/not-found.tsx` dans la mise en page, dans la bonne langue, avec le statut `404`.
- `app/not-found.tsx` et `app/error.tsx` (013) passent sous `app/[lang]/`. Les groupes `(liste)` de 013 et les pages `[slug]` suivent, sans autre changement.

**Raison** : Q1 (adresse française inchangée, anglais = `/en` + adresse française) ; c'est le modèle du guide de Next 16, adapté pour que la langue par défaut n'ait pas de préfixe. Aucune dépendance.

**Alternatives** :
- *Arborescence dupliquée `app/en/…`* : chaque page en double.
- *Bibliothèque (`next-intl`, `next-i18n-router`)* : une dépendance pour ce que `proxy.ts` et `[lang]` font en quelques lignes (principe IV).
- *Préfixe `/fr` visible* : écarté par Q1.

## R2. Textes fixes : un dictionnaire par langue, lu par `next/root-params`

**Décision** :
- `src/content/*.ts` devient `src/content/fr/*.ts` (déplacement, contenu inchangé) ; `src/content/en/*.ts` en est la traduction, même forme, contrôlée par le typage (`satisfies` du type tiré du français).
- `src/content/index.ts` : `getContent()` lit la langue par `lang()` de `next/root-params` et renvoie le dictionnaire (`home`, `actions`, `news`, `members`, `join`, `common`, `pages`, `site`).
- Les sections serveur appellent `await getContent()` au lieu d'importer `@/content/home` ; celles qui étaient synchrones deviennent `async`.
- Les composants client (`ApplicationForm`, `MobileMenu`, `NavLink`, `error.tsx`) reçoivent leurs textes et la langue par leurs propriétés ; `error.tsx` (sans paramètre) lit la langue dans l'adresse (`usePathname`).

**Raison** : `next/root-params` est stable en 16.3 et évite de faire descendre `lang` dans chaque composant. La forme commune des deux dictionnaires garantit qu'aucun texte ne manque en anglais (SC-002).

**Alternatives** : passer `lang` en propriété partout (plus de 60 fichiers touchés pour rien) ; fichiers JSON (perte du typage et des commentaires existants).

## R3. Liens

**Décision** : `src/lib/locale.ts` :
- `type Lang = "fr" | "en"` ; `currentLang()` (`lang()` de `next/root-params`) ;
- `localize(href, lang)` : préfixe `/en` en anglais, rien en français ; garde la requête et l'ancre ;
- `switchLanguage(pathname, search, target)` : ajoute ou retire `/en` (sélecteur, Q1).

Tous les liens internes passent par `localize` : navigation, liens fléchés, liens de sortie, filtres (`filterHref`, `newsHref`), chemins de détail (`actionPath`, `newsItemPath`). `config/routes.ts` garde les chemins français.

## R4. Dates

**Décision** : chaque fonction de `lib/dates.ts` prend la langue en paramètre et choisit `fr-FR` ou `en-GB` (« 14 March 2026 ») ; fuseaux inchangés (Madagascar pour une actualité, temps universel pour une action).

**Raison** : FR-007 ; `lib/dates.ts` reste le seul fichier à porter un fuseau.

## R5. Données : un objet `en` facultatif

**Décision** (API) :
- **Action** : `en?: { title?, summary?, description?, impact?: { objective?, beneficiaries?, location?, period?, results? } }`.
- **Actualité** : `en?: { title?, summary?, content?, location? }`.
- **Réglages du site** : `en?: { club?: { sponsorClub?, meetingPlace?, meetingRhythm? }, faq?: { <question>?: string } }`.
- **Image (`MediaRef`)** : `altEn?`, `captionEn?` à plat, parce que l'envoi d'une image est en `multipart/form-data` à champs plats.
- Mêmes longueurs que les champs français ; espaces de bord retirés ; chaîne vide ou `null` → champ retiré ; un objet `en` vide n'est pas stocké.
- **Lectures** publiques et d'administration : renvoient `en` (seulement les champs présents) et, pour une image, `altEn` et `captionEn`. Les deux langues voyagent dans la même réponse : une seule entrée de cache par contenu, aucun paramètre de langue dans l'API.
- **Écritures** : `POST` et `PATCH` des actions et des actualités, `PATCH /admin/site-settings`, envoi et `PATCH` des images acceptent ces champs ; `null` retire.
- Slug, recherche `q`, tri et filtres : inchangés.

**Raison** : FR-008 ; le français reste la référence et chaque champ anglais est facultatif.

**Alternatives** : des collections de traductions (relation et cohérence à gérer pour un seul champ facultatif) ; des champs `titleEn` à plat partout (un objet `en` par contenu se lit et se vide plus simplement).

## R6. Résolution de la langue dans le site

**Décision** : `src/data/*` résout chaque champ traduisible selon `currentLang()` :
- type `Localized = { text: string; lang: Lang }` pour titre, résumé, description, impact, contenu, lieu, réponses de la FAQ, informations textuelles du club ;
- en anglais : `{ text: en, lang: "en" }` si la traduction existe, sinon `{ text: fr, lang: "fr" }` ;
- un champ français absent reste absent (FR-010) ;
- `Photo` gagne `altLang` et `captionLang`.

Les composants rendent `lang={value.lang}` sur l'élément quand la langue diffère de celle de la page (FR-002, SC-003).

## R7. Repère des passages en français

**Décision** (à ajouter à `DESIGN.md`) : la **mention de langue** : sur une page anglaise, un bloc qui contient au moins un passage français (fiche d'action ou d'actualité, entrée d'une liste, FAQ, fiche du club) porte une fois l'étiquette « In French », en Charcoal, en bord de bloc, sans icône ni couleur. Chaque passage français porte en plus `lang="fr"`.

**Raison** : FR-009 (« repère visible discret ») ; une mention par passage serait bruyante.

## R8. Typographie anglaise (à ajouter à `DESIGN.md`, section 4)

Guillemets “ ” et ‘ ’, aucune espace avant `; : ! ?`, apostrophe typographique, dates « 14 March 2026 », majuscule seulement au premier mot des titres (sentence case), comme en français.

## R9. Métadonnées et référencement

**Décision** : `generateMetadata` de chaque page :
- `alternates.languages` : `fr` (adresse française), `en` (adresse `/en`), `x-default` (adresse française) ;
- `openGraph.locale` : `fr_FR` ou `en_GB` ;
- titres et descriptions dans la langue de la page.

Les adresses absolues dépendent de `metadataBase`, absent avant le déploiement (comme en 013) : les adresses relatives suffisent en local.

## R10. Formulaire de candidature

**Décision** : `submitApplication(formData, lang)` (action serveur, qui ne lit pas `next/root-params`) choisit les messages dans le dictionnaire de `lang` : en anglais, un refus `400` est traduit champ par champ (`errors.<champ>`), `413` → `cvTooLarge`, `415` → `cvFormat`, `429`, `503` ; en français, le comportement actuel est gardé (message de l'API). Le formulaire client reçoit son dictionnaire et sa langue en propriétés.

**Raison** : FR-012 ; l'API reste en français et reste l'autorité.

## R11. Back Office

**Décision** :
- Formulaires d'action et d'actualité : une section « English (facultatif) » sous les champs français, mêmes champs et mêmes limites ; impact anglais dans la même section.
- Panneau image (`ImageSheet`) : « Texte alternatif (anglais) » et « Légende (anglais) », sous les champs français.
- Écran « Site » : dans « Présentation du club » et « Questions fréquentes », un champ anglais sous chaque champ texte français.
- Libellés en français ; aucun autre changement d'interface.

## R12. Ce qui ne change pas

Membres (noms, profession ou études), mandats, années Rotary, candidatures, CV ; adresses françaises ; aucune dépendance ; aucune variable d'environnement.
