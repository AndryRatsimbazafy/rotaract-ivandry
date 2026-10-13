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
import type { SitePhotoSlotInfo } from "@/content/site";
import type { ActionResult, FormState } from "@/lib/form-state";
import { tabularNums } from "@/theme/theme";
import type { AdminImage } from "@/types/media";

type Props = {
  info: SitePhotoSlotInfo;
  image: AdminImage | undefined;
  // Actions déjà liées à l'emplacement.
  setAction: (state: FormState, formData: FormData) => Promise<FormState>;
  updateAction: (state: FormState, formData: FormData) => Promise<FormState>;
  removeAction: () => Promise<ActionResult>;
};

type Sheet = "add" | "replace" | "edit" | null;

const TITLES = {
  add: "Ajouter une photographie",
  replace: "Remplacer la photographie",
  edit: "Modifier l'image",
};

const THUMB_WIDTH = 160;

// Un emplacement photographique fixe du site (contracts/admin-screens.md) :
// vide ou occupé par une image, ajoutée, remplacée, modifiée ou retirée.
export default function SitePhotoCard({
  info,
  image,
  setAction,
  updateAction,
  removeAction,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sheet, setSheet] = useState<Sheet>(null);
  const headingId = `emplacement-${info.slot}`;

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
    <Box
      component="article"
      aria-labelledby={headingId}
      sx={{ minWidth: 0, py: 2, borderTop: 1, borderColor: "divider" }}
    >
      <Typography variant="overline" color="text.secondary" component="p">
        {info.page}
      </Typography>
      <Typography variant="h3" id={headingId}>
        {info.label}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
        <Box component="span" sx={{ ...tabularNums, fontWeight: 600, color: "text.primary" }}>
          {info.format}
        </Box>
        {" · "}
        {info.brief}
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        {image ? (
          <ImageThumb
            url={image.url}
            alt={image.alt}
            focus={image.focus}
            ratio={info.ratio}
            width={THUMB_WIDTH}
            sizes={`${THUMB_WIDTH}px`}
          />
        ) : (
          <Box
            aria-hidden
            sx={{
              width: THUMB_WIDTH,
              flexShrink: 0,
              aspectRatio: info.ratio,
              bgcolor: "var(--grid-chrome)",
              border: 1,
              borderColor: "divider",
            }}
          />
        )}
        <Box sx={{ minWidth: 0 }}>
          {image ? (
            <>
              <Typography variant="body2">{image.alt}</Typography>
              {image.caption && (
                <Typography variant="caption" color="text.secondary" component="p">
                  {image.caption}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mt: 1, ...tabularNums }}>
                {image.width} × {image.height} px
              </Typography>
              {image.width < info.recommendedWidth && (
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
                  title="Retirer cette photographie ?"
                  text="Le fichier sera supprimé. Le site reviendra à son emplacement d'origine."
                  confirmLabel="Retirer"
                  action={removeAction}
                />
              </Stack>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {info.emptyText}
              </Typography>
              <Button variant="outlined" size="small" onClick={() => setSheet("add")}>
                Ajouter une photographie
              </Button>
            </>
          )}
        </Box>
      </Stack>
      {sheet && (
        <ImageSheet
          key={sheet}
          title={TITLES[sheet]}
          mode={sheet === "edit" ? "edit" : "upload"}
          initial={sheet === "edit" ? image : undefined}
          recommendedWidth={info.recommendedWidth}
          action={sheet === "edit" ? updateAction : setAction}
          onClose={() => setSheet(null)}
          onSaved={() => saved(sheet === "add" ? "cree" : "modifie")}
        />
      )}
    </Box>
  );
}
