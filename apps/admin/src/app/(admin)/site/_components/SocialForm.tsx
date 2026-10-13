"use client";

import { useActionState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useFocusFirstError } from "@/components/useFocusFirstError";
import { EMPTY_FORM_STATE, fieldValue, type FormState } from "@/lib/form-state";

type Props = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  initial: Record<string, string>;
};

const FIELDS = [
  {
    name: "facebook",
    label: "Page Facebook",
    help: "Adresse complète, par exemple https://www.facebook.com/… Vide : le pictogramme reste sans lien.",
  },
  {
    name: "instagram",
    label: "Compte Instagram",
    help: "Adresse complète, par exemple https://www.instagram.com/… Vide : le pictogramme reste sans lien.",
  },
];

// Adresses des réseaux sociaux du club, liées aux pictogrammes du site.
export default function SocialForm({ action, initial }: Props) {
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);
  const ref = useFocusFirstError(state);
  const errors = state.fieldErrors ?? {};

  return (
    <Box sx={{ maxWidth: 720 }}>
      <form action={formAction} ref={ref} noValidate>
        <Stack spacing={2}>
          {state.message && (
            <Alert severity="error" role="alert">
              {state.message}
            </Alert>
          )}
          {FIELDS.map(({ name, label, help }) => (
            <TextField
              key={name}
              name={name}
              label={label}
              type="url"
              defaultValue={fieldValue(state, initial, name)}
              error={Boolean(errors[name])}
              helperText={errors[name] ?? help}
              slotProps={{ htmlInput: { maxLength: 300, inputMode: "url" } }}
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
