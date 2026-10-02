"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

// Aucun détail technique n'est montré.
export default function ErrorState({ retry }: { retry: () => void }) {
  return (
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
  );
}
