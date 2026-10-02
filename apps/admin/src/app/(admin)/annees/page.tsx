import { apiRead } from "@/lib/api";
import { formatUtcDate } from "@/lib/dates";
import type { Listed } from "@/types/api";
import type { RotaryYear } from "@/types/rotary-year";
import YearsView from "./_components/YearsView";

export default async function AnneesPage() {
  const { data } = await apiRead<Listed<RotaryYear>>("/admin/rotary-years");
  return (
    <YearsView
      years={data.map((year) => ({
        id: year.id,
        label: year.label,
        // Bornes de l'année telles que l'API les définit : 1er juillet, 30 juin.
        start: formatUtcDate(year.startDate),
        end: formatUtcDate(year.endDate),
        isCurrent: year.isCurrent,
      }))}
    />
  );
}
