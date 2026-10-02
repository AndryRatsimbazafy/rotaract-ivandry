"use client";

import { useState, useTransition } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import type { ActionResult } from "@/lib/form-state";

// Action directe sur une ligne (publier, dépublier). Un échec est affiché.
export default function RowAction({
  label,
  ariaLabel,
  action,
}: {
  label: string;
  ariaLabel: string;
  action: () => Promise<ActionResult>;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <>
      <Button
        size="small"
        aria-label={ariaLabel}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await action();
            setError(result?.message);
          })
        }
      >
        {label}
      </Button>
      <Snackbar
        open={Boolean(error)}
        onClose={() => setError(undefined)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" role="alert" onClose={() => setError(undefined)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
