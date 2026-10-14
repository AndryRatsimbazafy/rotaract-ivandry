import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import type { Photo } from "@/types/media";

// Image de partage d'une page (fonctionnalité 015, DESIGN.md, section 7) : la
// photographie en plein cadre, le Voile, le logo, le trait d'or et le titre en
// blanc. Composée sur le serveur par next/og ; rien n'est enregistré.

export const SHARE_SIZE = { width: 1200, height: 630 };
export const SHARE_CONTENT_TYPE = "image/png";

// Valeurs de tokens.css : next/og ne lit pas les variables CSS.
const INK = "#0f1c36";
const GOLD = "#f7a81b";
const VEIL = "rgba(15, 28, 54, 0.5)";

const TITLE_MAX = 90;

/** Abrège un titre trop long au dernier mot entier, jamais au milieu d'un mot. */
export function shareTitle(title: string): string {
  const clean = title.trim();
  if (clean.length <= TITLE_MAX) return clean;
  const cut = clean.slice(0, TITLE_MAX);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–-]+$/, "")}…`;
}

/** Texte alternatif de l'image : « <titre> — Rotaract Club Ivandry ». */
export function shareAlt(title: string): string {
  return title === site.name ? site.name : `${title} — ${site.name}`;
}

const publicFile = (path: string) => join(process.cwd(), "public", path);

// Lus une fois par processus : ils ne dépendent pas de la page.
const logo = readFile(publicFile("images/logo-club-sans-texte.png")).then(
  (data) => `data:image/png;base64,${data.toString("base64")}`,
);

// Open Sans condensée grasse (licence OFL), versionnée : next/og ne lit pas le
// woff2 de next/font. Sans le fichier, l'image garde la police par défaut de next/og.
const titleFont = readFile(
  join(process.cwd(), "src/assets/fonts/OpenSans-CondensedBold.ttf"),
).catch(() => null);

/** Adresse lisible par next/og : une adresse absolue, ou le fichier public lu en données. */
async function imageSource(src: string): Promise<string> {
  if (/^https?:\/\//.test(src)) return src;
  const data = await readFile(publicFile(src.replace(/^\//, "")));
  const type = src.endsWith(".png") ? "image/png" : "image/jpeg";
  return `data:${type};base64,${data.toString("base64")}`;
}

/** La photographie d'ouverture livrée avec le site : le dernier repli. */
export const BUNDLED_PHOTO: Photo = {
  src: "/images/Image-16-9.jpeg",
  width: 1920,
  height: 1080,
  alt: "",
  focus: "55% 40%",
};

export async function renderShareImage({
  title,
  photo,
}: {
  title: string;
  /** Photographie du contenu ou de l'ouverture de la page ; à défaut, celle du site. */
  photo?: Photo;
}): Promise<ImageResponse> {
  const image = photo ?? BUNDLED_PHOTO;
  const [background, logoSrc, font] = await Promise.all([
    imageSource(image.src),
    logo,
    titleFont,
  ]);
  const text = shareTitle(title);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: SHARE_SIZE.width,
          height: SHARE_SIZE.height,
          backgroundColor: INK,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og compose une image, pas une page. */}
        <img
          src={background}
          alt=""
          width={SHARE_SIZE.width}
          height={SHARE_SIZE.height}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: SHARE_SIZE.width,
            height: SHARE_SIZE.height,
            objectFit: "cover",
            objectPosition: image.focus ?? "50% 50%",
          }}
        />
        {/* Le Voile : encre à 50 %, uni, sur toute l'image. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: SHARE_SIZE.width,
            height: SHARE_SIZE.height,
            display: "flex",
            backgroundColor: VEIL,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: SHARE_SIZE.width,
            height: SHARE_SIZE.height,
            display: "flex",
            flexDirection: "column",
            padding: "56px 64px 64px",
          }}
        >
          {/* Le logo sans texte a un fond blanc : il est posé sur une tuile blanche. */}
          <div style={{ display: "flex", padding: 10, backgroundColor: "#ffffff", alignSelf: "flex-start" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- next/og compose une image, pas une page. */}
            <img src={logoSrc} alt="" width={64} height={70} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 820, marginTop: "auto" }}>
            <div style={{ display: "flex", width: 96, height: 4, backgroundColor: GOLD }} />
            <div
              style={{
                display: "flex",
                marginTop: 24,
                color: "#ffffff",
                ...(font ? { fontFamily: "Open Sans Condensed" } : {}),
                fontSize: text.length > 60 ? 52 : 64,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
              }}
            >
              {text}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...SHARE_SIZE,
      fonts: font
        ? [{ name: "Open Sans Condensed", data: font, style: "normal", weight: 700 }]
        : undefined,
    },
  );
}
