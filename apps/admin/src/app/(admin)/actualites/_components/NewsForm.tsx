"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PublishedSlugDialog from "@/components/PublishedSlugDialog";
import RotaryYearField from "@/components/RotaryYearField";
import SlugField from "@/components/SlugField";
import { useFocusFirstError } from "@/components/useFocusFirstError";
import { usePublishedSlugGuard } from "@/components/usePublishedSlugGuard";
import type { ComparableYear } from "@/lib/dates";
import {
  EMPTY_FORM_STATE,
  fieldValue,
  type FormState,
} from "@/lib/form-state";
import { NEWS_TYPE_OPTIONS } from "@/lib/labels";

export type NewsFormInitial = {
  // date : valeur du champ, déjà exprimée en heure de Madagascar par le serveur.
  values: Record<string, string>;
  isPublished: boolean;
  publishedAt?: string;
};

type Props = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  initial?: NewsFormInitial;
  // Années, bornes au format du champ (AAAA-MM-JJTHH:mm, heure de Madagascar).
  years: ComparableYear[];
  returnTo: string;
};

const NO_INITIAL: NewsFormInitial = { values: {}, isPublished: false };

export default function NewsForm({
  action,
  initial = NO_INITIAL,
  years,
  returnTo,
}: Props) {
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);
  const ref = useFocusFirstError(state);
  const errors = state.fieldErrors ?? {};
  const value = (name: string) => fieldValue(state, initial.values, name);
  const [date, setDate] = useState(initial.values.date ?? "");
  const guard = usePublishedSlugGuard(
    initial.isPublished,
    initial.values.slug ?? "",
  );
  const published =
    "title" in state.values
      ? state.values.isPublished === "true"
      : initial.isPublished;
  const noYear = years.length === 0;

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 720 }}>
      <form action={formAction} onSubmit={guard.onSubmit} ref={ref} noValidate>
        <input type="hidden" name="retour" value={returnTo} />
        <Stack spacing={2}>
          {state.message && (
            <Alert severity="error" role="alert">
              {state.message}
            </Alert>
          )}

          <Typography variant="h2">Contenu</Typography>
          <TextField
            name="title"
            label="Titre"
            required
            defaultValue={value("title")}
            error={Boolean(errors.title)}
            helperText={errors.title}
            slotProps={{ htmlInput: { maxLength: 120 } }}
          />
          <SlugField defaultValue={value("slug")} error={errors.slug} />
          <TextField
            select
            name="type"
            label="Type"
            required
            defaultValue={value("type")}
            error={Boolean(errors.type)}
            helperText={errors.type}
            slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
          >
            <option value="">Choisir un type</option>
            {NEWS_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </TextField>
          <TextField
            name="location"
            label="Lieu"
            defaultValue={value("location")}
            error={Boolean(errors.location)}
            helperText={errors.location}
            slotProps={{ htmlInput: { maxLength: 120 } }}
          />
          <TextField
            name="summary"
            label="Résumé"
            multiline
            minRows={2}
            defaultValue={value("summary")}
            error={Boolean(errors.summary)}
            helperText={errors.summary}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
          <TextField
            name="content"
            label="Contenu"
            multiline
            minRows={6}
            defaultValue={value("content")}
            error={Boolean(errors.content)}
            helperText={
              errors.content ?? "Séparez les paragraphes par une ligne vide."
            }
            slotProps={{ htmlInput: { maxLength: 20000 } }}
          />

          <Typography variant="h2">Calendrier</Typography>
          <TextField
            name="date"
            type="datetime-local"
            label="Date et heure (heure de Madagascar)"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
            error={Boolean(errors.date)}
            helperText={
              errors.date ??
              "Saisie en heure de Madagascar, quel que soit le fuseau de cet ordinateur."
            }
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <RotaryYearField
            years={years}
            dateValue={date}
            initialYearId={value("rotaryYear") || undefined}
            error={errors.rotaryYear}
          />

          <Typography variant="h2">Publication</Typography>
          <FormControlLabel
            label="Publié"
            control={
              <Switch
                name="isPublished"
                value="true"
                defaultChecked={published}
              />
            }
          />
          {errors.isPublished && (
            <FormHelperText error>{errors.isPublished}</FormHelperText>
          )}
          {initial.publishedAt && (
            <Typography color="text.secondary">
              Première publication le {initial.publishedAt}
            </Typography>
          )}

          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={pending || noYear}>
              Enregistrer
            </Button>
            <Button component={Link} href={returnTo} disabled={pending}>
              Annuler
            </Button>
          </Stack>
        </Stack>
      </form>
      <PublishedSlugDialog
        open={guard.open}
        onCancel={guard.cancel}
        onConfirm={guard.confirm}
      />
    </Paper>
  );
}
