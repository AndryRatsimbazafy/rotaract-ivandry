"use client";

import { useActionState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { login } from "../actions";

export default function LoginForm({ expired }: { expired: boolean }) {
  const [state, formAction, pending] = useActionState(login, EMPTY_FORM_STATE);
  const errors = state.fieldErrors ?? {};

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper sx={{ p: { xs: 3, sm: 4 }, width: "100%", maxWidth: 400 }}>
        <Typography variant="h1" sx={{ mb: 0.5 }}>
          Administration
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Rotaract Club Ivandry
        </Typography>
        {expired && !state.message && (
          <Alert severity="info" role="status" sx={{ mb: 2 }}>
            Votre session a expiré. Reconnectez-vous.
          </Alert>
        )}
        {state.message && (
          <Alert severity="error" role="alert" sx={{ mb: 2 }}>
            {state.message}
          </Alert>
        )}
        <form action={formAction} noValidate>
          <Stack spacing={2}>
            <TextField
              name="email"
              type="email"
              label="Email"
              autoComplete="username"
              defaultValue={(state.values.email as string) ?? ""}
              error={Boolean(errors.email)}
              helperText={errors.email}
              autoFocus
            />
            <TextField
              name="password"
              type="password"
              label="Mot de passe"
              autoComplete="current-password"
              error={Boolean(errors.password)}
              helperText={errors.password}
            />
            <Button type="submit" variant="contained" disabled={pending}>
              Se connecter
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
