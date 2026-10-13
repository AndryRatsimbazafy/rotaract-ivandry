import Typography from "@mui/material/Typography";
import PageHeader from "@/components/PageHeader";
import { param, safeReturnPath } from "@/lib/navigation";
import { createMember } from "../actions";
import MemberForm from "../_components/MemberForm";

export default async function NouveauMembrePage({
  searchParams,
}: PageProps<"/membres/nouveau">) {
  const returnTo = safeReturnPath(param(await searchParams, "retour"), "/membres");
  return (
    <>
      <PageHeader back={{ href: returnTo, label: "Membres" }} title="Nouveau membre" />
      <MemberForm action={createMember} returnTo={returnTo} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Le portrait s&apos;ajoute sur la fiche, après l&apos;enregistrement.
      </Typography>
    </>
  );
}
