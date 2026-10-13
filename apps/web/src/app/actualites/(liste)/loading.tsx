import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { newsRegister } from "@/content/news";

export default function Loading() {
  return <PageSkeleton label={newsRegister.loadingLabel} shape="feature" />;
}
