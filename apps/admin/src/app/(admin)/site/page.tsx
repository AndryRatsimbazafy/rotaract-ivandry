import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PageHeader, { SectionHeading } from "@/components/PageHeader";
import { FAQ_QUESTIONS, SITE_PHOTO_SLOTS } from "@/content/site";
import { apiRead } from "@/lib/api";
import type { SiteSettings } from "@/types/site-settings";
import ClubForm from "./_components/ClubForm";
import FaqForm from "./_components/FaqForm";
import SitePhotoCard from "./_components/SitePhotoCard";
import SocialForm from "./_components/SocialForm";
import { saveClub, saveFaq, saveSocial } from "./actions";
import { removeSitePhoto, setSitePhoto, updateSitePhoto } from "./photo-actions";

// Réglages du site public (contracts/admin-screens.md) : photographies fixes,
// réseaux sociaux et textes.
export default async function SitePage() {
  const settings = await apiRead<SiteSettings>("/admin/site-settings");
  const { social, club } = settings;
  // Une réponse jamais enregistrée : celle que le site affiche aujourd'hui.
  const faq = Object.fromEntries(
    FAQ_QUESTIONS.flatMap(({ id, currentAnswer }) => [
      [id, settings.faq[id] ?? currentAnswer],
      [`en.${id}`, settings.en?.faq?.[id] ?? ""],
    ]),
  );
  const clubEn = settings.en?.club ?? {};

  return (
    <>
      <PageHeader
        title="Site"
        meta="Photographies, réseaux sociaux et textes du site public. Une modification apparaît sur le site en une minute environ."
      />
      <Box component="section" aria-labelledby="photographies">
        <SectionHeading id="photographies" title="Photographies" />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" },
            columnGap: 4,
          }}
        >
          {SITE_PHOTO_SLOTS.map((info) => (
            <SitePhotoCard
              key={info.slot}
              info={info}
              image={settings.photos[info.slot]}
              setAction={setSitePhoto.bind(null, info.slot)}
              updateAction={updateSitePhoto.bind(null, info.slot)}
              removeAction={removeSitePhoto.bind(null, info.slot)}
            />
          ))}
        </Box>
      </Box>
      <Box component="section" aria-labelledby="reseaux" sx={{ mt: 5 }}>
        <SectionHeading id="reseaux" title="Réseaux sociaux" />
        <SocialForm
          action={saveSocial}
          initial={{ facebook: social.facebook ?? "", instagram: social.instagram ?? "" }}
        />
      </Box>
      <Box component="section" aria-labelledby="textes" sx={{ mt: 5 }}>
        <SectionHeading id="textes" title="Textes" />
        <Typography variant="h3" component="h3" sx={{ mb: 1.5 }}>
          Présentation du club
        </Typography>
        <ClubForm
          action={saveClub}
          initial={{
            foundedYear: club.foundedYear?.toString() ?? "",
            sponsorClub: club.sponsorClub ?? "",
            memberCount: club.memberCount?.toString() ?? "",
            meetingPlace: club.meetingPlace ?? "",
            meetingRhythm: club.meetingRhythm ?? "",
            "en.sponsorClub": clubEn.sponsorClub ?? "",
            "en.meetingPlace": clubEn.meetingPlace ?? "",
            "en.meetingRhythm": clubEn.meetingRhythm ?? "",
          }}
        />
        <Typography variant="h3" component="h3" sx={{ mt: 4, mb: 1.5 }}>
          Questions fréquentes
        </Typography>
        <FaqForm action={saveFaq} initial={faq} />
      </Box>
    </>
  );
}
