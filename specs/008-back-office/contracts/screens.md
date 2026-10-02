# Contrat : écrans du Back Office

Ce que l'administrateur voit et peut faire, adresse par adresse. Interface en français. Opérations de l'API : [api-usage.md](./api-usage.md). Formes : [data-model.md](../data-model.md).

## Cadre commun (espace protégé)

- Barre latérale : Accueil, Années Rotary, Membres, Actions, Actualités, Candidatures ; l'entrée en cours est marquée (`aria-current="page"`).
- Barre supérieure : titre de l'écran, email du compte, « Se déconnecter ».
- Sous 900 px de large : la barre latérale devient un tiroir ouvert par un bouton « Menu ».
- Chaque liste : état d'attente, d'erreur (« Réessayer »), vide (« aucun élément » ou « aucun résultat », avec « Effacer les filtres »).
- Chaque suppression : dialogue de confirmation nommant l'élément.
- Chaque opération réussie : avis en bas de l'écran.

## Écrans

### `/connexion`

Champs : email, mot de passe. Bouton « Se connecter ». Message « Votre session a expiré. Reconnectez-vous. » quand `?motif=expiree`. Ni inscription, ni mot de passe oublié. Déjà connecté : redirection vers `/`.

### `/` — Accueil

Cinq accès : Années Rotary, Membres, Actions, Actualités, Candidatures, chacun avec une phrase de description. Aucun chiffre.

### `/annees`

| Colonne | Source |
|---|---|
| Année | `label` |
| Début, fin | `startDate`, `endDate` |
| En cours | pastille si `isCurrent` |
| Actions | Supprimer |

« Nouvelle année » : dialogue, un champ « Année de début » (entier). Aucune modification.

### `/membres`

Colonnes : Nom, Prénom, Profession ou études, Email, Téléphone, actions (Ouvrir, Supprimer). Recherche ; filtres Année, Fonction ; tri Nom, Date de création. Boutons « Nouveau membre » et « Ordre d'une année ».

### `/membres/nouveau`, `/membres/[id]`

Formulaire : Prénom*, Nom*, Profession ou études, Email, Téléphone. Aucun portrait.

Sur la fiche, section « Mandats » : un mandat par ligne (Année, Fonctions, actions Modifier les fonctions, Supprimer), de l'année la plus récente à la plus ancienne ; « Ajouter un mandat » (Année*, Fonctions : dix cases à cocher). L'ordre n'apparaît pas ici ; un lien mène à l'ordre de l'année.

Suppression du membre : « Ses mandats seront supprimés avec lui. »

### `/membres/ordre?annee=<label>`

Choix de l'année, puis liste ordonnée : rang, nom et prénom, fonctions, boutons « Monter » et « Descendre ». « Enregistrer l'ordre » ; « Annuler les changements ». Sans année choisie : invitation à en choisir une. Année sans mandat : état vide.

### `/actions`

Colonnes : État (Brouillon, Publié), Titre, Date, Année, Ordre, actions (Ouvrir, Publier ou Dépublier, Supprimer). Recherche ; filtres Année, Domaine, Publication ; tri Date, Titre, Date de création.

### `/actions/nouvelle`, `/actions/[id]`

| Groupe | Champs |
|---|---|
| Contenu | Titre*, Slug, Résumé, Description |
| Calendrier | Date*, Année Rotary* (proposée d'après la date, modifiable ; avertissement si la date est hors de l'année) |
| Domaines | sept cases à cocher |
| Impact (facultatif) | Objectif, Bénéficiaires, Lieu, Période, Partenaires (un par ligne), Résultats |
| Publication | Publié (interrupteur), Ordre manuel ; « Première publication le … » si elle existe |

Aucune photographie. Slug modifié sur une action publiée : dialogue « L'adresse publique de cette action va changer. »

### `/actualites`

Colonnes : État, Type, Titre, Date et heure (Madagascar), Année, actions (Ouvrir, Publier ou Dépublier, Supprimer). Recherche ; filtres Année, Type, Publication ; tri Date, Titre, Date de création. Les archives se consultent par le filtre Année.

### `/actualites/nouvelle`, `/actualites/[id]`

| Groupe | Champs |
|---|---|
| Contenu | Titre*, Slug, Type* (cinq valeurs), Lieu, Résumé, Contenu |
| Calendrier | Date et heure* — « heure de Madagascar » ; Année Rotary* (proposée, modifiable, avertissement d'écart) |
| Publication | Publié ; « Première publication le … » |

Ni photographie, ni ordre, ni impact, ni domaine, ni date de fin.

### `/candidatures`

Colonnes : Nom, Prénom, Email, Situation, Date de candidature, action Ouvrir. Recherche ; période « Du », « Au » ; tri Date de candidature, Nom. Aucun filtre par situation, aucun bouton de création.

### `/candidatures/[id]`

Prénom, Nom, Email, Téléphone, Situation, Date de candidature ; CV : nom d'origine, type, taille. Boutons : « Télécharger le CV », « Contacter par email », « Supprimer » (« Le CV sera supprimé avec la candidature. »). Aucune modification, aucun état.

Alertes : `?cv=introuvable` → « Le fichier du CV est introuvable. » ; `?cv=indisponible` → « Service indisponible. » ; échec de suppression `503` → « Service indisponible. », la fiche reste affichée.

### `/acces-refuse`

« Accès refusé. » et « Se déconnecter ».

### Introuvable

Dans l'espace protégé : « Ressource introuvable. » et un retour à la liste du domaine.

## Gestionnaires de route

| Adresse | Effet |
|---|---|
| `GET /candidatures/[id]/cv` | Renvoie le fichier en pièce jointe ; en cas d'échec, redirige vers la fiche avec `?cv=` |
| `GET /session/fin` | Efface le cookie, redirige vers `/connexion` (avec `motif` s'il est fourni) |

## Avis

| Code | Texte |
|---|---|
| `cree` | « Enregistrement créé. » |
| `modifie` | « Modifications enregistrées. » |
| `supprime` | « Suppression effectuée. » |
| `publie` | « Contenu publié. » |
| `depublie` | « Contenu dépublié. » |
| `ordre` | « Ordre enregistré. » |
| `introuvable` | « Ressource introuvable. » (message de l'API), après une écriture sur une ressource supprimée entre-temps |

## Messages propres au Back Office

Les messages de l'API sont affichés tels quels. Le Back Office n'ajoute que ceux-ci (plan, section C, P3) :

| Situation | Message |
|---|---|
| `409` à la suppression d'une année | « Cette année ne peut pas être supprimée : des mandats, des actions ou des actualités s'y rattachent. » |
| `409` à la création d'un mandat | « Ce membre a déjà un mandat pour cette année. » |
| `409` sur le slug d'une action ou d'une actualité | « Ce slug est déjà utilisé. » |
| Ordre devenu incomplet | « La liste a changé. Rechargez-la avant d'enregistrer l'ordre. » |
| Erreur réseau, délai, erreur interne | « Une erreur est survenue. Réessayez. » |
| Session expirée | « Votre session a expiré. Reconnectez-vous. » |
| CV absent du stockage | « Le fichier du CV est introuvable. » |
| Date hors de l'année choisie | « Cette date ne tombe pas dans l'année Rotary choisie. » |
| Année proposée | « Année proposée d'après la date. » |
| Aucune année | « Créez d'abord une année Rotary. » |
| Slug d'un contenu publié | « L'adresse publique de ce contenu va changer. » |
