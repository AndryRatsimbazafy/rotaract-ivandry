import type { Metadata } from "next";
import { JoinReminder } from "@/components/sections/JoinReminder";
import { Onward } from "@/components/sections/Onward";
import { membersOnward } from "@/content/members";
import { membersPage } from "@/content/pages";
import {
  currentRotaryYear,
  getMembers,
  getMemberYears,
} from "@/data/members";
import { MembersDirectory } from "./_sections/MembersDirectory";
import { MembersFunctions } from "./_sections/MembersFunctions";
import { MembersOpening } from "./_sections/MembersOpening";

export const metadata: Metadata = {
  title: membersPage.title,
  description: membersPage.description,
};

/** Un filtre n'accepte qu'une valeur : la première si l'adresse en répète une. */
function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MembersPage(props: PageProps<"/membres">) {
  const query = await props.searchParams;
  const publishedYears = await getMemberYears();
  // Sans aucun membre publié, seule l'année en cours est proposée.
  const years = publishedYears.length > 0 ? publishedYears : [currentRotaryYear];
  const latestYear = years[0];
  const selectedYear = single(query.annee) ?? latestYear;
  const members = await getMembers(selectedYear);

  return (
    <>
      <MembersOpening years={years} selectedYear={selectedYear} />
      <MembersDirectory
        members={members}
        year={selectedYear}
        latestYear={latestYear}
      />
      {members.length > 0 ? (
        <MembersFunctions members={members} year={selectedYear} />
      ) : null}
      <Onward label={membersOnward.label} links={membersOnward.links} />
      <JoinReminder />
    </>
  );
}
