// "Join us" page texts, in English (feature 014). Same shape as
// content/fr/join.ts. Nothing is promised or made up: no slogan, no figure,
// no testimony, no condition the club has not stated.

import { routes } from "@/config/routes";
import type { FaqItem, MembershipStep } from "../fr/join";
import type { ApplicantStatus, ApplicationField } from "@/types/application";

export type { FaqItem, MembershipStep };

export const joinOpening = {
  label: "Recruitment",
  titleLines: ["Join", "us"],
  lede: "The club is open to anyone who wants to discover, then take part. Here is how it works.",
  primaryAction: "Apply",
};

export const joinClub = {
  number: "01",
  label: "The club",
  /** Three beats, on three lines. */
  titleLines: ["One club,", "actions,", "bonds."],
  text: "The Rotaract Club Ivandry brings together young professionals and students around service, fellowship, leadership, diversity and integrity.",
  photoBrief: "A club meeting.",
};

export const joinValues = {
  number: "02",
  label: "Our values",
  title: "Five values",
};

export const joinAreas = {
  number: "03",
  label: "Areas of focus",
  title: "Seven areas of focus",
  intro: "The club's actions can fall within Rotary's seven areas of focus.",
  link: "See our actions",
};

export const joinPath: {
  number: string;
  label: string;
  title: string;
  steps: MembershipStep[];
} = {
  number: "04",
  label: "The path",
  title: "From the first step to membership",
  steps: [
    { title: "Apply", href: "#candidature", linkLabel: "Go to the form" },
    { title: "Be invited to a meeting or an action" },
    { title: "Take part" },
    {
      title: "Become a prospective member",
      note: [
        "A prospective member is not yet a member of the club, but can take part in meetings, actions and moments of fellowship.",
        "Once approved by the General Assembly, they become a member.",
      ],
    },
    { title: "Be approved by the General Assembly" },
    { title: "Become a member" },
  ],
};

export const fourWayTest = {
  number: "05",
  label: "Rotary",
  title: "The Four-Way Test",
  questions: [
    "Is it the truth?",
    "Is it fair to all concerned?",
    "Will it build goodwill and better friendships?",
    "Will it be beneficial to all concerned?",
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
  label: "Application",
  title: "Take the first step.",
  afterTitle: "What happens next?",
  after: "After your application, the club invites you to a meeting or an action.",
  fields: {
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    applicantStatus: "Status",
    cv: "CV",
  },
  statuses: { etudiant: "Student", professionnel: "Professional" },
  cvHint: "A PDF or Word file, 5 MB at most.",
  required: "All fields are required.",
  submit: "Send my application",
  errorPrefix: "Error:",
  errors: {
    firstName: "Enter your first name.",
    lastName: "Enter your last name.",
    email: "Enter your email address.",
    emailFormat: "Check the email address: it should look like name@example.org.",
    phone: "Enter your phone number.",
    phoneFormat: "Check the phone number: it must contain at least eight digits.",
    applicantStatus: "Choose your status.",
    cv: "Attach your CV.",
  },
  cvTooLarge: "The file is too large.",
  cvFormat: "The CV format is not accepted.",
  sending: "Sending…",
  tooMany: "Too many requests. Please try again later.",
  unavailable: "Service temporarily unavailable. Please try again later.",
  sentTitle: "Application sent",
  sent: "Thank you. The club will then invite you to a meeting or an action.",
};

export const joinFaq: { number: string; label: string; title: string; items: FaqItem[] } = {
  number: "07",
  label: "Frequently asked questions",
  title: "Before you apply",
  items: [
    // Answer entered in the Back Office.
    { id: "qui", question: "Who can apply?" },
    {
      id: "rencontre",
      question: "How does a first meeting work?",
      answer: [
        "After your application, the club invites you to a meeting or an action.",
      ],
    },
    {
      id: "sympathisant",
      question: "What is a prospective member?",
      answer: [
        "A prospective member is not yet a member of the club, but can take part in meetings, actions and moments of fellowship.",
        "Once approved by the General Assembly, they become a member.",
      ],
    },
    {
      id: "avant",
      question: "Can I take part in actions before becoming a member?",
      answer: [
        "Yes. A prospective member can take part in meetings, actions and moments of fellowship.",
      ],
    },
    {
      id: "membre",
      question: "How do I officially become a member?",
      answer: [
        "A prospective member becomes a member once approved by the General Assembly.",
      ],
    },
    // Answer entered in the Back Office.
    { id: "frequence", question: "How often does the club meet?" },
  ],
};

export const joinOnward = {
  label: "Keep reading",
  links: [
    { href: routes.actions, label: "See our actions" },
    { href: routes.members, label: "Meet the members" },
  ],
};
