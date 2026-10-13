import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { getContent } from "@/content";

export default async function Loading() {
  const content = await getContent();
  const { newsRegister } = content.news;
  return <PageSkeleton label={newsRegister.loadingLabel} shape="feature" />;
}
