# Modèle de données : refonte visuelle du Back Office

Aucune entité métier nouvelle, aucun champ nouveau, aucune modification de l'API. Les formes des ressources restent celles de `specs/008-back-office/data-model.md` et des contrats 002 à 007.

Cette fonctionnalité n'introduit que des états d'interface, décrits ici.

## Préférence de thème

| Élément | Valeur |
|---|---|
| Valeurs | `light`, `dark`, `system` |
| Défaut | `system` |
| Lieu | `localStorage` du navigateur, géré par MUI (`useColorScheme`) |
| Portée | Un navigateur ; jamais envoyée au serveur ni à l'API |

## Sélection d'une liste (paramètre d'adresse)

| Paramètre | Écrans | Règle |
|---|---|---|
| `selection` | `/annees`, `/membres`, `/actions`, `/actualites`, `/candidatures` | Identifiant de la ligne choisie. Elle n'est prise en compte que si elle correspond à une ligne affichée ; sinon elle est ignorée (aperçu en invitation). Une sélection remplace l'adresse sans ajouter d'entrée à l'historique. Fermer l'aperçu la retire. |

`selection` s'ajoute aux paramètres existants (`q`, `annee`, `fonction`, `domaine`, `type`, `publie`, `du`, `au`, `tri`, `page`, `avis`) sans les changer. Elle est conservée dans `listPath` (adresse de retour depuis une fiche). Changer la recherche, un filtre, le tri ou la page la retire.

## Contenu de l'aperçu

L'aperçu est lu par l'opération de détail existante. La forme est celle de `specs/008-back-office/data-model.md`.

| Écran | Lecture | Contenu affiché |
|---|---|---|
| Années | aucune (ligne de la liste) | Label, début, fin, marque « En cours » |
| Membres | `GET /admin/members/:id` | Prénom, nom, profession ou études, email, téléphone ; mandats (année, fonctions), du plus récent au plus ancien |
| Actions | `GET /admin/actions/:id` | État, titre, date, année, ordre, résumé, domaines ; impact quand il existe (rubriques renseignées seulement) ; première publication |
| Actualités | `GET /admin/news/:id` | État, type, titre, date et heure (Madagascar), année, lieu, résumé ; première publication |
| Candidatures | `GET /admin/applications/:id` | Prénom, nom, email, téléphone, situation, date de candidature ; CV : nom d'origine, type, taille |

**États de l'aperçu**

| État | Quand |
|---|---|
| invitation | Aucune sélection valide |
| attente | Lecture en cours |
| affiché | Lecture réussie |
| introuvable | `404` à la lecture : « Ressource introuvable. » |
| erreur | Autre échec : « Une erreur est survenue. Réessayez. » avec « Réessayer » |

Un `401` suit la règle existante : la session est effacée et l'administrateur est ramené à la connexion.

## Résultat de la recherche rapide

Renvoyé par l'action serveur `quickSearch` ; voir [contracts/quick-search.md](./contracts/quick-search.md).

| Champ | Type | Notes |
|---|---|---|
| `kind` | `"member" \| "action" \| "news" \| "application"` | Nature |
| `id` | string | Identifiant de la ressource |
| `primary` | string | Prénom et nom, ou titre |
| `secondary` | string ou absent | Année et état, type, email ou date |
| `href` | string | Adresse interne de la fiche |

## Chiffres de l'accueil

| Case | Lecture | Lien |
|---|---|---|
| Membres de l'année en cours | `GET /admin/members?year=<label courant>&limit=1` → `meta.total` | `/membres?annee=<label>` |
| Actions publiées | `GET /admin/actions?published=true&limit=1` → `meta.total` | `/actions?publie=true` |
| Actualités publiées | `GET /admin/news?published=true&limit=1` → `meta.total` | `/actualites?publie=true` |
| Candidatures | `GET /admin/applications?limit=1` → `meta.total` | `/candidatures` |

Une valeur manquante (échec de lecture, aucune année en cours) s'affiche « — », jamais `0`.
