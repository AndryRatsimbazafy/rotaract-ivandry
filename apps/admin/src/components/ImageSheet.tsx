"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { EMPTY_FORM_STATE, type FormState } from "@/lib/form-state";
import { prepareImage, type PreparedImage } from "@/lib/image-reduction";
import { tabularNums } from "@/theme/theme";
import type { AdminImage } from "@/types/media";
import FocusPicker, { DEFAULT_FOCUS } from "./FocusPicker";
import SideSheet from "./SideSheet";

type Props = {
  title: string;
  // Envoi d'un fichier (ajout, remplacement) ou modification des champs.
  mode: "upload" | "edit";
  initial?: AdminImage;
  // Largeur conseillée : 1200 px pour un portrait, 1600 px pour une photographie.
  recommendedWidth: number;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  onClose: () => void;
  // Appelée après un enregistrement réussi.
  onSaved: () => void;
};

const SMALL_IMAGE =
  "Image plus petite que la largeur conseillée : elle sera affichée en petit.";

// Panneau de saisie d'une image (contracts/admin-screens.md) : choix et
// préparation du fichier, point d'intérêt, texte alternatif, légende, crédit.
export default function ImageSheet({
  title,
  mode,
  initial,
  recommendedWidth,
  action,
  onClose,
  onSaved,
}: Props) {
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);
  const [, startTransition] = useTransition();
  const [prepared, setPrepared] = useState<PreparedImage | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [fileError, setFileError] = useState<string>();
  const [focus, setFocus] = useState(initial?.focus ?? DEFAULT_FOCUS);
  const fileInput = useRef<HTMLInputElement>(null);
  const errors = state.fieldErrors ?? {};

  // Une seule fois par enregistrement réussi, même si l'appelant change.
  const done = useRef<FormState | null>(null);
  useEffect(() => {
    if (state.ok && done.current !== state) {
      done.current = state;
      onSaved();
    }
  }, [state, onSaved]);

  // L'adresse locale de la prévisualisation est libérée à la fermeture.
  useEffect(
    () => () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    },
    [preview],
  );

  const choose = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    setFileError(undefined);
    setPrepared(null);
    setPreview(null);
    setPreparing(true);
    try {
      const image = await prepareImage(file);
      setPrepared(image);
      setPreview(URL.createObjectURL(image.blob));
      setFocus(DEFAULT_FOCUS);
    } catch (error) {
      setFileError(error instanceof Error ? error.message : undefined);
    } finally {
      setPreparing(false);
    }
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "upload" && !prepared) {
      setFileError("Choisissez une image.");
      return;
    }
    const data = new FormData(event.currentTarget);
    data.set("focus", focus);
    if (prepared) {
      data.set("image", prepared.blob, prepared.name);
    }
    startTransition(() => formAction(data));
  };

  const width = prepared?.width ?? initial?.width ?? 0;
  const height = prepared?.height ?? initial?.height ?? 0;
  const imageSrc = preview ?? (mode === "edit" ? initial?.url : undefined);
  const value = (name: "alt" | "caption" | "credit" | "altEn" | "captionEn") => {
    const saved = state.values[name];
    return typeof saved === "string" ? saved : (initial?.[name] ?? "");
  };

  return (
    <SideSheet open onClose={pending ? () => {} : onClose} title={title}>
      <form onSubmit={submit} noValidate>
        <Stack spacing={2}>
          {state.message && (
            <Alert severity="error" role="alert">
              {state.message}
            </Alert>
          )}

          {mode === "upload" && (
            <Box>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(event) => {
                  void choose(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <Button
                variant="outlined"
                onClick={() => fileInput.current?.click()}
                disabled={preparing || pending}
              >
                {prepared ? "Choisir une autre image" : "Choisir une image"}
              </Button>
              {preparing && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Préparation de l&apos;image…
                  </Typography>
                  <LinearProgress sx={{ mt: 0.5 }} />
                </Box>
              )}
              {(fileError ?? errors.image) && (
                <FormHelperText error role="alert">
                  {fileError ?? errors.image}
                </FormHelperText>
              )}
            </Box>
          )}

          {imageSrc && (
            <Box>
              <FocusPicker
                src={imageSrc}
                alt=""
                width={width}
                height={height}
                value={focus}
                onChange={setFocus}
              />
              {width > 0 && (
                <Typography variant="body2" sx={{ mt: 1, ...tabularNums }}>
                  {width} × {height} px
                </Typography>
              )}
              {width > 0 && width < recommendedWidth && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  {SMALL_IMAGE}
                </Alert>
              )}
            </Box>
          )}

          <TextField
            name="alt"
            label="Texte alternatif"
            required
            multiline
            minRows={2}
            defaultValue={value("alt")}
            error={Boolean(errors.alt)}
            helperText={
              errors.alt ?? "Décrit ce que l'image montre, pour qui ne la voit pas."
            }
            slotProps={{ htmlInput: { maxLength: 300 } }}
          />
          <TextField
            name="caption"
            label="Légende"
            defaultValue={value("caption")}
            error={Boolean(errors.caption)}
            helperText={errors.caption ?? "Quoi, où, quand."}
            slotProps={{ htmlInput: { maxLength: 300 } }}
          />
          <TextField
            name="credit"
            label="Crédit"
            defaultValue={value("credit")}
            error={Boolean(errors.credit)}
            helperText={errors.credit}
            slotProps={{ htmlInput: { maxLength: 120 } }}
          />
          <TextField
            name="altEn"
            label="Texte alternatif (anglais)"
            defaultValue={value("altEn")}
            error={Boolean(errors.altEn)}
            helperText={errors.altEn ?? "Facultatif. Vide : le site anglais reprend le texte français."}
            slotProps={{ htmlInput: { maxLength: 300, lang: "en" } }}
          />
          <TextField
            name="captionEn"
            label="Légende (anglais)"
            defaultValue={value("captionEn")}
            error={Boolean(errors.captionEn)}
            helperText={errors.captionEn}
            slotProps={{ htmlInput: { maxLength: 300, lang: "en" } }}
          />
          {errors.focus && <FormHelperText error>{errors.focus}</FormHelperText>}

          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: "flex-end", pt: 2, borderTop: 1, borderColor: "divider" }}
          >
            <Button onClick={onClose} disabled={pending}>
              Annuler
            </Button>
            <Button type="submit" variant="contained" disabled={pending || preparing}>
              {pending ? "Envoi…" : "Enregistrer"}
            </Button>
          </Stack>
        </Stack>
      </form>
    </SideSheet>
  );
}
