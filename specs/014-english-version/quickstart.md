# Quickstart : vérifier la version anglaise

Vérification manuelle (constitution, principe IX). Contrats : [api-translations.md](./contracts/api-translations.md), [front-office.md](./contracts/front-office.md), [admin-screens.md](./contracts/admin-screens.md).

## Prérequis

- Node 22, dépendances installées, les trois applications lancées.
- Données : une action publiée **A** (résumé, description, impact, deux photographies), une actualité publiée **N**, une réponse de FAQ, une photographie fixe du site.
- Contrôle de fin : `npm run lint`, `npm run build`.

## 0. Non-régression française (SC-005, SC-006)

| Action | Résultat attendu |
|---|---|
| Ouvrir les cinq pages françaises et une page de détail | Identiques à avant 014, hormis « FR · EN » dans la une ; `<html lang="fr">` |
| `curl -s -o /dev/null -w "%{http_code}"` sur `/`, `/actions`, `/actualites`, `/membres`, `/rejoindre`, `/actions/<A>` | `200` |
| `curl -sI http://localhost:3000/fr/actions` | `308`, `location: /actions` |
| `/nimporte-quoi` | `404`, page introuvable en français |

## 1. Lire en anglais, sans traduction (récit 1)

| Action | Résultat attendu |
|---|---|
| Accueil → « EN » | `/en` ; `<html lang="en">` ; tous les textes fixes en anglais |
| Parcourir menu, filtres (`/en/actions?annee=…#liste`), pied de page, menu du téléphone | Toujours sous `/en` |
| Page `/en/actions/<A>` | Textes fixes en anglais ; titre, résumé, description, impact en français, avec `lang="fr"` et l'étiquette « In French » ; date « 14 March 2026 » |
| « FR » depuis `/en/actions/<A>?x=1` | `/actions/<A>?x=1` |
| `/en/nimporte-quoi`, `/en/actions/nexiste-pas` | `404`, page introuvable en anglais |
| Source d'une page | `<link rel="alternate" hreflang="fr">`, `hreflang="en"`, `hreflang="x-default"` |
| Recherche « In French » sur `/en`, `/en/membres`, `/en/rejoindre` sans contenu | Aucun texte fixe français (SC-002) |

## 2. Traduire (récit 2)

| Action | Résultat attendu |
|---|---|
| Fiche de A → English : titre et résumé → Enregistrer | Avis ; `/en/actions` et `/en/actions/<A>` en anglais pour ces champs ; description et impact toujours « In French » ; `/actions/<A>` inchangé |
| Panneau d'une photographie de A → texte alternatif (anglais) | `alt` anglais sur `/en/actions/<A>`, français sur `/actions/<A>` |
| Écran Site → réponse anglaise de `frequence` | FAQ anglaise ; question française masquée si la réponse française est vide |
| Vider le titre anglais de A | Retour au titre français, signalé |
| `curl /api/v1/actions/<A>` | `en` avec les seuls champs saisis |
| Titre anglais de 121 caractères (via `curl` avec jeton) | `400`, `details[].field = "en.title"` |

## 3. Candidater en anglais (récit 3)

| Action | Résultat attendu |
|---|---|
| `/en/rejoindre`, envoyer vide | Erreurs en anglais sous chaque champ, précédées de « Error » |
| CV de 6 Mo | Message anglais du fichier trop lourd |
| Envoi valide | Confirmation en anglais ; candidature visible dans le Back Office |

## 4. Téléphone et accessibilité

| Action | Résultat attendu |
|---|---|
| 375 px, `/en/actions/<A>` avec un titre anglais long | Pas de débordement |
| Sélecteur au clavier | Atteignable, focus visible, langue courante annoncée |

## 5. Nettoyage

Retirer les traductions et les contenus de test.
