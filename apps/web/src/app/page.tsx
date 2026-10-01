import { currentRotaryYear, getFeaturedMembers } from "@/data/members";
import { getLatestActions } from "@/data/actions";
import { getLatestNews } from "@/data/news";
import { About } from "./_sections/About";
import { FocusAreas } from "./_sections/FocusAreas";
import { JoinField } from "./_sections/JoinField";
import { LatestActions } from "./_sections/LatestActions";
import { LatestNews } from "./_sections/LatestNews";
import { MembersPreview } from "./_sections/MembersPreview";
import { Opening } from "./_sections/Opening";
import { RotaryValues } from "./_sections/RotaryValues";

export default async function HomePage() {
  const [actions, news, members] = await Promise.all([
    getLatestActions(3),
    getLatestNews(3),
    getFeaturedMembers(4),
  ]);

  return (
    <>
      <Opening rotaryYear={currentRotaryYear} />
      <About />
      <RotaryValues />
      <FocusAreas />
      <LatestActions actions={actions} />
      <LatestNews news={news} />
      <MembersPreview members={members} rotaryYear={currentRotaryYear} />
      <JoinField />
    </>
  );
}
