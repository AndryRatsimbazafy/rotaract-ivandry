"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import MoreVert from "@mui/icons-material/MoreVert";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import type { ActionResult } from "@/lib/form-state";
import ConfirmDialog from "./ConfirmDialog";

type Props = {
  // Nom de l'élément, pour les noms accessibles.
  name: string;
  openHref?: string;
  // Publication : l'action bascule l'état courant.
  publish?: { isPublished: boolean; action: () => Promise<ActionResult> };
  // Suppression : textes de confirmation existants.
  remove?: { title: string; text: string; action: () => Promise<ActionResult> };
};

// Menu d'actions d'une ligne de grille : Ouvrir, Publier ou Dépublier,
// Supprimer (avec la confirmation existante). Un clic ici ne choisit pas la
// ligne.
export default function RowMenu({ name, openHref, publish, remove }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const close = () => setAnchor(null);

  return (
    <>
      <IconButton
        size="small"
        aria-label={`Actions pour ${name}`}
        aria-haspopup="menu"
        disabled={pending}
        onClick={(event) => {
          event.stopPropagation();
          setAnchor(event.currentTarget);
        }}
      >
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {openHref && (
          <MenuItem component={Link} href={openHref} onClick={close}>
            Ouvrir
          </MenuItem>
        )}
        {publish && (
          <MenuItem
            onClick={() => {
              close();
              startTransition(async () => {
                const result = await publish.action();
                setError(result?.message);
              });
            }}
          >
            {publish.isPublished ? "Dépublier" : "Publier"}
          </MenuItem>
        )}
        {remove && (
          <MenuItem
            sx={{ color: "error.main" }}
            onClick={() => {
              close();
              setConfirming(true);
            }}
          >
            Supprimer
          </MenuItem>
        )}
      </Menu>
      {remove && (
        <ConfirmDialog
          open={confirming}
          onClose={() => setConfirming(false)}
          title={remove.title}
          text={remove.text}
          action={remove.action}
        />
      )}
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
