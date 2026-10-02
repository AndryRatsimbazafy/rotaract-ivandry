"use client";

import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ConfirmDialog from "@/components/ConfirmDialog";
import { deleteApplication } from "../actions";

export type ApplicationView = {
  id: string;
  name: string;
  fields: { label: string; value: string }[];
  email: string;
  cv: { name: string; type: string; size: string };
};

type Props = {
  application: ApplicationView;
  // Message lié au téléchargement du CV, s'il a échoué.
  cvError?: string;
  returnTo: string;
};

// Fiche d'une candidature : lecture, CV, contact, suppression. Rien ne s'y
// modifie, et aucun état de traitement n'existe.
export default function ApplicationDetail({
  application,
  cvError,
  returnTo,
}: Props) {
  return (
    <Box sx={{ maxWidth: 720 }}>
      {cvError && (
        <Alert severity="error" role="alert" sx={{ mb: 2 }}>
          {cvError}
        </Alert>
      )}
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          component="dl"
          sx={{
            m: 0,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "200px 1fr" },
            rowGap: 1.5,
            columnGap: 2,
          }}
        >
          {application.fields.map(({ label, value }) => (
            <Box key={label} sx={{ display: "contents" }}>
              <Typography component="dt" color="text.secondary">
                {label}
              </Typography>
              <Typography component="dd" sx={{ m: 0, overflowWrap: "anywhere" }}>
                {value}
              </Typography>
            </Box>
          ))}
          <Typography component="dt" color="text.secondary">
            CV
          </Typography>
          <Typography component="dd" sx={{ m: 0, overflowWrap: "anywhere" }}>
            {application.cv.name} — {application.cv.type}, {application.cv.size}
          </Typography>
        </Box>
      </Paper>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ mt: 2, alignItems: { sm: "center" } }}
      >
        {/* Lien ordinaire : le fichier est renvoyé en pièce jointe par le
            Back Office lui-même, jamais par une adresse de stockage. */}
        <Button
          component="a"
          href={`/candidatures/${application.id}/cv`}
          variant="contained"
        >
          Télécharger le CV
        </Button>
        <Button
          component="a"
          href={`mailto:${application.email}`}
          variant="outlined"
        >
          Contacter par email
        </Button>
        <Button component={Link} href={returnTo}>
          Retour à la liste
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <ConfirmDialog
          triggerLabel="Supprimer"
          variant="outlined"
          title="Supprimer cette candidature ?"
          text={`La candidature de ${application.name} sera supprimée. Le CV sera supprimé avec la candidature.`}
          action={deleteApplication.bind(null, application.id, returnTo)}
        />
      </Stack>
    </Box>
  );
}
