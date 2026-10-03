import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { actionsIndex } from "@/content/actions";

export default function Loading() {
  return <PageSkeleton label={actionsIndex.loadingLabel} shape="entry" />;
}
