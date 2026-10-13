"use client";

import Image from "next/image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { tabularNums } from "@/theme/theme";

export const DEFAULT_FOCUS = "50% 50%";
const STEP = 5;

function parse(focus: string): [number, number] {
  const match = /^(\d{1,3})% (\d{1,3})%$/.exec(focus);
  return match ? [Number(match[1]), Number(match[2])] : [50, 50];
}

const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

// Point d'intérêt d'une image : un clic sur la vignette, ou les flèches du
// clavier par pas de 5 %, placent le repère. Le site garde ce point visible
// quand il recadre l'image.
export default function FocusPicker({
  src,
  alt,
  width,
  height,
  value,
  onChange,
}: {
  // Adresse de l'image, ou adresse locale (blob:) d'une image pas encore
  // envoyée.
  src: string;
  alt: string;
  width: number;
  height: number;
  value: string;
  onChange: (focus: string) => void;
}) {
  const local = src.startsWith("blob:");
  const style = {
    display: "block",
    maxWidth: "100%",
    maxHeight: 360,
    width: "auto",
    height: "auto",
  } as const;
  const [x, y] = parse(value);
  const set = (nextX: number, nextY: number) =>
    onChange(`${clamp(nextX)}% ${clamp(nextY)}%`);

  return (
    <Box>
      <Box
        role="button"
        tabIndex={0}
        aria-label={`Point d'intérêt : ${x} %, ${y} %. Cliquez sur l'image ou utilisez les flèches pour le déplacer.`}
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          set(
            ((event.clientX - bounds.left) / bounds.width) * 100,
            ((event.clientY - bounds.top) / bounds.height) * 100,
          );
        }}
        onKeyDown={(event) => {
          const moves: Record<string, [number, number]> = {
            ArrowLeft: [-STEP, 0],
            ArrowRight: [STEP, 0],
            ArrowUp: [0, -STEP],
            ArrowDown: [0, STEP],
          };
          const move = moves[event.key];
          if (move) {
            event.preventDefault();
            set(x + move[0], y + move[1]);
          }
        }}
        sx={{
          position: "relative",
          display: "inline-block",
          maxWidth: "100%",
          lineHeight: 0,
          cursor: "crosshair",
          border: 1,
          borderColor: "divider",
          bgcolor: "var(--grid-chrome)",
          "&:focus-visible": {
            outline: 2,
            outlineColor: "primary.main",
            outlineOffset: 2,
          },
        }}
      >
        {/* Image entière, sans recadrage : le repère porte sur toute l'image.
            Une image pas encore envoyée n'existe que dans le navigateur. */}
        {local || !width || !height ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} draggable={false} style={style} />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes="432px"
            draggable={false}
            style={style}
          />
        )}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            width: 16,
            height: 16,
            ml: "-8px",
            mt: "-8px",
            borderRadius: "50%",
            border: 2,
            borderColor: "primary.main",
            boxShadow: "0 0 0 2px rgba(255, 255, 255, 0.9)",
            pointerEvents: "none",
          }}
        />
      </Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={tabularNums}>
          {x} % · {y} %
        </Typography>
        <Button size="small" onClick={() => onChange(DEFAULT_FOCUS)}>
          Recentrer
        </Button>
      </Stack>
    </Box>
  );
}
