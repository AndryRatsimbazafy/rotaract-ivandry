# Research: Réglages du site

Décisions prises pour le plan de la fonctionnalité 012. Chaque entrée : décision, raison, alternatives écartées.

## R1. Forme de la donnée : un document unique

**Décision** : une collection `site_settings` qui ne contient jamais plus d'un document, d'identifiant fixe `"site"` (`_id` de type chaîne). Il n'est pas créé d'avance : la lecture renvoie l'état vide tant qu'il n'existe pas, et la première écriture le crée (`findOneAndUpdate` avec `upsert`).

**Raison** : la spec (FR-001) demande un seul ensemble de réglages qui existe « implicitement vide ». Un identifiant fixe rend l'unicité structurelle, sans index ni contrôle applicatif. Aucun script d'initialisation (principe III).

**Alternatives** :
- *Un document par réglage (clé, valeur)* : c'est un magasin générique de paires, refusé par le principe IV, et il perd la validation par champ.
- *Créer le document au démarrage de l'API* : une écriture cachée au démarrage, sans besoin.
- *Champs ajoutés à un modèle existant* : aucun ne représente le site.

## R2. Champs fermés, pas de texte libre générique

**Décision** : chaque réglage est un champ nommé, avec sa règle :
- `social.facebook`, `social.instagram` ;
- `club.foundedYear`, `club.sponsorClub`, `club.memberCount`, `club.meetingPlace`, `club.meetingRhythm` ;
- `faq.<question>` pour six questions, identifiées par une liste fermée (`qui`, `rencontre`, `sympathisant`, `avant`, `membre`, `frequence`), identique aux `id` de `apps/web/src/content/join.ts` ;
- `photos.<emplacement>` pour sept emplacements, liste fermée elle aussi.

**Raison** : la spec limite le périmètre à ces contenus et met un éditeur de tous les textes hors périmètre (principe IV). Des listes fermées se valident côté API et se dupliquent sans risque entre les applications, comme les domaines d'action et les fonctions des membres.

**Alternatives** : une carte libre `textes: { [clé]: string }`, écartée pour les mêmes raisons que R1.

## R3. Les questions de la FAQ et leurs réponses par défaut

**Décision** :
- L'API ne connaît que les identifiants des six questions, pas leur intitulé. Une réponse absente de la base est absente de la lecture publique.
- Le Front Office garde dans `content/join.ts` les intitulés et les quatre réponses actuelles. Il affiche la réponse enregistrée si elle existe, sinon celle du code, sinon il masque la question (FR-012, FR-013).
- Le Back Office porte dans `src/content/site.ts` les six intitulés et les quatre réponses actuelles, recopiés de `apps/web/src/content/join.ts` avec un commentaire qui le dit. Ils servent d'intitulés des champs et de valeur initiale tant que rien n'est enregistré (spec, récit 3, scénario 5).
- L'API refuse de vider les réponses de `rencontre`, `sympathisant`, `avant` et `membre` : `null` ou chaîne vide → `400` « Cette question a besoin d'une réponse. » Celles de `qui` et `frequence` peuvent être vidées.

**Raison** : les applications ne partagent aucun paquet (`packages/` vide), et le Back Office ne lit jamais le Front Office. La copie de quatre réponses est le prix le plus faible ; elle disparaît en pratique dès le premier enregistrement, qui les écrit en base. La règle de non-vidage vit dans l'API, autorité unique, et se répète dans le formulaire pour un message immédiat.

**Alternatives** :
- *Mettre les réponses par défaut dans l'API* (valeur par défaut du schéma) : du texte éditorial dans le backend, et une copie de plus.
- *Script qui écrit les quatre réponses en base* : refusé par le principe III pour une opération ponctuelle ; la pré-saisie du Back Office fait le même travail au premier enregistrement.
- *Champs vides sans pré-saisie* : l'administrateur ne verrait pas ce que le site affiche, et risquerait de remplacer une bonne réponse par rien.

## R4. Contrôle des adresses des réseaux sociaux

**Décision** : `class-validator` `@IsUrl` avec `protocols: ['https']`, `require_protocol: true`, `host_whitelist` limité au réseau et à ses sous-domaines (`facebook.com`, `www.facebook.com`, `m.facebook.com`, `fb.com` pour Facebook ; `instagram.com`, `www.instagram.com` pour Instagram), 300 caractères au plus, espaces retirés avant le contrôle (`@Transform`, comme les autres DTO). `null` vide le champ. Messages : « Indiquez l'adresse complète de la page Facebook du club, commençant par https:// » et l'équivalent pour Instagram.

**Raison** : FR-007. `class-validator` est déjà là ; aucune dépendance.

**Alternatives** : une expression régulière maison, moins lisible et plus fragile.

## R5. Images des emplacements : le mécanisme de 011, un seul par emplacement

**Décision** :
- Routes rattachées à l'emplacement : `PUT /admin/site-settings/photos/:slot` (multipart, ajout ou remplacement), `PATCH …/photos/:slot` (texte alternatif, légende, crédit, point d'intérêt), `DELETE …/photos/:slot`.
- Le service suit exactement `MembersService.setPortrait`, `updatePortrait` et `removePortrait` : `storeImage`, puis `findOneAndUpdate` (avec `upsert`) qui renvoie l'état précédent, puis `discardImage` de l'ancien fichier ; `imageFieldsUpdate` pour la modification ; `removeImageFile` puis `$unset` pour le retrait.
- Dossier de stockage : `ImageFolder` gagne `'pages'`, soit `site/pages/` chez le fournisseur.
- `:slot` est validé par `ParseEnumPipe` sur la liste fermée ; une valeur inconnue → `404`, comme une ressource absente.

**Raison** : la spec réutilise 011 « sans changement » ; la forme unique (zéro ou une image) est celle du portrait. `content-images.ts` fournit déjà tous les morceaux, aucun code de ménage n'est réécrit.

**Alternatives** :
- *Une route d'envoi générique `/admin/media`* : écartée par 011 et par `ARCHITECTURE.md`, section 6.
- *Un tableau de photos avec un champ « emplacement »* : il faudrait garantir l'unicité par emplacement à la main.

## R6. Lecture publique et cache du Front Office

**Décision** :
- `GET /api/v1/site-settings`, public, sans pagination. Il renvoie seulement les champs renseignés (FR-005), les images sous la forme publique de 011 (FR-004).
- `apps/web/src/data/site-settings.ts` : `getSiteSettings()`, par `apiGet` (revalidation de 60 s). En cas d'échec, il renvoie l'état vide : le site retombe sur ses emplacements et ses replis, jamais sur un texte inventé.
- L'en-tête, le pied de page et le menu du téléphone appellent `getSiteSettings()` pour les liens. La page et l'en-tête font la même requête, que le cache de Next.js ne lit qu'une fois par rendu.
- **`/rejoindre` devient rendue à la demande** (`await connection()`), comme l'accueil et les listes. Elle lit maintenant un contenu de l'API (la FAQ, la photographie) ; régénérée statiquement, une API indisponible au mauvais moment enregistrerait l'état vide (`ARCHITECTURE.md`, décision 20, et la note « Accueil rendu à la demande » de `PROJECT_CONTEXT.md`).

**Raison** : même chemin que toutes les lectures du Front Office ; même règle de fraîcheur (FR-015).

**Alternatives** : laisser `/rejoindre` statique, et accepter qu'une régénération ratée masque les réponses nouvelles pendant une minute. C'est contraire à la décision 20.

## R7. Écran du Back Office

**Décision** :
- Une entrée « Site » dans la navigation (`AppShell`, icône `LanguageOutlined`), après « Candidatures ». Sur téléphone, les onglets passent de cinq à six ; c'est la limite lisible de la barre d'onglets MUI à 375 px (libellés courts : « Site »). À vérifier à 375 px.
- Page `/site`, lue dans un composant serveur par `GET /admin/site-settings`. Trois sections dans cet ordre :
  1. « Photographies » : sept cartes d'emplacement, chacune avec sa vignette ou un gabarit, son libellé, son format, sa description et ses boutons. Elles réutilisent `ImageSheet`, `ImageThumb` et `ConfirmDialog`.
  2. « Réseaux sociaux » : un formulaire à deux champs.
  3. « Textes » : un formulaire « Présentation du club » (cinq champs) et un formulaire « Questions fréquentes » (six champs multilignes).
- Chaque formulaire s'enregistre séparément par une action serveur (`PATCH` partiel), avec avis et erreurs sous les champs, comme les formulaires existants.
- La recherche rapide (Ctrl+K) gagne la destination « Site » par la liste `ENTRIES`, sans changement de la recherche de contenus.

**Raison** : FR-006 à FR-011 ; mêmes composants que 011 et que les fiches ; aucune dépendance.

**Alternatives** :
- *Un formulaire unique pour tout l'écran* : une erreur sur un champ bloquerait toutes les autres modifications.
- *Trois pages séparées* : trop pour onze champs et sept images.

## R8. Mise en forme de la présentation du club (`DESIGN.md`)

**Décision** : proposer à `DESIGN.md` (section 6, composition « 01 Le club ») une **fiche du club** sous le texte de la section :
- une liste de lignes séparées par des filets encre de 1 px, comme le registre ;
- sur chaque ligne, l'intitulé en étiquette (Charcoal) en marge gauche et la valeur en Open Sans 600 à droite, en chiffres tabulaires pour l'année et le nombre ;
- intitulés et ordre : « Création », « Club parrain », « Membres », « Réunions » (le lieu), « Rythme » ;
- une information vide n'a pas de ligne ; si les cinq sont vides, la mention « Présentation à compléter » reste à sa place ;
- aucun chiffre monumental ni animé : le « 01 » au trait reste le seul grand chiffre de la section (`DESIGN.md`, section 12, compteur animé interdit).

La proposition est ajoutée à `DESIGN.md` après validation de ce plan, avant le code (CLAUDE.md : un changement de design se fait d'abord dans `DESIGN.md`).

**Raison** : des métadonnées se placent « en marge ou en bord de ligne, jamais au centre » (`DESIGN.md`, section 4) ; le filet encre structure déjà les listes du site. Aucun nouveau procédé visuel.

**Alternatives** : une phrase composée à partir des champs (« Fondé en 2012, parrainé par… ») ; la grammaire varie selon les champs remplis et devient fragile en cas de manque.

## R9. Photographies fixes dans le Front Office

**Décision** : chaque section concernée reçoit l'image de son emplacement par ses propriétés, lue par la page dans son `Promise.all` :
- `Opening` : l'image enregistrée, sinon `opening.photo` (fichier livré avec le site) ;
- `About`, `JoinField`, `ActionsOpening` (deux images), `MembersOpening` : l'image, sinon le gabarit actuel ;
- `JoinOpening` : l'image de son emplacement ; sinon l'ouverture de l'accueil en vigueur (enregistrée, avec son propre point d'intérêt, ou le fichier livré avec le point « 55% 40% » actuel).

`PhotoFrame` et `toPhoto` de 011 sont réutilisés sans changement ; `next.config.ts` autorise déjà Cloudinary.

**Raison** : FR-012 à FR-014 et le tableau des replis de la spec ; aucune composition modifiée.

## R10. Ce qui ne change pas

- Le CV, les images de 011 et leurs routes.
- Les compositions du Front Office, en dehors de la fiche du club (R8).
- Aucune variable d'environnement nouvelle ; aucune dépendance.
