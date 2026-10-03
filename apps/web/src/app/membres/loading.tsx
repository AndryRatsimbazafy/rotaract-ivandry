import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { membersDirectory } from "@/content/members";

export default function Loading() {
  return <PageSkeleton label={membersDirectory.loadingLabel} shape="directory" />;
}
