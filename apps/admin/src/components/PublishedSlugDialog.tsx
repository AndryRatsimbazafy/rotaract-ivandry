"use client";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// Changer le slug d'un contenu publié change son adresse publique : c'est
// signalé, sans être empêché.
export default function PublishedSlugDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="slug-titre"
      aria-describedby="slug-texte"
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id="slug-titre">Modifier le slug ?</DialogTitle>
      <DialogContent>
        <DialogContentText id="slug-texte">
          L&apos;adresse publique de ce contenu va changer.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Annuler</Button>
        <Button variant="contained" onClick={onConfirm}>
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
