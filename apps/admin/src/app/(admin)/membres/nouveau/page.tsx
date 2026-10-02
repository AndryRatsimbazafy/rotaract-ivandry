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
      <PageHeader title="Nouveau membre" />
      <MemberForm action={createMember} returnTo={returnTo} />
    </>
  );
}
