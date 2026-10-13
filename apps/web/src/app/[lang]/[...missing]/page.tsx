import { notFound } from "next/navigation";

// Toute adresse inconnue : la page introuvable, dans la mise en page et la
// langue de l'adresse.
export default function Missing() {
  notFound();
}
