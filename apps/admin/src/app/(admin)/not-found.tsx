import LinkButton from "@/components/LinkButton";
import PageHeader from "@/components/PageHeader";

export default function NotFound() {
  return (
    <>
      <PageHeader title="Ressource introuvable." />
      <LinkButton href="/" variant="outlined">
        Retour à l&apos;accueil
      </LinkButton>
    </>
  );
}
