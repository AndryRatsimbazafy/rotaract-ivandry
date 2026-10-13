import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ConfirmDialog from "@/components/ConfirmDialog";
import FieldList from "@/components/FieldList";
import {
  InspectorError,
  InspectorNotFound,
  InspectorPanel,
  InspectorSection,
} from "@/components/Inspector";
import ImageThumb from "@/components/ImageThumb";
import LinkButton from "@/components/LinkButton";
import { readInspected } from "@/lib/inspector";
import { MEMBER_ROLE_LABELS } from "@/lib/labels";
import { withSelection } from "@/lib/navigation";
import { tabularNums } from "@/theme/theme";
import type { MemberWithMandates } from "@/types/member";
import { deleteMember } from "../actions";

// Aperçu d'un membre : coordonnées et mandats, du plus récent au plus ancien.
export default async function MemberInspector({
  id,
  returnTo,
}: {
  id: string;
  returnTo: string;
}) {
  const read = await readInspected<MemberWithMandates>(`/admin/members/${id}`);
  if (read.status === "not-found") {
    return <InspectorNotFound />;
  }
  if (read.status === "error") {
    return <InspectorError />;
  }
  const member = read.data;
  const name = `${member.firstName} ${member.lastName}`;
  const mandates = [...member.mandates].sort((a, b) =>
    b.rotaryYear.label.localeCompare(a.rotaryYear.label),
  );

  return (
    <InspectorPanel
      title={name}
      actions={
        <>
          <LinkButton
            href={`/membres/${member.id}?retour=${encodeURIComponent(returnTo)}`}
            variant="contained"
            size="small"
          >
            Ouvrir la fiche
          </LinkButton>
          <ConfirmDialog
            triggerLabel="Supprimer"
            ariaLabel={`Supprimer ${name}`}
            title="Supprimer ce membre ?"
            text={`${name} sera supprimé. Ses mandats seront supprimés avec lui.`}
            action={deleteMember.bind(null, member.id, withSelection(returnTo, null))}
          />
        </>
      }
    >
      {member.portrait && (
        <Box sx={{ mb: 2 }}>
          <ImageThumb
            url={member.portrait.url}
            alt={member.portrait.alt}
            focus={member.portrait.focus}
            ratio="4 / 5"
            sizes="360px"
          />
        </Box>
      )}
      <FieldList
        labelWidth={110}
        fields={[
          { label: "Profession ou études", value: member.occupation },
          { label: "Email", value: member.email },
          { label: "Téléphone", value: member.phone, numeric: true },
        ]}
      />
      <InspectorSection label="Mandats">
        {mandates.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Aucun mandat.
          </Typography>
        ) : (
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
            {mandates.map((mandate) => (
              <Box
                component="li"
                key={mandate.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "88px minmax(0, 1fr)",
                  gap: 1,
                  py: 0.75,
                  borderBottom: 1,
                  borderColor: "divider",
                  typography: "body2",
                }}
              >
                <Box component="span" sx={{ ...tabularNums, fontWeight: 600 }}>
                  {mandate.rotaryYear.label}
                </Box>
                <span>
                  {mandate.roles.length > 0
                    ? mandate.roles.map((role) => MEMBER_ROLE_LABELS[role]).join(", ")
                    : "—"}
                </span>
              </Box>
            ))}
          </Box>
        )}
      </InspectorSection>
    </InspectorPanel>
  );
}
