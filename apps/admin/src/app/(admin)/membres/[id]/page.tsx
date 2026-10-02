import PageHeader from "@/components/PageHeader";
import { apiRead } from "@/lib/api";
import { param, safeReturnPath } from "@/lib/navigation";
import type { Listed } from "@/types/api";
import type { MemberWithMandates } from "@/types/member";
import type { RotaryYear } from "@/types/rotary-year";
import { updateMember } from "../actions";
import MandatesSection from "../_components/MandatesSection";
import MemberDelete from "../_components/MemberDelete";
import MemberForm from "../_components/MemberForm";

export default async function MembrePage({
  params,
  searchParams,
}: PageProps<"/membres/[id]">) {
  const { id } = await params;
  const returnTo = safeReturnPath(param(await searchParams, "retour"), "/membres");
  const [member, years] = await Promise.all([
    apiRead<MemberWithMandates>(`/admin/members/${id}`),
    apiRead<Listed<RotaryYear>>("/admin/rotary-years"),
  ]);
  const name = `${member.firstName} ${member.lastName}`;

  return (
    <>
      <PageHeader title={name} />
      <MemberForm
        action={updateMember.bind(null, member.id)}
        initial={{
          firstName: member.firstName,
          lastName: member.lastName,
          occupation: member.occupation ?? "",
          email: member.email ?? "",
          phone: member.phone ?? "",
        }}
        returnTo={returnTo}
      />
      <MandatesSection
        memberId={member.id}
        memberName={name}
        mandates={member.mandates}
        years={years.data.map(({ id, label }) => ({ id, label }))}
      />
      <MemberDelete id={member.id} name={name} returnTo={returnTo} />
    </>
  );
}
