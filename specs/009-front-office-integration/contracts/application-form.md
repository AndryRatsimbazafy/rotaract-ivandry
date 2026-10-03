# Contrat : formulaire de candidature

Ce que la personne voit selon l'issue de l'envoi. Contrat de l'API : `specs/007-applications/contracts/applications.md`. Forme des messages : `DESIGN.md`, section 9 (une erreur sous son champ, précédée du mot « Erreur » ; une phrase calme, la cause et la correction).

## Chemin

Navigateur → Server Action du site → `POST /applications` de l'API. Le navigateur n'échange qu'avec le site. Le fichier est relayé, jamais conservé ni journalisé par le site.

## Champs envoyés à l'API

Exactement six, et aucun autre : `firstName`, `lastName`, `email`, `phone`, `applicantStatus` (`etudiant` ou `professionnel`), `cv` (le fichier, avec son nom d'origine).

## Contrôles avant l'envoi (dans le formulaire)

Ils évitent un aller-retour ; l'API reste l'autorité.

| Champ | Contrôle | Message (existant, sauf mention) |
|---|---|---|
| Prénom, nom | Présent | « Indiquez votre prénom. » / « Indiquez votre nom. » |
| Email | Présent, forme d'une adresse | « Indiquez votre adresse email. » / « Vérifiez l'adresse email : elle doit ressembler à nom@exemple.org. » |
| Téléphone | Présent ; **règle de l'API** : chiffres, espaces, `+`, `-`, `.`, parenthèses, au moins 8 chiffres | « Indiquez votre numéro de téléphone. » / « Vérifiez le numéro de téléphone : il doit contenir au moins huit chiffres. » |
| Situation | Choisie | « Choisissez votre statut. » |
| CV | Présent, non vide | « Joignez votre CV. » |
| CV | **5 Mo au plus** | **Nouveau** : « Le fichier est trop volumineux. » |

## Issues de l'envoi

| Réponse de l'API | Où | Message |
|---|---|---|
| `201` | Zone de résultat | Existant : « Candidature envoyée » — « Merci. Le club vous invite ensuite à une réunion ou à une action. » Le formulaire se vide. |
| `400` avec `details` | Sous chaque champ désigné | Le message de l'API, tel quel (contrat 007). |
| `400` sans détail utilisable | Zone de résultat | Le message d'indisponibilité ci-dessous. |
| `413` | Sous le champ du CV | Le même que le contrôle de taille : « Le fichier est trop volumineux. » |
| `415` | Sous le champ du CV | **Nouveau** : « Le format du CV n'est pas accepté. » |
| `429` | Zone de résultat | **Nouveau** : « Trop de demandes. Veuillez réessayer plus tard. » |
| `503`, autre code, réseau, délai | Zone de résultat | **Nouveau** : « Service temporairement indisponible. Veuillez réessayer plus tard. » |

Dans tous les cas d'échec : la saisie est conservée, aucune confirmation n'est affichée, le focus va au premier champ en erreur s'il y en a un.

Les cinq textes marqués « Nouveau » dans ce document (les quatre ci-dessus et « Envoi en cours… ») ont été validés le 2026-10-02. Ce sont des messages d'interface du Front Office : ils ne modifient aucun contrat de l'API.

## Textes modifiés ou supprimés

| Texte | Changement |
|---|---|
| « Formulaire vérifié, mais pas encore envoyé » et sa phrase | Supprimés |
| Aide du champ CV : « Un fichier PDF ou Word. » | Devient : « Un fichier PDF ou Word, de 5 Mo au plus. » |
| Libellé du champ de situation (« Statut ») | Inchangé ; seul le nom technique du champ devient `applicantStatus` |

## Pendant l'envoi

Dès le clic, le bouton est inactif et la zone de résultat (`role="status"`) annonce « Envoi en cours… » (**nouveau**). Un second envoi est impossible. L'attente se termine toujours par un résultat clair, de succès ou d'échec (SC-007 : c'est ce retour d'interface que le critère mesure, non la durée du transfert).

## Ce que le navigateur ne reçoit jamais

Le corps d'une réponse de l'API, son adresse, un identifiant ou une adresse de stockage, le nom du prestataire. La Server Action ne renvoie qu'une issue typée et, pour un refus par champ, les messages de validation.

## Réglage

`apps/web/next.config.ts` admet un corps de 6 Mo pour la Server Action (un fichier de 5 242 880 octets, les champs et l'habillage `multipart`). Délai de l'appel à l'API : 60 secondes.

## Vérification du passage de 5 Mo

La Server Action est l'architecture cible. Le passage d'un fichier de 5 242 880 octets est réellement vérifié (envoi par le formulaire, présence dans le Back Office, CV téléchargé identique par empreinte) avant que le dépôt soit considéré comme terminé. S'il échoue, aucun autre mécanisme n'est substitué : l'incompatibilité est signalée et l'implémentation s'arrête pour validation.
