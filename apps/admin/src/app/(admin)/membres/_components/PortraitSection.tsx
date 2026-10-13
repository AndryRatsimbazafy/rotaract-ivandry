"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ConfirmDialog from "@/components/ConfirmDialog";
import ImageSheet from "@/components/ImageSheet";
import ImageThumb from "@/components/ImageThumb";
import { SectionHeading } from "@/components/PageHeader";
import type { ActionResult, FormState } from "@/lib/form-state";
import { tabularNums } from "@/theme/theme";
import { PORTRAIT_MIN_WIDTH, type AdminImage } from "@/types/media";

type Props = {
  portrait: AdminImage | null;
  // Actions déjà liées au membre.
  setAction: (state: FormState, formData: FormData) => Promise<FormState>;
  updateAction: (state: FormState, formData: FormData) => Promise<FormState>;
  removeAction: (here: string) => Promise<ActionResult>;
};

type Sheet = "add" | "replace" | "edit" | null;

const TITLES = {
  add: "Ajouter un portrait",
  replace: "Remplacer le portrait",
  edit: "Modifier l'image",
};

// Portrait d'un membre (contracts/admin-screens.md) : un au plus, ajouté,
// remplacé, modifié ou retiré sur la fiche.
export default function PortraitSection({
  portrait,
  setAction,
  updateAction,
  removeAction,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sheet, setSheet] = useState<Sheet>(null);

  const here = (() => {
    const query = new URLSearchParams(searchParams.toString());
    query.delete("avis");
    const text = query.toString();
    return text ? `${pathname}?${text}` : pathname;
  })();

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

  return (
    <Box component="section" aria-labelledby="portrait" sx={{ mt: 4, maxWidth: 720 }}>
      <SectionHeading id="portrait" title="Portrait" />
      {portrait ? (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
          <ImageThumb
            url={portrait.url}
            alt={portrait.alt}
            focus={portrait.focus}
            ratio="4 / 5"
            width={160}
            sizes="160px"
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2">{portrait.alt}</Typography>
            {portrait.caption && (
              <Typography variant="caption" color="text.secondary" component="p">
                {portrait.caption}
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 1, ...tabularNums }}>
              {portrait.width} × {portrait.height} px
            </Typography>
            {portrait.width < PORTRAIT_MIN_WIDTH && (
              <Typography variant="caption" component="p" sx={{ color: "warning.dark" }}>
                Image plus petite que la largeur conseillée : elle sera affichée en petit.
              </Typography>
            )}
            <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2, flexWrap: "wrap" }}>
              <Button variant="outlined" size="small" onClick={() => setSheet("replace")}>
                Remplacer
              </Button>
              <Button size="small" onClick={() => setSheet("edit")}>
                Modifier
              </Button>
              <ConfirmDialog
                triggerLabel="Retirer"
                title="Retirer ce portrait ?"
                text="Le fichier sera supprimé."
                confirmLabel="Retirer"
                action={removeAction.bind(null, here)}
              />
            </Stack>
          </Box>
        </Stack>
      ) : (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ alignItems: { sm: "center" } }}>
          <Box
            aria-hidden
            sx={{
              width: 160,
              aspectRatio: "4 / 5",
              bgcolor: "var(--grid-chrome)",
              border: 1,
              borderColor: "divider",
            }}
          />
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Aucun portrait.
            </Typography>
            <Button variant="outlined" size="small" onClick={() => setSheet("add")}>
              Ajouter un portrait
            </Button>
          </Box>
        </Stack>
      )}
      {sheet && (
        <ImageSheet
          key={sheet}
          title={TITLES[sheet]}
          mode={sheet === "edit" ? "edit" : "upload"}
          initial={sheet === "edit" ? (portrait ?? undefined) : undefined}
          recommendedWidth={PORTRAIT_MIN_WIDTH}
          action={sheet === "edit" ? updateAction : setAction}
          onClose={() => setSheet(null)}
          onSaved={() => saved(sheet === "add" ? "cree" : "modifie")}
        />
      )}
    </Box>
  );
}
