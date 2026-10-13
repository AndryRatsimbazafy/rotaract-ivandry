import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { getContent } from "@/content";

export default async function Loading() {
  const content = await getContent();
  const { actionsIndex } = content.actions;
  return <PageSkeleton label={actionsIndex.loadingLabel} shape="entry" />;
}
