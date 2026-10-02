"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { logout } from "../(admin)/actions";

export default function AccessDenied() {
  return (
    <Box component="main" sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h1" sx={{ mb: 2 }}>
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
