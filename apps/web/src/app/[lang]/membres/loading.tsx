import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { getContent } from "@/content";

export default async function Loading() {
  const content = await getContent();
  const { membersDirectory } = content.members;
  return <PageSkeleton label={membersDirectory.loadingLabel} shape="directory" />;
}
