import { notFound } from "next/navigation";

// Toute adresse inconnue de l'espace protégé : la page « introuvable » garde
// la navigation.
export default function UnknownPage() {
  notFound();
}
