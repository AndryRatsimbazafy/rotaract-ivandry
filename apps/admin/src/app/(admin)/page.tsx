import { unstable_rethrow } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import SummaryBar from "@/components/SummaryBar";
import { apiRead, queryString } from "@/lib/api";
import type { Listed, Paginated } from "@/types/api";
import type { RotaryYear } from "@/types/rotary-year";
import HomeLinks from "./_components/HomeLinks";

// Total d'une liste de l'API, ou null s'il n'a pas pu être lu : jamais 0 par
// défaut. La fin de session (redirection) est relancée.
async function total(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<number | null> {
  try {
    const list = await apiRead<Paginated<unknown>>(
      `${path}${queryString({ ...params, limit: 1 })}`,
    );
    return list.meta.total;
  } catch (error) {
    unstable_rethrow(error);
    return null;
  }
}

async function currentYearLabel(): Promise<string | null> {
  try {
    const years = await apiRead<Listed<RotaryYear>>("/admin/rotary-years");
    return years.data.find((year) => year.isCurrent)?.label ?? null;
  } catch (error) {
    unstable_rethrow(error);
    return null;
  }
}

// Accueil : chiffres réels lus dans l'API, puis un accès par domaine.
export default async function AccueilPage() {
  const year = await currentYearLabel();
  const [members, actions, news, applications] = await Promise.all([
    year ? total("/admin/members", { year }) : Promise.resolve(null),
    total("/admin/actions", { published: "true" }),
    total("/admin/news", { published: "true" }),
    total("/admin/applications", {}),
  ]);

  return (
    <>
      <PageHeader title="Accueil" />
      <SummaryBar
        cells={[
          {
            label: year ? `Membres ${year}` : "Membres",
            value: members,
            href: year ? `/membres?annee=${year}` : "/membres",
          },
          { label: "Actions publiées", value: actions, href: "/actions?publie=true" },
          {
            label: "Actualités publiées",
            value: news,
            href: "/actualites?publie=true",
          },
          { label: "Candidatures", value: applications, href: "/candidatures" },
        ]}
      />
      <HomeLinks />
    </>
  );
}
