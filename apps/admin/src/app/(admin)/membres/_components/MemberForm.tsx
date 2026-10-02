"use client";

import { useActionState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useFocusFirstError } from "@/components/useFocusFirstError";
import {
  EMPTY_FORM_STATE,
  fieldValue,
  type FormState,
} from "@/lib/form-state";

type Props = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  initial?: Record<string, string>;
  returnTo: string;
};

const FIELDS = [
  { name: "firstName", label: "Prénom", required: true, maxLength: 120 },
  { name: "lastName", label: "Nom", required: true, maxLength: 120 },
  { name: "occupation", label: "Profession ou études", maxLength: 120 },
  { name: "email", label: "Email", type: "email", maxLength: 254 },
  { name: "phone", label: "Téléphone", type: "tel" },
];

// Création et modification d'un membre. Les fonctions n'en font pas partie :
// elles vivent dans les mandats.
export default function MemberForm({ action, initial = {}, returnTo }: Props) {
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);
  const ref = useFocusFirstError(state);
  const errors = state.fieldErrors ?? {};

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 720 }}>
      <form action={formAction} ref={ref} noValidate>
        <input type="hidden" name="retour" value={returnTo} />
        <Stack spacing={2}>
          {state.message && (
            <Alert severity="error" role="alert">
              {state.message}
            </Alert>
          )}
          {FIELDS.map(({ name, label, required, maxLength, type }) => (
            <TextField
              key={name}
              name={name}
              label={label}
              type={type}
              required={required}
              defaultValue={fieldValue(state, initial, name)}
              error={Boolean(errors[name])}
              helperText={errors[name]}
              slotProps={{ htmlInput: { maxLength } }}
            />
          ))}
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={pending}>
              Enregistrer
            </Button>
            <Button component={Link} href={returnTo} disabled={pending}>
              Annuler
            </Button>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
}
