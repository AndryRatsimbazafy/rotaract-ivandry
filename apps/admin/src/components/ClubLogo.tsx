"use client";

import Image from "next/image";
import Box from "@mui/material/Box";

// Logo complet (960 × 299) : mot-symbole cranberry sur fond clair, inversé en
// blanc sur fond sombre. Le thème actif choisit la variante en CSS, sans
// écart d'hydratation.
const RATIO = 299 / 960;
const ALT = "Rotaract Club Ivandry";

export function ClubLogo({ width, eager = false }: { width: number; eager?: boolean }) {
  const height = Math.round(width * RATIO);
  const img = (src: string) => (
    <Image
      src={src}
      alt={ALT}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      style={{ display: "block" }}
    />
  );
  return (
    <Box sx={{ width, height, flexShrink: 0 }}>
      <Box
        sx={(theme) => ({
          display: "block",
          ...theme.applyStyles("dark", { display: "none" }),
        })}
      >
        {img("/images/logo-club-light.png")}
      </Box>
      <Box
        sx={(theme) => ({
          display: "none",
          ...theme.applyStyles("dark", { display: "block" }),
        })}
      >
        {img("/images/logo-club-dark.png")}
      </Box>
    </Box>
  );
}

// Emblème seul (508 × 560), pour la page de connexion. Décoratif si alt est vide.
export function ClubEmblem({ size, alt = "" }: { size: number; alt?: string }) {
  return (
    <Image
      src="/images/logo-emblem.png"
      alt={alt}
      width={Math.round((size * 508) / 560)}
      height={size}
      style={{ display: "block" }}
    />
  );
}
