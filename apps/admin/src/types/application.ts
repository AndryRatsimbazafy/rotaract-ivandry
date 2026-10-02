export type ApplicantStatus = "etudiant" | "professionnel";

// Lecture et suppression seulement : une candidature n'a aucun état de
// traitement.
export type Application = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  applicantStatus: ApplicantStatus;
  cv: { name: string; mimeType: string; size: number };
  createdAt: string;
};
