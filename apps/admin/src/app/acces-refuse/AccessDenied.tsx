"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { ClubLogo } from "@/components/ClubLogo";
import { logout } from "../(admin)/actions";

export default function AccessDenied() {
  return (
    <Box component="main" sx={{ px: 2, py: 6, maxWidth: 360, mx: "auto" }}>
      <ClubLogo width={160} eager />
      <Typography
        variant="h1"
        sx={{ mt: 4, mb: 2, pb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        Accès refusé.
      </Typography>
      <form action={logout}>
        <Button type="submit" variant="outlined">
          Se déconnecter
        </Button>
      </form>
    </Box>
  );
}
