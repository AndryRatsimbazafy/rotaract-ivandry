# Contrat : recherche rapide

## Ouverture

| Déclencheur | Effet |
|---|---|
| Ctrl+K (⌘K sur Mac), y compris dans un champ | Ouvre le dialogue de recherche, champ prêt à la saisie |
| Clic sur le champ ou le bouton de recherche de la barre supérieure | Idem |
| Échap, clic à côté | Ferme ; la saisie en cours sur l'écran n'est pas touchée |

Sur téléphone, le dialogue est plein écran.

## Résultats

- **Écrans** : les six entrées de navigation dont le libellé contient le texte. Le filtrage se fait dans le navigateur, sans appel au serveur. Sans texte, les six sont proposées.
- **Contenus** : à partir de 2 caractères, environ 250 ms après la dernière frappe, appel de l'action serveur `quickSearch`. Groupes dans cet ordre : Membres, Actions, Actualités, Candidatures ; 5 résultats au plus par groupe ; un groupe vide est omis.
- **Navigation** : ↑ ↓ déplacent le résultat surligné, Entrée ou clic ouvre son adresse et ferme le dialogue.
- **Attente** : barre de progression fine sous le champ.
- **Aucun résultat** : « Aucun résultat ».
- **Accessibilité** : liste annoncée (`role="listbox"`, option active par `aria-activedescendant`).

## Action serveur `quickSearch`

```ts
// "use server" — apps/admin/src/app/(admin)/actions.ts
quickSearch(q: string): Promise<QuickSearchResult>

type QuickSearchResult = {
  members: QuickHit[];
  actions: QuickHit[];
  news: QuickHit[];
  applications: QuickHit[];
};
type QuickHit = { id: string; primary: string; secondary?: string; href: string };
```

| Règle | Détail |
|---|---|
| Entrée | `q` est épuré des espaces aux extrémités ; moins de 2 caractères → quatre listes vides, sans appel à l'API |
| Lectures | En parallèle : `GET /admin/members?q=&limit=5`, `/admin/actions?q=&limit=5`, `/admin/news?q=&limit=5`, `/admin/applications?q=&limit=5` (tris par défaut) |
| Échec partiel | Une lecture refusée ou en erreur donne une liste vide pour sa nature ; les autres sont renvoyées |
| Session | `401` : traitement existant d'`apiRead` (session effacée, retour à la connexion avec « Votre session a expiré. Reconnectez-vous. ») |
| `primary` | Membre et candidature : « Prénom Nom » ; action et actualité : titre |
| `secondary` | Membre : email ou rien ; action : « <année> · Publié/Brouillon » ; actualité : « <type> · <année> » ; candidature : date de candidature (Madagascar) |
| `href` | `/membres/<id>`, `/actions/<id>`, `/actualites/<id>`, `/candidatures/<id>` |
| Confidentialité | Le terme n'apparaît dans aucune adresse ; la journalisation des arguments des actions serveur reste coupée (`next.config.ts`) |

Le navigateur n'appelle jamais l'API : seule l'action serveur le fait, avec le jeton du cookie.
