"use client";

import { useActionState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { ClubEmblem, ClubLogo } from "@/components/ClubLogo";
import ColorModeButton from "@/components/ColorModeButton";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { BRAND } from "@/theme/theme";
import { login } from "../actions";

// Trame du panneau Royal Blue : filets de 1 px tous les 32 px.
const RULE = alpha("#ffffff", 0.07);
const ruledPanel = {
  backgroundColor: BRAND.royalBlue,
  backgroundImage: `linear-gradient(${RULE} 1px, transparent 1px), linear-gradient(90deg, ${RULE} 1px, transparent 1px)`,
  backgroundSize: "32px 32px",
  backgroundPosition: "-1px -1px",
};

// Page de connexion, seule composition à part (apps/admin/DESIGN.md) :
// formulaire sur la feuille et, dès 900 px, panneau du club.
export default function LoginForm({ expired }: { expired: boolean }) {
  const [state, formAction, pending] = useActionState(login, EMPTY_FORM_STATE);
  const errors = state.fieldErrors ?? {};

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 5fr) minmax(0, 4fr)" },
        bgcolor: "background.paper",
      }}
    >
      <Stack sx={{ px: { xs: 2.5, sm: 6 }, py: { xs: 2.5, sm: 4 } }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <ClubLogo width={176} eager />
          <ColorModeButton />
        </Stack>

        <Stack
          component="main"
          sx={{ flex: 1, justifyContent: "center", alignItems: "center", py: 6 }}
        >
          <Box sx={{ width: "100%", maxWidth: 360 }}>
            <Box sx={{ pb: 2, mb: 3, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="h1">Administration</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Rotaract Club Ivandry
              </Typography>
            </Box>
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
                  size="medium"
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
                  size="medium"
                  autoComplete="current-password"
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={pending}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Se connecter
                </Button>
              </Stack>
            </form>
          </Box>
        </Stack>
      </Stack>

      {/* Panneau du club : l'emblème sur la trame, en Royal Blue. */}
      <Stack
        aria-hidden
        sx={{
          display: { xs: "none", md: "flex" },
          justifyContent: "space-between",
          p: 5,
          color: "#fff",
          ...ruledPanel,
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "grid",
            placeItems: "center",
            "& img": { width: "min(20vw, 240px)", height: "auto" },
          }}
        >
          <ClubEmblem size={300} />
        </Box>
        <Box sx={{ borderTop: `1px solid ${alpha("#ffffff", 0.24)}`, pt: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.125rem" }}>
            Rotaract Club Ivandry
          </Typography>
          <Typography variant="body2" sx={{ color: alpha("#ffffff", 0.72) }}>
            Administration du site
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
