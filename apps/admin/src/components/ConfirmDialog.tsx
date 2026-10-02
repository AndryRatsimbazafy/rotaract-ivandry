"use client";

import { useId, useState, useTransition } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import type { ActionResult } from "@/lib/form-state";

type Props = {
  // Libellé du bouton qui ouvre le dialogue ; il nomme l'élément.
  triggerLabel: string;
  ariaLabel?: string;
  title: string;
  // Nomme l'élément et annonce la conséquence.
  text: string;
  confirmLabel?: string;
  action: () => Promise<ActionResult>;
  variant?: "text" | "outlined";
};

// Confirmation d'une suppression. En cas d'échec, le message reste dans le
// dialogue et un nouvel essai est possible.
export default function ConfirmDialog({
  triggerLabel,
  ariaLabel,
  title,
  text,
  confirmLabel = "Supprimer",
  action,
  variant = "text",
}: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const titleId = useId();
  const textId = useId();

  const close = () => {
    if (!pending) {
      setOpen(false);
      setError(undefined);
    }
  };

  const confirm = () =>
    startTransition(async () => {
      const result = await action();
      if (result?.message) {
        setError(result.message);
      } else {
        setOpen(false);
      }
    });

  return (
    <>
      <Button
        color="error"
        size="small"
        variant={variant}
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>
      <Dialog
        open={open}
        onClose={close}
        aria-labelledby={titleId}
        aria-describedby={textId}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id={titleId}>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id={textId}>{text}</DialogContentText>
          {error && (
            <Alert severity="error" role="alert" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={close} disabled={pending}>
            Annuler
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirm}
            disabled={pending}
          >
            {confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
