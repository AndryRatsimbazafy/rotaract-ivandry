"use client";

import { useCallback, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type { ActionResult, FormState } from "@/lib/form-state";
import { tabularNums } from "@/theme/theme";
import { PHOTO_MIN_WIDTH, PHOTOS_MAX, type AdminImage } from "@/types/media";
import ImageSheet from "./ImageSheet";
import ImageThumb from "./ImageThumb";
import { SectionHeading } from "./PageHeader";
import RowMenu from "./RowMenu";
import { StatusMark } from "./StatusMark";

type Props = {
  photos: AdminImage[];
  // Actions déjà liées au contenu.
  addAction: (state: FormState, formData: FormData) => Promise<FormState>;
  updateAction: (
    photoId: string,
    state: FormState,
    formData: FormData,
  ) => Promise<FormState>;
  removeAction: (photoId: string, here: string) => Promise<ActionResult>;
  reorderAction: (photoIds: string[], here: string) => Promise<ActionResult>;
};

type Sheet = { kind: "add" } | { kind: "edit"; photo: AdminImage } | null;

// Photographies d'une action ou d'une actualité (contracts/admin-screens.md) :
// la première est la principale ; l'ordre s'enregistre à chaque déplacement.
export default function PhotosSection({
  photos,
  addAction,
  updateAction,
  removeAction,
  reorderAction,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const here = (() => {
    const query = new URLSearchParams(searchParams.toString());
    query.delete("avis");
    const text = query.toString();
    return text ? `${pathname}?${text}` : pathname;
  })();
  const full = photos.length >= PHOTOS_MAX;

  const saved = useCallback(
    (notice: "cree" | "modifie") => {
      setSheet(null);
      const query = new URLSearchParams(searchParams.toString());
      query.set("avis", notice);
      router.replace(`${pathname}?${query.toString()}`, { scroll: false });
      router.refresh();
    },
    [pathname, router, searchParams],
  );

  const move = (index: number, step: number) => {
    const ids = photos.map((photo) => photo.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + step, 0, moved);
    startTransition(async () => {
      const result = await reorderAction(ids, here);
      setError(result?.message);
    });
  };

  const addButton = (
    <Button
      variant="outlined"
      size="small"
      onClick={() => setSheet({ kind: "add" })}
      disabled={full}
    >
      Ajouter une photographie
    </Button>
  );

  return (
    <Box component="section" aria-labelledby="photographies" sx={{ mt: 4, maxWidth: 960 }}>
      <SectionHeading
        id="photographies"
        title={
          <>
            Photographies ·{" "}
            <Box component="span" sx={tabularNums}>
              {photos.length} / {PHOTOS_MAX}
            </Box>
          </>
        }
        actions={
          full ? (
            <Tooltip title="20 photographies au plus.">
              <span>{addButton}</span>
            </Tooltip>
          ) : (
            addButton
          )
        }
      />
      {error && (
        <Alert severity="error" role="alert" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {photos.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          Aucune photographie.
        </Typography>
      ) : (
        <TableContainer sx={{ border: 1, borderColor: "divider" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rang</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Texte alternatif</TableCell>
                <TableCell>Dimensions</TableCell>
                <TableCell align="right">
                  <span className="visually-hidden">Actions</span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {photos.map((photo, index) => (
                <TableRow key={photo.id}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Box component="span" sx={{ ...tabularNums, mr: 1 }}>
                      {index + 1}
                    </Box>
                    {index === 0 && <StatusMark label="Principale" color="info" />}
                  </TableCell>
                  <TableCell sx={{ width: 120 }}>
                    <ImageThumb
                      url={photo.url}
                      alt=""
                      focus={photo.focus}
                      ratio="3 / 2"
                      width={96}
                      sizes="96px"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {photo.alt}
                    </Typography>
                    {photo.caption && (
                      <Typography variant="caption" color="text.secondary">
                        {photo.caption}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Box component="span" sx={tabularNums}>
                      {photo.width} × {photo.height} px
                    </Box>
                    {photo.width < PHOTO_MIN_WIDTH && (
                      <Typography
                        variant="caption"
                        component="p"
                        sx={{ color: "warning.dark", whiteSpace: "normal", maxWidth: 180 }}
                      >
                        Plus petite que la largeur conseillée.
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap", py: 0 }}>
                    <IconButton
                      size="small"
                      aria-label={`Monter la photographie ${index + 1}`}
                      disabled={index === 0 || pending}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUpward fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label={`Descendre la photographie ${index + 1}`}
                      disabled={index === photos.length - 1 || pending}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDownward fontSize="small" />
                    </IconButton>
                    <RowMenu
                      name={`la photographie ${index + 1}`}
                      edit={{
                        label: "Modifier",
                        onClick: () => setSheet({ kind: "edit", photo }),
                      }}
                      remove={{
                        title: "Retirer cette photographie ?",
                        text: "Le fichier sera supprimé.",
                        action: removeAction.bind(null, photo.id, here),
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {sheet?.kind === "add" && (
        <ImageSheet
          title="Ajouter une photographie"
          mode="upload"
          recommendedWidth={PHOTO_MIN_WIDTH}
          action={addAction}
          onClose={() => setSheet(null)}
          onSaved={() => saved("cree")}
        />
      )}
      {sheet?.kind === "edit" && (
        <ImageSheet
          key={sheet.photo.id}
          title="Modifier l'image"
          mode="edit"
          initial={sheet.photo}
          recommendedWidth={PHOTO_MIN_WIDTH}
          action={updateAction.bind(null, sheet.photo.id)}
          onClose={() => setSheet(null)}
          onSaved={() => saved("modifie")}
        />
      )}
    </Box>
  );
}
