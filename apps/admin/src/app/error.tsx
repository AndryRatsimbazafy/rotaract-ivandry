"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

// Erreur hors de l'espace protégé. Aucun détail technique n'est montré.
export default function RootError({ retry }: { retry: () => void }) {
  return (
    <Box component="main" sx={{ p: 3, maxWidth: 560, mx: "auto" }}>
      <Alert
        severity="error"
        role="alert"
        action={
          <Button color="inherit" size="small" onClick={() => retry()}>
            Réessayer
          </Button>
        }
      >
        Une erreur est survenue. Réessayez.
      </Alert>
    </Box>
  );
}
