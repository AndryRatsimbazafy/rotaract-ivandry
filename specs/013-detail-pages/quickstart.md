# Quickstart : vérifier les pages de détail

Vérification manuelle, à la place des tests automatisés (constitution, principe IX). Contrat : [front-office.md](./contracts/front-office.md).

## Prérequis

- Node 22, dépendances installées ; `apps/api/.env`, `apps/admin/.env.local`, `apps/web/.env.local`.
- Démarrage : `npm run dev:api`, `npm run dev:admin`, `npm run dev:web`.
- Données de test, saisies dans le Back Office :
  - **A1** : action publiée, résumé, description de trois paragraphes, impact avec « Objectif » et « Résultats » seulement, deux partenaires, trois photographies avec légendes ;
  - **A2** : action publiée sans photographie ni description ;
  - **A3** : action non publiée ;
  - **N1** : actualité publiée le jour J à 23 h 30 (heure de Madagascar), lieu, texte de trois paragraphes, deux photographies ;
  - **N2** : actualité publiée sans photographie ni lieu.
- Contrôle de fin : `npm run lint` et `npm run build`.

## 1. Action (récit 1)

| Action | Résultat attendu |
|---|---|
| Accueil → cliquer sur le titre de A1, puis sur sa photographie | `/actions/<slug de A1>` dans les deux cas |
| Page Actions → « Lire la suite » de A1 | Même page ; la liste ne montre plus ni description, ni impact, ni photographies suivantes |
| Page de A1 | Marge : « Action », année Rotary, date « jj mois aaaa » identique à celle saisie, domaines ; titre ; photographie principale ; accroche ; trois paragraphes ; fiche d'impact à deux lignes (Objectif, Résultats) ; partenaires ; planche de deux photographies avec légendes |
| Page de A2 | Gabarit 3:2 « Photographie à venir » dans l'ouverture ; aucune fiche d'impact, aucune planche, aucun texte de substitution |
| Ouvrir l'adresse de A1 dans une fenêtre privée | La page s'affiche directement |
| Source de la page de A1 (`<head>`) | `<title>` « <titre> \| Rotaract Club Ivandry », `og:type` article, `og:image` = adresse Cloudinary de la photographie principale, description ≤ 160 caractères |
| Téléphone (375 px), page de A1 | Pas de défilement horizontal ; marge passée au-dessus du titre ; aucune image servie de plus de 500 Ko (onglet Réseau) |

## 2. Actualité (récit 2)

| Action | Résultat attendu |
|---|---|
| Accueil → ligne de N1 dans le registre | `/actualites/<slug de N1>` |
| Page Actualités → titre de N1 dans le registre, puis « Lire la suite » à la une | Même page ; le registre ne montre plus le texte ni les photographies |
| Page de N1 | Jour monumental = jour J (pas J+1), « mois aaaa », type ; titre ; lieu ; photographie 16:9 ; chapeau ; trois paragraphes ; deuxième photographie en marge (sous le texte à 375 px) |
| Page de N2 | Ouverture typographique et texte, sans gabarit photographique ni ligne de lieu |
| `<head>` de N2 | `og:image` = ouverture de l'accueil des réglages du site si elle existe, sinon absente |

## 3. Introuvable et panne (récit 3)

| Action | Résultat attendu |
|---|---|
| `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/actions/<slug de A3>` | `404` ; dans le navigateur, la page introuvable du site |
| Même chose pour `/actions/nexiste-pas`, `/actualites/nexiste-pas`, `/nimporte-quoi` | `404`, même page |
| Dépublier A1 dans le Back Office, attendre ~60 s, rouvrir son adresse | `404` |
| Arrêter l'API ; ouvrir une page de détail déjà lue | La version lue reste affichée |
| API arrêtée ; ouvrir une page de détail jamais lue (nouveau slug) | Page d'erreur du site, « Réessayer » ; pas la page introuvable |
| `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/actions` | `200` : la liste n'a pas changé d'adresse |

## 4. Listes inchangées (SC-006)

| Action | Résultat attendu |
|---|---|
| Page Actions : filtre par année puis par domaine | Mêmes résultats qu'avant ; ancre `#liste` conservée |
| Page Actualités : rubrique et archives | Inchangés |
| Survol (souris) d'une photographie de la liste des actions | Grossissement de 3 % ; aucun sur téléphone |

## 5. Nettoyage

Supprimer A1, A2, A3, N1, N2 dans le Back Office ; vérifier qu'aucun fichier de test ne reste chez Cloudinary.
