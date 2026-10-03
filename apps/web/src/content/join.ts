// Textes de la page Nous rejoindre.
// Rien n'est promis ni inventé : pas de slogan, pas de chiffre, pas de
// témoignage, pas de condition que le club n'a pas énoncée.

import { routes } from "@/config/routes";
import type { ApplicantStatus, ApplicationField } from "@/types/application";

export const joinOpening = {
  label: "Recrutement",
  titleLines: ["Nous", "rejoindre"],
  lede: "Le club est ouvert à celles et ceux qui veulent découvrir, puis participer. Voici comment cela se passe.",
  primaryAction: "Candidater",
};

export const joinClub = {
  number: "01",
  label: "Le club",
  /** Trois temps, sur trois lignes. */
  titleLines: ["Un club,", "des actions,", "des liens."],
  text: "Le Rotaract Club Ivandry réunit de jeunes professionnels et des étudiants autour du service, de la camaraderie, du leadership, de la diversité et de l'intégrité.",
  photoBrief: "Une réunion du club.",
};

export const joinValues = {
  number: "02",
  label: "Nos valeurs",
  title: "Cinq valeurs",
};

export const joinAreas = {
  number: "03",
  label: "Domaines d'action",
  title: "Sept domaines d'action",
  intro: "Les actions du club peuvent s'inscrire dans les sept grands domaines d'action du Rotary.",
  link: "Voir nos actions",
};

export interface MembershipStep {
  title: string;
  /** Explication donnée par le club. Absente quand il n'en a pas fourni. */
  note?: string[];
  /** Ancre vers laquelle l'étape renvoie. */
  href?: string;
  linkLabel?: string;
}

export const joinPath: {
  number: string;
  label: string;
  title: string;
  steps: MembershipStep[];
} = {
  number: "04",
  label: "Le parcours",
  title: "Du premier pas à l'adhésion",
  steps: [
    { title: "Candidater", href: "#candidature", linkLabel: "Aller au formulaire" },
    { title: "Être invité à une réunion ou une action" },
    { title: "Participer" },
    {
      title: "Devenir sympathisant",
      note: [
        "Un sympathisant n'est pas encore membre du club, mais il peut participer aux réunions, aux actions et aux moments de camaraderie.",
        "Après validation par l'Assemblée Générale, il devient membre.",
      ],
    },
    { title: "Être validé par l'Assemblée Générale" },
    { title: "Devenir membre" },
  ],
};

export const fourWayTest = {
  number: "05",
  label: "Rotary",
  title: "Le critère des quatre questions",
  questions: [
    "Est-ce vrai ?",
    "Est-ce juste pour toutes les personnes concernées ?",
    "Est-ce susceptible de créer la bonne volonté et de meilleures relations d'amitié ?",
    "Est-ce bénéfique à toutes les personnes concernées ?",
  ],
};

export const joinApplication: {
  number: string;
  label: string;
  title: string;
  afterTitle: string;
  after: string;
  fields: Record<ApplicationField, string>;
  statuses: Record<ApplicantStatus, string>;
  cvHint: string;
  required: string;
  submit: string;
  errorPrefix: string;
  errors: Record<ApplicationField, string> & { emailFormat: string; phoneFormat: string };
  cvTooLarge: string;
  cvFormat: string;
  sending: string;
  tooMany: string;
  unavailable: string;
  sentTitle: string;
  sent: string;
} = {
  number: "06",
  label: "Candidature",
  title: "Faire le premier pas.",
  afterTitle: "Et ensuite ?",
  after: "Après votre candidature, le club vous invite à une réunion ou à une action.",
  fields: {
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    phone: "Téléphone",
    applicantStatus: "Statut",
    cv: "CV",
  },
  statuses: { etudiant: "Étudiant", professionnel: "Professionnel" },
  cvHint: "Un fichier PDF ou Word, de 5 Mo au plus.",
  required: "Tous les champs sont obligatoires.",
  submit: "Envoyer ma candidature",
  errorPrefix: "Erreur",
  errors: {
    firstName: "Indiquez votre prénom.",
    lastName: "Indiquez votre nom.",
    email: "Indiquez votre adresse email.",
    emailFormat: "Vérifiez l'adresse email : elle doit ressembler à nom@exemple.org.",
    phone: "Indiquez votre numéro de téléphone.",
    phoneFormat: "Vérifiez le numéro de téléphone : il doit contenir au moins huit chiffres.",
    applicantStatus: "Choisissez votre statut.",
    cv: "Joignez votre CV.",
  },
  cvTooLarge: "Le fichier est trop volumineux.",
  cvFormat: "Le format du CV n’est pas accepté.",
  sending: "Envoi en cours…",
  tooMany: "Trop de demandes. Veuillez réessayer plus tard.",
  unavailable:
    "Service temporairement indisponible. Veuillez réessayer plus tard.",
  sentTitle: "Candidature envoyée",
  sent: "Merci. Le club vous invite ensuite à une réunion ou à une action.",
};

export interface FaqItem {
  id: string;
  question: string;
  /**
   * Un paragraphe par élément. Absente tant que le club n'a pas validé la
   * réponse : la question n'est alors pas affichée.
   */
  answer?: string[];
}

export const joinFaq: { number: string; label: string; title: string; items: FaqItem[] } = {
  number: "07",
  label: "Questions fréquentes",
  title: "Avant de candidater",
  items: [
    // Réponse à fournir par le club.
    { id: "qui", question: "Qui peut candidater ?" },
    {
      id: "rencontre",
      question: "Comment se déroule une première rencontre ?",
      answer: [
        "Après votre candidature, le club vous invite à une réunion ou à une action.",
      ],
    },
    {
      id: "sympathisant",
      question: "Qu'est-ce qu'un sympathisant ?",
      answer: [
        "Un sympathisant n'est pas encore membre du club, mais il peut participer aux réunions, aux actions et aux moments de camaraderie.",
        "Après validation par l'Assemblée Générale, il devient membre.",
      ],
    },
    {
      id: "avant",
      question: "Peut-on participer aux actions avant de devenir membre ?",
      answer: [
        "Oui. Un sympathisant peut participer aux réunions, aux actions et aux moments de camaraderie.",
      ],
    },
    {
      id: "membre",
      question: "Comment devient-on officiellement membre ?",
      answer: [
        "Le sympathisant devient membre après validation par l'Assemblée Générale.",
      ],
    },
    // Réponse à fournir par le club.
    { id: "frequence", question: "À quelle fréquence le club se réunit-il ?" },
  ],
};

export const joinOnward = {
  label: "Poursuivre",
  links: [
    { href: routes.actions, label: "Voir nos actions" },
    { href: routes.members, label: "Rencontrer les membres" },
  ],
};
