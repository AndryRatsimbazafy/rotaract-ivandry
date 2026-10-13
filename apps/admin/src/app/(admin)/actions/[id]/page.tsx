import DeleteSection from "@/components/DeleteSection";
import PageHeader from "@/components/PageHeader";
import PhotosSection from "@/components/PhotosSection";
import { PublishedMark } from "@/components/StatusMark";
import { apiRead } from "@/lib/api";
import { formatDateTime, isoToDateInput, yearsForDateInput } from "@/lib/dates";
import { param, safeReturnPath } from "@/lib/navigation";
import type { Action } from "@/types/action";
import type { Listed } from "@/types/api";
import type { RotaryYear } from "@/types/rotary-year";
import { deleteAction, updateAction } from "../actions";
import ActionForm from "../_components/ActionForm";
import { addPhoto, removePhoto, reorderPhotos, updatePhoto } from "../images-actions";

export default async function ActionPage({
  params,
  searchParams,
}: PageProps<"/actions/[id]">) {
  const { id } = await params;
  const returnTo = safeReturnPath(param(await searchParams, "retour"), "/actions");
  const [action, years] = await Promise.all([
    apiRead<Action>(`/admin/actions/${id}`),
    apiRead<Listed<RotaryYear>>("/admin/rotary-years"),
  ]);
  const impact = action.impact ?? {};

  return (
    <>
      <PageHeader
        back={{ href: returnTo, label: "Actions" }}
        title={action.title}
        marks={<PublishedMark isPublished={action.isPublished} />}
      />
      <ActionForm
        action={updateAction.bind(null, action.id, action.slug)}
        initial={{
          values: {
            title: action.title,
            slug: action.slug,
            summary: action.summary ?? "",
            description: action.description ?? "",
            date: isoToDateInput(action.date),
            rotaryYear: action.rotaryYear.id,
            order: action.order === null ? "" : String(action.order),
            "impact.objective": impact.objective ?? "",
            "impact.beneficiaries": impact.beneficiaries ?? "",
            "impact.location": impact.location ?? "",
            "impact.period": impact.period ?? "",
            "impact.results": impact.results ?? "",
            "impact.partners": (impact.partners ?? []).join("\n"),
          },
          focusAreas: action.focusAreas,
          isPublished: action.isPublished,
          publishedAt: action.publishedAt
            ? formatDateTime(action.publishedAt)
            : undefined,
        }}
        years={yearsForDateInput(years.data)}
        returnTo={returnTo}
      />
      <PhotosSection
        photos={action.photos}
        addAction={addPhoto.bind(null, action.id)}
        updateAction={updatePhoto.bind(null, action.id)}
        removeAction={removePhoto.bind(null, action.id)}
        reorderAction={reorderPhotos.bind(null, action.id)}
      />
      <DeleteSection
        label="Supprimer cette action"
        title="Supprimer cette action ?"
        text={`L'action « ${action.title} » sera supprimée définitivement.`}
        action={deleteAction.bind(null, action.id, returnTo)}
      />
    </>
  );
}
