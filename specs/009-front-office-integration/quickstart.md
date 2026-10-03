# Quickstart : vérifier l'intégration du Front Office

Guide de vérification manuelle structurée. Il remplace les tests automatisés (constitution, principe IX). Fonctions et opérations : [contracts/data-layer.md](./contracts/data-layer.md). Formulaire : [contracts/application-form.md](./contracts/application-form.md).

## Prérequis

- Node.js 22, dépendances installées depuis la racine (`npm install`).
- `apps/api/.env` renseigné ; `apps/admin/.env.local` et **`apps/web/.env.local`**, créés à la main : `API_URL=http://localhost:4000/api/v1`.
- L'API (`npm run dev:api`) et le Back Office (`npm run dev:admin`) en fonctionnement ; le compte d'administration.
- **Le site se vérifie depuis son build** : `npm run build:web`, puis `npm run start --workspace=web`. Le cache de `next dev` diffère : la fraîcheur et l'indisponibilité ne s'y vérifient pas.
- Des fichiers factices, hors du dépôt : un PDF, un DOCX, un fichier de 5 242 880 octets et un de 5 242 881 octets commençant par `%PDF-`, un fichier texte renommé en `.pdf`.

Tout le contenu se saisit dans le Back Office, avec des données factices, **supprimées à la fin** (section 10). Après chaque changement dans le Back Office, attendre 60 secondes puis recharger la page du site deux fois.

## 1. Base vide

| Action | Résultat attendu |
|---|---|
| Ouvrir `/`, `/actions`, `/actualites`, `/membres`, `/rejoindre` | Chaque page garde sa composition ; emplacements et « Contenu à venir » comme avant ; aucun profil de démonstration ; aucune occurrence de « Donnée à venir ». |
| `/actions` | Pas de section « Ce que les actions ont changé ». |
| `/membres` | « Les membres de l'année … ne sont pas encore publiés. » ; pas d'index des fonctions. |
| Année affichée en ouverture, sans année dans l'API | L'année Rotary du calendrier. |
| Outils du navigateur, onglet réseau | Aucune requête vers le port 4000. |

## 2. Actions

Créer les années 2025 et 2026. Créer et publier : une action A (2026-2027, deux domaines, résumé, description en deux paragraphes, impact à deux rubriques) ; une action B (2025-2026, sans résumé, sans impact, un domaine) ; une action C en brouillon ; une action D datée de 2026 mais rattachée à 2025-2026.

| Action | Résultat attendu |
|---|---|
| `/actions` | A, B et D ; C absente partout ; nombre affiché : 3. |
| Action A | Deux domaines nommés ; fiche dépliable avec la description en deux paragraphes, puis les deux rubriques d'impact et aucune autre. |
| Action B | Ni résumé, ni ligne d'impact, ni fiche ; aucun texte de remplacement ; gabarit photographique. |
| Filtre 2025-2026 | B et D : D suit l'année choisie par l'administrateur. |
| Filtre par un domaine d'A, puis combiné à 2025-2026 | A seule ; puis « Aucune action ne correspond à ces filtres. » et le lien de retour. |
| Adresse `?annee=abc`, `?domaine=inconnu` | État « aucun résultat », sans erreur. |
| Donner un ordre 1 à B dans le Back Office | B passe en tête sur `/actions` et sur l'accueil. |

## 3. Actualités et fuseau

Créer et publier : N1 « Réunion » datée du 15/09/2026 à 18:30 ; N2 « Événement » du 10/10/2026 à 01:00 ; N3 « Formation » du 01/11/2026 à 00:30 ; N4 « Annonce » rattachée à 2025-2026 bien que datée de 2026 ; N5 en brouillon ; une actualité de type « Participation ».

| Action | Résultat attendu |
|---|---|
| `/actualites` | La plus récente à la une ; les autres dans le fil, groupées par mois ; N5 absente ; nombre exact. |
| N2 | Jour **10**, mois octobre (l'instant enregistré est le 9 à 22:00 UTC). |
| N3 | Rangée sous **novembre** (enregistrée le 31 octobre à 21:30 UTC). |
| Toute actualité | Aucune heure affichée. |
| Changer le fuseau de l'ordinateur, recharger | Mêmes jours et mêmes mois. |
| Rubriques | Cinq libellés ; choisir « Réunion » : N1 à la une. |
| Archives | 2026-2027 et 2025-2026 avec leurs nombres d'actualités publiées ; N4 sous 2025-2026. |
| « Lire la suite » | Présent seulement pour une actualité qui a un contenu ; paragraphes séparés. |
| Actualité sans lieu ni résumé | Éléments absents, sans texte de remplacement. |
| Rubrique sans actualité ; `?rubrique=inconnue` | « Aucune actualité ne correspond à ce choix. » |

## 4. Membres

Créer cinq membres ; mandats 2026-2027 pour quatre d'entre eux (un à deux fonctions, un sans fonction, un sans profession) ; mandats 2025-2026 pour deux, dont un avec une fonction différente. Régler l'ordre de 2026-2027.

| Action | Résultat attendu |
|---|---|
| `/membres` | 2026-2027 par défaut ; quatre personnes dans l'ordre réglé ; fonctions en libellés ; gabarits de portrait. |
| Inverser deux personnes dans le Back Office | Nouvel ordre sur le site après le délai. |
| Membre sans fonction ; sans profession | Présent, sans fonction ; ligne de profession absente. |
| Choisir 2025-2026 | Deux personnes ; la fonction affichée est celle de cette année-là. |
| Index des fonctions | Dix fonctions ; les personnes qui les tiennent ; « Non attribuée » sinon. |
| Code source de la page | Aucun email, aucun téléphone. |
| `?annee=2020-2021` | État vide de l'annuaire. |

## 5. Accueil

| Action | Résultat attendu |
|---|---|
| `/` avec le contenu des sections 2 à 4 | Trois actions (les premières de `/actions`, dans le même ordre) ; trois actualités les plus récentes, jours en heure de Madagascar ; aperçu des membres de l'année en cours dans l'ordre du club. |
| Dépublier jusqu'à ne garder qu'une action | Une seule action sur l'accueil, aucun emplacement fictif à côté. |
| Année affichée | Celle que l'API donne pour « en cours ». |
| Sections éditoriales | Identiques à avant. |

## 6. Candidature

| Action | Résultat attendu |
|---|---|
| Formulaire complet, PDF | « Candidature envoyée » ; formulaire vidé ; dans le Back Office, mêmes données et CV identique (empreinte). |
| Même envoi avec le DOCX | Accepté. |
| **Fichier de 5 242 880 octets** | Accepté ; retrouvé dans le Back Office ; CV téléchargé identique par empreinte. **Vérification obligatoire** : si elle échoue, l'implémentation s'arrête et l'incompatibilité est signalée, sans changer de mécanisme. |
| Fichier de 5 242 881 octets (contrôle du formulaire contourné, par exemple JavaScript désactivé ou champ modifié) | Message de taille sous le champ du CV. |
| Fichier plus gros choisi normalement | « Le fichier est trop volumineux. », sans envoi. |
| Fichier texte renommé en `.pdf` | « Le format du CV n'est pas accepté. » sous le champ du CV. |
| Champs vides, email « abc », téléphone « 12 » | Messages sous les champs, focus sur le premier ; rien n'est transmis. |
| Téléphone « 0340000000 abc » | Refusé avant l'envoi (règle de l'API). |
| Pendant l'envoi | Dès le clic : bouton inactif et « Envoi en cours… » ; puis un résultat clair, de succès ou d'échec (SC-007 : le retour d'interface arrive en moins de 10 secondes). |
| Vingt-et-unième envoi dans l'heure | « Trop de demandes. Veuillez réessayer plus tard. » ; saisie conservée. |
| API lancée avec un secret de stockage faux | « Service temporairement indisponible. Veuillez réessayer plus tard. » ; saisie conservée ; aucune confirmation ; aucune candidature de plus. |
| API arrêtée | Même message. |
| Onglet réseau et code source | Requêtes vers le site seulement ; aucune occurrence de « cloudinary », d'adresse d'API ni de référence de stockage. |
| Reste de la page Rejoindre | Identique à avant ; plus de message « non relié ». |

## 7. Fraîcheur (SC-013)

| Action | Résultat attendu |
|---|---|
| Publier une action, noter l'heure, recharger `/actions` toutes les 15 secondes | Visible en une minute environ ; tolérance de vérification : 90 secondes. Aucune garantie à la seconde près. |
| La dépublier | Disparue dans la même tolérance. |
| Recharger dix fois en vingt secondes, journal de l'API ouvert | Pas une lecture par visite : les visites sont servies par le cache. |

## 8. Listes longues (SC-014)

Créer et publier 120 actions et 120 actualités, réparties sur deux années. Vu leur nombre, elles peuvent être créées par les opérations d'administration de l'API (les mêmes que celles du Back Office) plutôt qu'à la main ; elles sont supprimées en section 10.

| Action | Résultat attendu |
|---|---|
| `/actions` | 120 actions présentes, dans l'ordre de l'API ; nombre affiché : 120 ; aucune pagination, aucun « voir plus ». |
| `/actualites` | Une à la une, 119 dans le fil ; nombre affiché : 120 ; mois en marge corrects. |
| Journal de l'API à la première lecture | Deux demandes par liste (100, puis 20), `limit=100`. |
| Filtre par année | Liste réduite à l'année ; nombres des archives exacts. |
| Liste partiellement lue (une page suivante illisible et jamais mise en cache) | Difficile à provoquer à la main : vérifié par relecture du code et, si possible, en arrêtant l'API entre deux lectures après un build. Attendu : les éléments lus sont affichés avec la phrase de liste incomplète ; jamais une liste vide, jamais sans signalement. Noter honnêtement ce qui a pu être observé. |
| Défilement à 375 px | Page longue mais lisible, sans débordement. |

## 9. API indisponible

| Action | Résultat attendu |
|---|---|
| Site déjà consulté, puis API arrêtée ; recharger les pages plusieurs fois, au-delà d'une minute | Le contenu déjà lu reste affiché, y compris les 120 éléments d'une liste longue ; aucun message technique. |
| Relancer l'API | Le contenu se remet à jour après le délai. |
| Reconstruire le site (`build`) et le lancer, API arrêtée | Le build réussit ; les pages s'affichent à l'état vide, composées ; à noter comme limite connue. |
| `/rejoindre`, API arrêtée | Page complète ; seul l'envoi échoue, avec son message. |

## 10. Forme, nettoyage et fin d'étape

| Action | Résultat attendu |
|---|---|
| Les cinq pages à 1280, 768 et 375 px, avec un titre de 120 caractères, un résumé de 500, sept domaines, dix fonctions | Aucune page ne déborde ; aucune superposition de texte ; compositions de `DESIGN.md`. |
| Parcours au clavier : filtres, fiches dépliables, formulaire | Tout est atteignable ; focus visible ; erreurs et résultat annoncés. |
| Changement de filtre avec le cache vide | Squelette aux dimensions du contenu, sans saut. |
| Supprimer par le Back Office tout le contenu de vérification | Base : `applications`, `news`, `actions`, `members`, `membermandates`, `rotaryyears` à 0 ; `admins` à 1 ; aucun fichier de CV. |
| `npm run lint` ; `npm run build:web`, `build:admin`, `build:api` | Aucune erreur. |
| `git status` | Aucun fichier modifié dans `apps/api`, `apps/admin` ; aucun `.env` ni `.env.local` listé ; `apps/web/package.json` inchangé. |
| Recherche de la valeur d'`API_URL` dans `apps/web/.next/static` | Aucune. |
| `DESIGN.md` et `ARCHITECTURE.md` | Seuls les passages du plan, section A, ont changé. |
