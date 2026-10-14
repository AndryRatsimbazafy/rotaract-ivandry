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

const HELP = "Séparez les paragraphes par une ligne vide.";

// Histoire du club : la page « Le club » du site public (fonctionnalité 015).
// Facultative ; sans elle, la page s'affiche sans paragraphe d'histoire.
export default function HistoryForm({ action, initial }: Props) {
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);
  const ref = useFocusFirstError(state);
  const errors = state.fieldErrors ?? {};

  return (
    <Box sx={{ maxWidth: 720 }}>
      <form action={formAction} ref={ref} noValidate>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Affichée sur la page Le club. Laissée vide, la page s&apos;affiche sans histoire.
          </Typography>
          {state.message && (
            <Alert severity="error" role="alert">
              {state.message}
            </Alert>
          )}
          <TextField
            name="history"
            label="Histoire"
            multiline
            minRows={6}
            defaultValue={fieldValue(state, initial, "history")}
            error={Boolean(errors.history)}
            helperText={errors.history ?? HELP}
            slotProps={{ htmlInput: { maxLength: 4000 } }}
          />
          <TextField
            name="en.history"
            label="Histoire (anglais)"
            multiline
            minRows={6}
            defaultValue={fieldValue(state, initial, "en.history")}
            error={Boolean(errors["en.history"])}
            helperText={
              errors["en.history"] ??
              "Facultative. Laissée vide, le site anglais affiche l'histoire en français."
            }
            slotProps={{ htmlInput: { maxLength: 4000, lang: "en" } }}
          />
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
