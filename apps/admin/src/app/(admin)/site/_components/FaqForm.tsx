"use client";

import { useActionState, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useFocusFirstError } from "@/components/useFocusFirstError";
import { FAQ_QUESTIONS, FAQ_REQUIRED_MESSAGE } from "@/content/site";
import { EMPTY_FORM_STATE, fieldValue, type FormState } from "@/lib/form-state";

type Props = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  // Réponse enregistrée, sinon celle que le site affiche aujourd'hui.
  initial: Record<string, string>;
};

// Réponses des questions fréquentes de « Nous rejoindre », chaque champ sous
// l'intitulé exact de sa question.
export default function FaqForm({ action, initial }: Props) {
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);
  const ref = useFocusFirstError(state);
  const [missing, setMissing] = useState<Record<string, string>>({});
  const errors = { ...(state.fieldErrors ?? {}), ...missing };

  // Une réponse déjà publiée ne se vide pas : refus avant l'envoi.
  const check = (event: React.FormEvent<HTMLFormElement>) => {
    const data = new FormData(event.currentTarget);
    const empty: Record<string, string> = {};
    for (const { id, required } of FAQ_QUESTIONS) {
      const value = data.get(id);
      if (required && (typeof value !== "string" || value.trim() === "")) {
        empty[id] = FAQ_REQUIRED_MESSAGE;
      }
    }
    setMissing(empty);
    if (Object.keys(empty).length > 0) {
      event.preventDefault();
      event.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(empty)[0]}"]`)?.focus();
    }
  };

  return (
    <Box sx={{ maxWidth: 720 }}>
      <form action={formAction} ref={ref} onSubmit={check} noValidate>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Séparez les paragraphes par une ligne vide.
          </Typography>
          {state.message && (
            <Alert severity="error" role="alert">
              {state.message}
            </Alert>
          )}
          {FAQ_QUESTIONS.map(({ id, question, required }) => (
            <TextField
              key={id}
              name={id}
              label={question}
              multiline
              minRows={2}
              required={required}
              defaultValue={fieldValue(state, initial, id)}
              error={Boolean(errors[id])}
              helperText={
                errors[id] ?? (required ? undefined : "Vide : la question n'apparaît pas sur le site.")
              }
              slotProps={{ htmlInput: { maxLength: 1000 } }}
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
