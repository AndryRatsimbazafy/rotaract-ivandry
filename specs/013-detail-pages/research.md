# Research: Pages de détail

Décisions du plan de la fonctionnalité 013. Chaque entrée : décision, raison, alternatives écartées.

## R1. Lecture d'un contenu par son slug, et distinction 404 / panne

**Décision** :
- `lib/api.ts` gagne `apiGetOrNull<T>(path)` : même requête que `apiGet` (revalidation de 60 s, délai de 10 s), mais `404` → `null` ; toute autre réponse autre que `200` lève une erreur, qui n'est pas mise en cache.
- `data/actions.ts` gagne `getActionBySlug(slug): Promise<Action | null>` ; `data/news.ts` gagne `getNewsBySlug(slug): Promise<NewsItem | null>`. Le slug est encodé (`encodeURIComponent`). Ils réutilisent `toAction` et `toNewsItem`.
- La page appelle `notFound()` sur `null` ; une erreur remonte à la frontière d'erreur du site (`app/error.tsx`, R3 bis), et une version déjà lue reste servie par le cache de données (décision 20).

**Raison** : FR-002 et FR-003 demandent de ne jamais confondre « introuvable » et « panne ». `apiGet` lève pour tout statut, ce qui ne permet pas la distinction. Les fonctions de liste gardent leur repli vide ; une page de détail n'a pas d'état vide qui ait du sens.

**Alternatives** : attraper l'erreur de `apiGet` et répondre 404 dans tous les cas ; une panne passerait alors pour un contenu supprimé, et serait mise en cache par les robots.

## R2. Vrai statut 404 malgré les attentes des pages de liste

**Décision** : les pages de liste passent dans un groupe de routes, sans changement d'adresse :
- `app/actions/(liste)/page.tsx` et `app/actions/(liste)/loading.tsx` ;
- `app/actualites/(liste)/page.tsx` et `app/actualites/(liste)/loading.tsx` ;
- `app/actions/[slug]/page.tsx` et `app/actualites/[slug]/page.tsx` restent hors du groupe, donc hors de la frontière d'attente des listes.

Les dossiers `_sections` restent où ils sont ; seuls les chemins d'import des deux pages de liste changent (`./_sections` → `../_sections`).

**Raison** : la documentation de Next 16 (`file-conventions/loading.md`, « Status Codes ») : une réponse envoyée en flux part avec le statut `200`, même si `notFound()` est appelé ensuite ; seul un `noindex` est ajouté. Un `loading.tsx` dans `app/actions/` engloberait `[slug]`. Hors de toute frontière d'attente, la page décide `notFound()` avant l'envoi de l'en-tête, et le statut est `404` (SC-003).

**Alternatives** :
- *Accepter `200` + `noindex`* : contraire à FR-002.
- *Tester l'existence du slug dans `proxy.ts`* : une lecture de l'API de plus par requête, et un fichier de plus à maintenir pour un besoin que la structure des routes règle seule.

## R3. Page introuvable du site

**Décision** : créer `app/not-found.tsx`, une page typographique selon la composition « Page introuvable » ajoutée à `DESIGN.md` (R7). Elle sert à `notFound()` des deux pages de détail et à toute adresse inconnue. Métadonnées : titre « Page introuvable ». Aucun `global-not-found.js` (une seule mise en page racine).

**Raison** : le site n'en a pas ; celle de Next.js par défaut ne suit pas `DESIGN.md`.

## R3 bis. Page d'erreur du site

**Décision** : créer `app/error.tsx` (composant client, frontière d'erreur de la mise en page racine), selon `DESIGN.md`, section 9, « Erreur » : une phrase calme, la cause et la correction (« Le contenu n'a pas pu être chargé. Réessayez dans un instant. »), un bouton « Réessayer » (`reset()`), et un lien fléché vers l'accueil. Même composition typographique que la page introuvable, sans chiffre monumental.

**Raison** : FR-003 : une panne de l'API sur une page jamais lue ne doit donner ni la page introuvable ni la page d'erreur par défaut de Next.js. Le site n'a aujourd'hui aucune frontière d'erreur ; les listes ne lèvent pas (repli vide), mais les pages de détail le peuvent.

## R4. Rendu et cache

**Décision** : les pages de détail sont rendues à la demande (`await connection()`), à partir du cache de données (revalidation de 60 s), comme l'accueil et les listes. Pas de `generateStaticParams`.

**Raison** : décision 20 et note « Accueil rendu à la demande » de `PROJECT_CONTEXT.md` ; une page générée à l'avance relirait une entrée périmée au premier plan, et une API indisponible enregistrerait une erreur.

## R5. Métadonnées et image de partage

**Décision** : `generateMetadata` dans chaque page de détail, avec le même appel de données que la page (dédoublonné par le cache de Next.js) :
- `title` : le titre du contenu (le gabarit `%s | Rotaract Club Ivandry` de la mise en page racine s'applique) ;
- `description` : le résumé, sinon le premier paragraphe, coupé à 160 caractères au plus sur une limite de mot, avec « … » ;
- `openGraph` : `type: "article"`, `title`, `description`, `images` : la photographie principale (adresse Cloudinary absolue, avec dimensions et texte alternatif) ; à défaut, l'ouverture de l'accueil enregistrée dans les réglages du site (012), absolue elle aussi ; à défaut, aucune image ;
- `alternates.canonical` : non défini (aucune adresse publique du site n'est connue avant le déploiement).

**Raison** : FR-012 et SC-002. La photographie livrée avec le site (`/images/Image-16-9.jpeg`) est un chemin relatif : sans adresse publique du site (`metadataBase`), Next.js la résoudrait vers `localhost`. Le déploiement est hors périmètre ; on n'ajoute pas de variable d'environnement pour cela. Quand l'adresse du site sera connue, `metadataBase` dans la mise en page racine rendra ce repli possible.

**Alternatives** : ajouter `SITE_URL` maintenant ; une variable sans valeur réelle avant le déploiement.

## R6. Liens depuis l'accueil et les listes

**Décision** :
- `config/routes.ts` gagne `actionPath(slug)` (`/actions/<slug>`) et `newsItemPath(slug)` (`/actualites/<slug>`).
- Accueil : `LatestActions` et `LatestNews` utilisent ces chemins à la place de `routes.actions` et `routes.news` (les commentaires « La page de détail … n'existe pas encore » disparaissent).
- Page Actions (`ActionsIndex`) : le titre et la photographie principale deviennent des liens ; le `details.fold` « Lire la suite » est remplacé par `ArrowLink` « Lire la suite » vers la page ; la description, l'impact et les photographies suivantes quittent la liste.
- Page Actualités : `NewsFeature` (à la une) et `NewsRegister` (registre) remplacent leur `details.fold` par un lien « Lire la suite » ; dans le registre, la ligne devient un lien sur son titre, avec l'état de survol existant (« La ligne devient blanche, le jour passe au bleu »).
- La classe globale `fold` reste utilisée par la FAQ et le filtre des domaines.

**Raison** : FR-008 à FR-011 et la clarification Q1.

## R7. Direction visuelle (à ajouter à `DESIGN.md` avant le code)

**Décision** : trois compositions, proposées dans `plan.md`, section A, et ajoutées à `DESIGN.md` (sections 10, 12 et 17) :

1. **Action, « le reportage ».** La photographie domine.
   - Ouverture sur le fond de page : métadonnées en marge gauche sur deux colonnes (étiquette « Action », année Rotary, date, domaines) ; titre condensé très grand sur huit colonnes ; photographie principale 3:2 à bord perdu à droite, que le titre mord par un aplat blanc (procédé de l'action principale de l'accueil, section 6).
   - Sur feuille blanche : le résumé en accroche (voix de récit, grand), puis le récit sur la colonne de lecture ; en marge droite, la fiche d'impact (une ligne par rubrique renseignée, filets encre, intitulé en étiquette) et les partenaires.
   - La planche : les photographies suivantes en planche asymétrique, alternance d'une grande (huit colonnes, 3:2) et de deux plus petites décalées (4:5 et 3:2, hauteurs de départ différentes), légendes en Georgia italique sous chaque image. Jamais une grille de vignettes égales.
   - Sortie : lien fléché « Toutes les actions », liens de sortie, rappel cranberry.
   - Sans photographie : gabarit 3:2 dans l'ouverture (section 8), pas de planche.
2. **Actualité, « l'article ».** La date domine.
   - Ouverture typographique sur le fond de page : le jour en chiffre monumental au trait, en marge gauche ; mois et année, puis type, en étiquettes ; titre en largeur normale, très grand ; lieu en métadonnée sous le titre.
   - La photographie principale, si elle existe, en 16:9 à bord perdu sous l'ouverture, légende dessous.
   - Le texte sur feuille blanche : le résumé en chapeau (Open Sans 600), puis le texte en voix de récit sur la colonne de lecture, décalée d'une colonne vers la droite ; les photographies suivantes en marge droite, au fil du texte, sur trois colonnes (sous le texte sur téléphone).
   - Sortie : lien fléché « Toutes les actualités », liens de sortie.
   - Sans photographie : la composition s'arrête à l'ouverture typographique et au texte, sans gabarit.
3. **Page introuvable.** Sur le fond de page : « 404 » en chiffre monumental au trait, en marge ; titre « Cette page n'existe pas, ou plus. » ; une phrase calme ; trois liens fléchés : Accueil, Actions, Actualités.

**Raison** : `DESIGN.md`, section 10 (photographie dominante pour une action, date dominante pour une actualité), section 6 (procédés existants), « jamais de gabarit générique » (CLAUDE.md). Les deux pages ne se ressemblent pas : l'une s'ouvre par l'image, l'autre par la date ; la planche et la marge photographique diffèrent.

## R8. Mouvement

**Décision** : aucun mouvement nouveau. Les liens « Lire la suite » et « Toutes les … » utilisent `ArrowLink` (filet tracé, flèche de 4 px) ; les photographies des listes, devenues cliquables, grossissent de 3 % au survol, sur pointeur précis (section 12). Les photographies des pages de détail ne sont pas cliquables et ne bougent pas.

## R9. Ce qui ne change pas

API, Back Office, données, réglages du site ; les filtres, l'ancre `#liste`, l'ordre et la lecture complète des listes ; aucune dépendance ; aucune variable d'environnement.
