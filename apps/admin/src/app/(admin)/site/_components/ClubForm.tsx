"use client";

import { useActionState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useFocusFirstError } from "@/components/useFocusFirstError";
import { EMPTY_FORM_STATE, fieldValue, type FormState } from "@/lib/form-state";

type Props = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  initial: Record<string, string>;
};

// Chaque information textuelle a son équivalent anglais facultatif, juste
// dessous (fonctionnalité 014).
const FIELDS: {
  name: string;
  label: string;
  maxLength: number;
  numeric?: boolean;
  help?: string;
  english?: boolean;
}[] = [
  { name: "foundedYear", label: "Année de création", numeric: true, maxLength: 4 },
  { name: "sponsorClub", label: "Club parrain", maxLength: 120 },
  { name: "en.sponsorClub", label: "Club parrain (anglais)", maxLength: 120, english: true },
  {
    name: "memberCount",
    label: "Nombre de membres",
    numeric: true,
    maxLength: 3,
    help: "À mettre à jour à chaque année Rotary.",
  },
  { name: "meetingPlace", label: "Lieu des réunions", maxLength: 160 },
  { name: "en.meetingPlace", label: "Lieu des réunions (anglais)", maxLength: 160, english: true },
  {
    name: "meetingRhythm",
    label: "Rythme des réunions",
    maxLength: 160,
    help: "Par exemple : Deux fois par mois, le jeudi soir.",
  },
  { name: "en.meetingRhythm", label: "Rythme des réunions (anglais)", maxLength: 160, english: true },
];

// Présentation du club : la fiche de la section « Qui sommes-nous ? » de
// l'accueil. Chaque information est facultative.
export default function ClubForm({ action, initial }: Props) {
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);
  const ref = useFocusFirstError(state);
  const errors = state.fieldErrors ?? {};

  return (
    <Box sx={{ maxWidth: 720 }}>
      <form action={formAction} ref={ref} noValidate>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Seules les informations remplies apparaissent sur le site.
          </Typography>
          {state.message && (
            <Alert severity="error" role="alert">
              {state.message}
            </Alert>
          )}
          {FIELDS.map(({ name, label, numeric, maxLength, help, english }) => (
            <TextField
              key={name}
              name={name}
              label={label}
              defaultValue={fieldValue(state, initial, name)}
              error={Boolean(errors[name])}
              helperText={errors[name] ?? help}
              slotProps={{
                htmlInput: {
                  maxLength,
                  ...(english ? { lang: "en" } : {}),
                  ...(numeric ? { inputMode: "numeric", pattern: "[0-9]*" } : {}),
                },
              }}
            />
          ))}
          <Box sx={{ pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Button type="submit" variant="contained" disabled={pending}>
              Enregistrer
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
}
