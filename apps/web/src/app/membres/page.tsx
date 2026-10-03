import type { Metadata } from "next";
import { Suspense } from "react";
import { JoinReminder } from "@/components/sections/JoinReminder";
import { Onward } from "@/components/sections/Onward";
import { ListSkeleton } from "@/components/ui/PageSkeleton";
import { membersDirectory, membersOnward } from "@/content/members";
import { membersPage } from "@/content/pages";
import { getMembers, getMemberYears } from "@/data/members";
import { getCurrentRotaryYear } from "@/data/rotary-years";
import { single } from "@/lib/search-params";
import { MembersDirectory } from "./_sections/MembersDirectory";
import { MembersFunctions } from "./_sections/MembersFunctions";
import { MembersOpening } from "./_sections/MembersOpening";

export const metadata: Metadata = {
  title: membersPage.title,
  description: membersPage.description,
};

/** L'annuaire de l'année et l'index de ses fonctions. */
async function Directory({
  year,
  latestYear,
}: {
  year: string;
  latestYear: string;
}) {
  const members = await getMembers(year);

  return (
    <>
      <MembersDirectory members={members} year={year} latestYear={latestYear} />
      {members.length > 0 ? <MembersFunctions members={members} /> : null}
    </>
  );
}

export default async function MembersPage(props: PageProps<"/membres">) {
  const query = await props.searchParams;
  const [publishedYears, currentYear] = await Promise.all([
    getMemberYears(),
    getCurrentRotaryYear(),
  ]);
  // Sans aucun membre publié, seule l'année en cours est proposée.
  const years = publishedYears.length > 0 ? publishedYears : [currentYear];
  const latestYear = years[0];
  const selectedYear = single(query.annee) ?? latestYear;

  return (
    <>
      <MembersOpening years={years} selectedYear={selectedYear} />
      {/* Une frontière d'attente par année : l'annuaire montre son squelette
          pendant la lecture, l'ouverture et ses années restent en place. */}
      <Suspense
        key={selectedYear}
        fallback={
          <ListSkeleton
            label={membersDirectory.loadingLabel}
            shape="directory"
            standalone
            id="annuaire"
          />
        }
      >
        <Directory year={selectedYear} latestYear={latestYear} />
      </Suspense>
      <Onward label={membersOnward.label} links={membersOnward.links} />
      <JoinReminder />
    </>
  );
}
