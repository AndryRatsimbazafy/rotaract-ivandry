# Implementation Plan: Réglages du site

**Branch**: `012-site-settings` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/012-site-settings/spec.md`

## Summary

Les contenus du site public aujourd'hui écrits dans le code passent dans un document unique de réglages, modifiable depuis un écran « Site » du Back Office :
- deux adresses de réseaux sociaux ;
- les cinq informations de présentation du club ;
- les réponses des six questions de la FAQ ;
- sept photographies fixes.

**Côté API :** un module `site-settings` avec un document d'identifiant fixe, une lecture publique, une lecture et une modification partielle d'administration, et trois routes d'image par emplacement. Ces dernières réutilisent tel quel le mécanisme du portrait de 011.

**Côté Back Office :** une page `/site` en trois sections (Photographies, Réseaux sociaux, Textes), sur les composants d'image de 011.

**Côté Front Office :** `getSiteSettings()`, puis lecture dans les liens sociaux, la section « Qui sommes-nous ? » (nouvelle fiche du club), la FAQ et les sept emplacements photographiques. Sans réglage, la page garde son état actuel.

**Aucune dépendance ajoutée, aucune variable nouvelle.** Décisions : [research.md](./research.md) (R1 à R10).

## Technical Context

**Language/Version**: TypeScript ; Node 22. `apps/api` : TypeScript 6, NestJS. `apps/admin` et `apps/web` : TypeScript 5, Next.js 16.

**Primary Dependencies**: toutes déjà installées : `mongoose`, `class-validator` et `class-transformer`, `cloudinary` (par `StorageService`), MUI 9, `next/image`.

**Storage**: MongoDB Atlas, collection `site_settings` (un document) ; Cloudinary, dossier `site/pages/`.

**Testing**: aucun test automatisé (principe IX). [quickstart.md](./quickstart.md), `npm run lint`, `npm run build`.

**Target Platform**: Linux en local ; plus tard Vercel et Render.

**Project Type**: monorepo web (API NestJS, deux applications Next.js).

**Performance Goals**: modification visible sur le site en moins de deux minutes (SC-003) ; images servies à la taille d'affichage, comme 011.

**Constraints**:
- le navigateur n'appelle ni l'API ni le fournisseur ;
- `publicId` jamais renvoyé ;
- aucun texte de substitution ;
- base sans réglages : site identique à aujourd'hui.

**Scale/Scope**: un document ; 1 module API (6 routes) ; 1 écran du Back Office ; 8 sections du Front Office touchées ; 7 images au plus.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification | État |
|---|---|---|
| I. Source de vérité | La nouvelle entité, ses routes et la mise en forme de la fiche du club sont écrites dans `ARCHITECTURE.md` et `DESIGN.md` **avant** le code (section A), après validation de ce plan. | Conforme |
| II. Étapes validées | Spec validée le 2026-10-13, clarifications Q1 et Q2 closes. Ce plan s'arrête à la phase 1. | Conforme |
| III. Préférence pour le manuel | Aucun script : le document se crée au premier enregistrement ; les quatre réponses actuelles de la FAQ s'écrivent en base par la pré-saisie du formulaire (R3). | Conforme |
| IV. Simplicité technique | Champs nommés et listes fermées, pas d'éditeur de textes ni de magasin de paires (R1, R2). Mécanisme d'image de 011 réutilisé. Aucune dépendance. | Conforme |
| V. Architecture backend | Routes `/admin/site-settings` derrière JWT et `ADMIN` posés sur la classe ; stockage derrière `StorageService` ; lecture publique sans données internes. | Conforme |
| VI. Intégrité du modèle métier | Actions, actualités, membres, mandats, candidatures inchangés ; les réglages ne référencent rien. | Conforme |
| VII. Front Office | `DESIGN.md` suivi ; seul ajout : la fiche du club (R8), proposée ci-dessous et écrite dans `DESIGN.md` avant le code. Compositions inchangées. | Conforme, sous réserve de validation de R8 |
| VIII. Qualité et contenu | Rien d'inventé : une valeur absente ne s'affiche pas ; emplacements et replis conservés. | Conforme |
| IX. Tests | Aucun. | Conforme |
| X. Outillage | npm, `node_modules` par application. | Conforme |
| XI. Git | Branche `012-site-settings` créée par Spec Kit à la demande du porteur du projet ; aucun commit sans demande. | Conforme |
| XII. Non-régression | SC-002 et quickstart section 0 vérifient une base sans réglages. `/rejoindre` passe en rendu à la demande (R6), comme l'accueil, pour la même raison (décision 20). | Conforme |

**Résultat de la porte** : passée. **Re-vérification après la phase 1** : inchangée.

**Écarts assumés** :
- **Copie de quatre réponses de la FAQ dans le Back Office** (`src/content/site.ts`), en plus de `apps/web/src/content/join.ts`. Les applications ne partagent aucun paquet ; c'est la plus petite copie qui permet la pré-saisie (R3). Elle cesse de servir dès le premier enregistrement.
- **Six onglets sur téléphone** dans le Back Office au lieu de cinq (R7), à vérifier à 375 px.

## A. Alignements des documents de référence

**À appliquer après validation de ce plan, avant tout code :**

| Document | Changement |
|---|---|
| `ARCHITECTURE.md`, section 1 | Nouvelle entité **SiteSettings** : document unique `"site"`, champs de [data-model.md](./data-model.md), listes `FaqQuestion` et `SitePhotoSlot` |
| `ARCHITECTURE.md`, section 6 | Routes de [contracts/api-site-settings.md](./contracts/api-site-settings.md) : une ligne publique, une ligne d'administration, une ligne « Images » pour les emplacements |
| `ARCHITECTURE.md`, section 2 | `ImageFolder` : ajout de `pages` (`site/pages/`) |
| `ARCHITECTURE.md`, sections 10 et 11 | Front Office : `data/site-settings.ts` et correspondances ; Back Office : écran `/site` |
| `ARCHITECTURE.md`, section 14 | Décision verrouillée 21 : « Réglages du site : un document unique de champs nommés (réseaux sociaux, présentation du club, réponses de la FAQ, sept photographies fixes) ; aucun éditeur générique des textes ; les intitulés de la FAQ restent dans le code » |
| `ARCHITECTURE.md`, section 15 | Étape 11 : réglages du site |
| `DESIGN.md`, section 6 (« 01 Le club ») | Fiche du club, texte ci-dessous |
| `DESIGN.md`, « Points ouverts » 1 à 3 | Réseaux sociaux, photographies et présentation : se renseignent désormais dans le Back Office |

Texte proposé pour `DESIGN.md`, section 6, après le tableau des compositions de la Home :

> **La fiche du club.** Dans la section 01, sous le texte, les informations du club fournies dans le Back Office se lisent comme une fiche : une ligne par information, séparées par des filets encre de 1 px ; l'intitulé en étiquette Charcoal en marge gauche, la valeur en Open Sans 600 à droite, en chiffres tabulaires pour l'année et le nombre. Intitulés, dans cet ordre : Création, Club parrain, Membres, Réunions, Rythme. Une information absente n'a pas de ligne. Sans aucune information, la mention « Présentation à compléter » reste à sa place. Aucun chiffre monumental ni animé : le « 01 » au trait reste le seul grand chiffre de la section.

**À faire en fin d'implémentation** : `ARCHITECTURE.md` (en-tête « Implémenté »), `PROJECT_CONTEXT.md` (état, « Fait », section Back Office, « Hors de ce qui est construit »), `CLAUDE.md` (ligne d'état), `apps/admin/DESIGN.md` (section Components : « Carte d'emplacement photographique »), le guide publié (section « Réglages du site »).

## B. Conception

### B1. API (`apps/api`)

1. **`common/enums/`** : `faq-question.enum.ts` (`FaqQuestion`, six valeurs ; `REQUIRED_FAQ_QUESTIONS` les quatre qui ne se vident pas) et `site-photo-slot.enum.ts` (`SitePhotoSlot`, sept valeurs).
2. **`media/storage.service.ts`** : `ImageFolder` gagne `'pages'`. Rien d'autre dans `media/`.
3. **`site-settings/`** (nouveau module, importé par `AppModule`) :
   - `schemas/site-settings.schema.ts` : `_id: string` (« site »), sous-documents `social`, `club`, `faq`, `photos` (chaque emplacement `MediaRefSchema`, facultatif), `timestamps`, collection `site_settings` ;
   - `dto/update-site-settings.dto.ts` : sous-DTO imbriqués (`ValidateNested`, `Type`), `@Transform` des espaces de bord et de la chaîne vide vers `null`, règles et messages du contrat ; contrôle de non-vidage des quatre réponses obligatoires ;
   - `site-settings.service.ts` :
     - `findAdmin()` et `findPublic()` (document absent → vue vide) ;
     - `update(dto)` : `$set` et `$unset` calculés, `findOneAndUpdate` avec `upsert` ;
     - `setPhoto`, `updatePhoto`, `removePhoto`, calqués sur le portrait (R5), dossier `'pages'` ;
   - `site-settings.controller.ts` : `GET /site-settings` ;
   - `site-settings.admin.controller.ts` : `GET`, `PATCH`, et les trois routes `photos/:slot` avec `ParseEnumPipe` (exception `404`) et `ImageUploadInterceptor` ; gardes et rôle posés sur la classe.
4. **Messages** : ceux du contrat ; `StorageError` → `503` par le chemin existant.

### B2. Back Office (`apps/admin`)

1. `types/site-settings.ts` : `SiteSettings`, `FaqQuestionId`, `SitePhotoSlot`.
2. `content/site.ts` : intitulés des six questions et quatre réponses actuelles (copie commentée de `apps/web/src/content/join.ts`) ; libellés, formats, descriptions et largeurs conseillées des sept emplacements.
3. `components/AppShell.tsx` : entrée « Site ».
4. `app/(admin)/site/` :
   - `page.tsx` (composant serveur : `apiRead("/admin/site-settings")`, avis) ;
   - `actions.ts` (six actions serveur du contrat) ;
   - `_components/SitePhotoCard.tsx` (client, sur le modèle de `PortraitSection`, ratio et largeur par emplacement) ;
   - `_components/SocialForm.tsx`, `_components/ClubForm.tsx`, `_components/FaqForm.tsx` (clients, `useActionState`, sur le modèle des formulaires existants).
5. `apps/admin/DESIGN.md` : section Components, « Carte d'emplacement photographique ».

### B3. Front Office (`apps/web`)

1. `types/site-settings.ts` et `data/site-settings.ts` (`getSiteSettings`, contrat [front-office.md](./contracts/front-office.md)).
2. `components/layout/SocialLinks.tsx` : composant serveur asynchrone ; adresse lue dans les réglages, libellés de `config/site.ts`. `config/site.ts` perd les adresses vides (les noms restent).
3. `app/_sections/About.tsx` (+ CSS) : propriétés `club` et `photo` ; fiche du club ; mention seulement sans aucune information.
4. `app/rejoindre/_sections/JoinFaq.tsx` : propriété `answers` ; réponse enregistrée, sinon celle du code.
5. Photographies : `Opening`, `JoinField`, `ActionsOpening`, `MembersOpening`, `JoinOpening` reçoivent leur image (R9).
6. Pages : `app/page.tsx`, `app/actions/page.tsx`, `app/membres/page.tsx`, `app/rejoindre/page.tsx` ajoutent `getSiteSettings()` à leur `Promise.all` ; `/rejoindre` gagne `await connection()`.
7. `content/home.ts` : intitulés de la fiche du club.

### B4. Ordre de réalisation

Documents (section A), puis API (B1, vérifiée par `curl`), puis Back Office (B2), puis Front Office (B3), puis la documentation de fin.

## Project Structure

### Documentation (this feature)

```text
specs/012-site-settings/
├── spec.md
├── plan.md                 # ce fichier
├── research.md             # R1 à R10
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-site-settings.md
│   ├── admin-screens.md
│   └── front-office.md
├── checklists/requirements.md
└── tasks.md                # /speckit-tasks
```

### Source Code (repository root)

```text
apps/api/src/
├── app.module.ts
├── common/enums/     faq-question.enum.ts, site-photo-slot.enum.ts            (nouveaux)
├── media/            storage.service.ts (ImageFolder + 'pages')
└── site-settings/    site-settings.module.ts, site-settings.service.ts,
                      site-settings.controller.ts, site-settings.admin.controller.ts,
                      schemas/site-settings.schema.ts, dto/update-site-settings.dto.ts   (nouveaux)

apps/admin/
├── DESIGN.md
└── src/
    ├── types/        site-settings.ts (nouveau)
    ├── content/      site.ts (nouveau)
    ├── components/   AppShell.tsx
    └── app/(admin)/site/   page.tsx, actions.ts, _components/SitePhotoCard.tsx,
                            SocialForm.tsx, ClubForm.tsx, FaqForm.tsx           (nouveaux)

apps/web/src/
├── types/            site-settings.ts (nouveau)
├── data/             site-settings.ts (nouveau)
├── config/           site.ts
├── content/          home.ts
├── components/layout/SocialLinks.tsx
└── app/
    ├── page.tsx, actions/page.tsx, membres/page.tsx, rejoindre/page.tsx
    ├── _sections/          About.tsx (+ .module.css), Opening.tsx, JoinField.tsx
    ├── actions/_sections/  ActionsOpening.tsx
    ├── membres/_sections/  MembersOpening.tsx
    └── rejoindre/_sections/ JoinFaq.tsx, JoinOpening.tsx
```

**Structure Decision** : structure existante des trois applications ; un module NestJS de plus, comme chaque domaine ; `media` reste le seul à connaître le fournisseur ; `packages/` reste vide.

## Complexity Tracking

Aucune violation de la constitution. Les deux écarts assumés (copie de quatre réponses, sixième onglet) sont nommés dans le contrôle de constitution.
