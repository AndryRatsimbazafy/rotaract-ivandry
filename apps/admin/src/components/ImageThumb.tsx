import Image from "next/image";
import Box from "@mui/material/Box";

// Vignette d'une image du site : cadre au format donné, recadré selon le
// point d'intérêt, sur fond d'outillage.
export default function ImageThumb({
  url,
  alt,
  focus,
  ratio,
  width,
  sizes,
}: {
  url: string;
  alt: string;
  focus: string;
  // « 4 / 5 », « 3 / 2 ».
  ratio: string;
  // Largeur du cadre ; absente : toute la largeur disponible.
  width?: number;
  sizes: string;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        width: width ?? "100%",
        aspectRatio: ratio,
        flexShrink: 0,
        overflow: "hidden",
        bgcolor: "var(--grid-chrome)",
        border: 1,
        borderColor: "divider",
      }}
    >
      <Image
        src={url}
        alt={alt}
        fill
        sizes={sizes}
        style={{ objectFit: "cover", objectPosition: focus }}
      />
    </Box>
  );
}
