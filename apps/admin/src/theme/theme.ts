"use client";

import { alpha, createTheme } from "@mui/material/styles";

// Thème du Back Office : direction « La grille » (apps/admin/DESIGN.md),
// reprise de l'application de trésorerie du club. DESIGN.md, à la racine, ne
// régit pas cette application.

// Couleurs officielles de la charte Rotary (brandcenter.rotary.org), sans
// retouche.
export const BRAND = {
  cranberry: "#d41367", // couleur Rotaract
  royalBlue: "#17458f",
  azure: "#0067c8",
  skyBlue: "#00a2e0",
  gold: "#f7a81b",
  lawnGreen: "#009739",
  cardinal: "#e02927",
  slate: "#657f99",
  mouseGray: "#9ba4b4",
  pastelBlue: "#b9d9eb",
} as const;

// Neutres de la grille, dérivés du Royal Blue. sheet porte les données,
// chrome les bords outillés, rule les filets de cellule, ruleStrong les
// séparations de zone, field le contour des champs.
export const GRID = {
  light: {
    ink: "#152238",
    muted: "#566173",
    sheet: "#ffffff",
    chrome: "#f4f5f8",
    rule: "#e2e5eb",
    ruleStrong: "#c9ced8",
    // 3:1 sur la feuille et le chrome (WCAG 1.4.11).
    field: "#858e9e",
  },
  dark: {
    ink: "#e6ebf2",
    muted: "#9aa4b6",
    sheet: "#0f1623",
    chrome: "#141d2c",
    rule: "#222d40",
    ruleStrong: "#324059",
    field: "#64728c",
  },
} as const;

// Open Sans pour l'interface ; Red Hat Mono pour les nombres seuls.
const SANS = "var(--font-sans), Arial, sans-serif";
export const MONO = 'var(--font-mono), "Courier New", monospace';

// Courbe de sortie franche : démarre vite, se pose doucement.
export const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

// Hauteur de la barre du haut : en-têtes figés et panneaux collants.
export const TOPBAR_HEIGHT = 48;

// Ombres des surfaces flottantes : teintées d'encre en clair, noires en sombre.
const FLOAT_SHADOW = {
  dialog: (ink: string, a: number) => `0 24px 48px -12px ${alpha(ink, a)}`,
  drawer: (ink: string, a: number) => `0 0 48px -12px ${alpha(ink, a)}`,
  popover: (ink: string, a: number) => `0 12px 32px -8px ${alpha(ink, a)}`,
} as const;

// Chanfrein du coin inférieur droit des boutons pleins et à contour.
const CHAMFER = 6;
const CHAMFER_CLIP = `polygon(0 0, 100% 0, 100% calc(100% - ${CHAMFER}px), calc(100% - ${CHAMFER}px) 100%, 0 100%)`;

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: BRAND.cranberry, dark: "#a90f52", contrastText: "#fff" },
        secondary: { main: BRAND.royalBlue },
        info: { main: BRAND.azure },
        success: { main: BRAND.lawnGreen },
        warning: { main: BRAND.gold, contrastText: GRID.light.ink },
        error: { main: BRAND.cardinal },
        text: { primary: GRID.light.ink, secondary: GRID.light.muted },
        background: { default: GRID.light.sheet, paper: GRID.light.sheet },
        divider: GRID.light.rule,
        action: {
          hover: alpha(GRID.light.ink, 0.04),
          selected: alpha(BRAND.cranberry, 0.07),
        },
      },
    },
    dark: {
      palette: {
        // Cranberry éclairci pour rester lisible en texte ; les boutons pleins
        // gardent le cranberry officiel (voir MuiButton).
        primary: {
          main: "#f06a9f",
          light: "#f7a3c5",
          dark: BRAND.cranberry,
          contrastText: "#fff",
        },
        secondary: { main: BRAND.pastelBlue },
        info: { main: BRAND.skyBlue },
        success: { main: "#3fbf6f" },
        warning: { main: BRAND.gold, contrastText: GRID.light.ink },
        error: { main: "#ff6b5e" },
        text: { primary: GRID.dark.ink, secondary: GRID.dark.muted },
        background: { default: GRID.dark.sheet, paper: GRID.dark.sheet },
        divider: GRID.dark.rule,
        action: {
          hover: alpha("#ffffff", 0.04),
          selected: alpha("#f06a9f", 0.12),
        },
      },
    },
  },
  shape: { borderRadius: 2 },
  // Animations réduites : chaque composant prend sa variante statique.
  motion: { reducedMotion: "system" },
  typography: {
    fontFamily: SANS,
    fontSize: 14,
    // h1 : titre de page (un par page) ; h2 : titre de section, de panneau,
    // d'aperçu.
    h1: { fontSize: "1.375rem", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.01em" },
    h2: { fontSize: "0.9375rem", fontWeight: 700, lineHeight: 1.4 },
    h3: { fontSize: "0.875rem", fontWeight: 700, lineHeight: 1.4 },
    h4: { fontSize: "1.375rem", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.01em" },
    h5: { fontSize: "1.125rem", fontWeight: 700, lineHeight: 1.35, letterSpacing: "-0.005em" },
    h6: { fontSize: "0.9375rem", fontWeight: 700, lineHeight: 1.4 },
    subtitle1: { fontSize: "0.9375rem", lineHeight: 1.5 },
    subtitle2: { fontSize: "0.8125rem", fontWeight: 700, lineHeight: 1.5 },
    body1: { fontSize: "0.9375rem", lineHeight: 1.55 },
    body2: { fontSize: "0.8125rem", lineHeight: 1.5 },
    caption: { fontSize: "0.75rem", lineHeight: 1.5 },
    // Libellés de colonne et de zone : petites capitales espacées.
    overline: {
      fontSize: "0.6875rem",
      fontWeight: 600,
      lineHeight: 1.6,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
    button: { fontSize: "0.8125rem", fontWeight: 600, textTransform: "none", letterSpacing: "0.01em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Surfaces du navigateur aux couleurs de la charte, dans les deux
        // thèmes.
        ":root": {
          accentColor: BRAND.cranberry,
          caretColor: BRAND.cranberry,
          scrollbarColor: `${alpha(BRAND.slate, 0.45)} transparent`,
          scrollbarWidth: "thin",
          "--grid-chrome": GRID.light.chrome,
          "--grid-rule-strong": GRID.light.ruleStrong,
          "--grid-field": GRID.light.field,
        },
        "::selection": { backgroundColor: alpha(BRAND.cranberry, 0.2) },
        ":root.dark": {
          caretColor: "#f06a9f",
          scrollbarColor: `${alpha(BRAND.mouseGray, 0.3)} transparent`,
          "--grid-chrome": GRID.dark.chrome,
          "--grid-rule-strong": GRID.dark.ruleStrong,
          "--grid-field": GRID.dark.field,
        },
        ":root.dark ::selection": { backgroundColor: alpha("#f06a9f", 0.32) },
        body: { fontFeatureSettings: '"ss01"' },
        a: { textUnderlineOffset: "0.2em" },
        // Les indicateurs de chargement ont leur variante réduite ; seules
        // les transitions sont coupées ici.
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": { transitionDuration: "0.01ms !important" },
        },
      },
    },
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: ({ theme }) => ({
          "&.Mui-focusVisible": {
            outline: `2px solid ${theme.vars.palette.primary.main}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 32,
          paddingBlock: 4,
          paddingInline: 14,
          borderRadius: 2,
          transition: `background-color 120ms, color 120ms, transform 100ms ${EASE_OUT}`,
          "&:active:not(.Mui-disabled)": { transform: "translateY(1px)" },
          "& .MuiButton-startIcon": { marginRight: 6 },
          "& .MuiButton-endIcon": { marginLeft: 6 },
          [theme.breakpoints.down("md")]: { minHeight: 40 },
          variants: [
            {
              // Coin chanfreiné. Le chanfrein rogne le contour de focus, qui
              // passe donc à l'intérieur du bouton.
              props: ({ variant }) => variant === "contained" || variant === "outlined",
              style: {
                clipPath: CHAMFER_CLIP,
                "&.Mui-focusVisible": { outlineOffset: -4 },
              },
            },
            {
              props: { variant: "contained" },
              style: { "&.Mui-focusVisible": { outline: "2px solid currentColor" } },
            },
            {
              props: { variant: "outlined" },
              style: {
                borderColor: "currentColor",
                paddingInline: 13,
                // Le filet suit le chanfrein.
                "&::after": {
                  content: '""',
                  position: "absolute",
                  right: -1,
                  bottom: -1,
                  width: CHAMFER,
                  height: CHAMFER,
                  background: `linear-gradient(to top left, transparent calc(50% - 0.6px), currentColor calc(50% - 0.6px), currentColor calc(50% + 0.6px), transparent calc(50% + 0.6px))`,
                },
                "&.Mui-disabled::after": { opacity: 0.4 },
              },
            },
            {
              props: { variant: "contained", color: "primary" },
              style: theme.applyStyles("dark", {
                backgroundColor: BRAND.cranberry,
                "&:hover": { backgroundColor: "#b80f58" },
              }),
            },
            {
              props: { size: "small" },
              style: { minHeight: 28, paddingInline: 10, fontSize: "0.75rem" },
            },
            {
              props: { size: "large" },
              style: { minHeight: 40, paddingInline: 18, fontSize: "0.875rem" },
            },
          ],
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 2,
          transition: `background-color 150ms, transform 100ms ${EASE_OUT}`,
          "&:active:not(.Mui-disabled)": { transform: "scale(0.94)" },
          // Cible tactile de 40 px sur téléphone.
          [theme.breakpoints.down("md")]: { minWidth: 40, minHeight: 40 },
        }),
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        rounded: { borderRadius: 2 },
        // Pas de voile clair en sombre : la surface se distingue par sa teinte.
        root: ({ theme }) => theme.applyStyles("dark", { backgroundImage: "none" }),
      },
    },
    MuiAvatar: {
      defaultProps: { variant: "rounded" },
      styleOverrides: { rounded: { borderRadius: 2 } },
    },
    MuiTextField: {
      defaultProps: { size: "small", fullWidth: true },
    },
    MuiFormControl: {
      defaultProps: { size: "small" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 2,
          backgroundColor: theme.vars.palette.background.paper,
          "&:hover:not(.Mui-focused):not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline":
            { borderColor: "var(--grid-field)" },
        }),
        notchedOutline: { borderColor: "var(--grid-field)" },
        input: {
          // Les champs numériques et de date gardent des chiffres alignés.
          "&[type=number], &[type=date], &[type=datetime-local], &[inputmode=numeric]": {
            fontFamily: MONO,
            fontVariantNumeric: "tabular-nums",
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        // 16 px sur téléphone : iOS ne zoome pas au focus.
        input: ({ theme }) => ({
          [theme.breakpoints.down("md")]: { fontSize: "1rem" },
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { fontSize: "0.875rem" } },
    },
    MuiFormHelperText: {
      styleOverrides: { root: { marginInline: 2, fontSize: "0.75rem" } },
    },
    MuiFormControlLabel: {
      styleOverrides: { label: { fontSize: "0.875rem" } },
    },
    MuiSwitch: {
      styleOverrides: {
        track: { borderRadius: 2 },
        thumb: { borderRadius: 2, boxShadow: "none" },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        // Jusqu'à la tablette, la table défile en largeur ; dès lg, le
        // conteneur ne défile plus : l'en-tête figé colle sous la barre du haut.
        root: ({ theme }) => ({
          overflowX: "auto",
          [theme.breakpoints.up("lg")]: { overflowX: "clip" },
        }),
      },
    },
    MuiTable: {
      defaultProps: { size: "small" },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `1px solid ${theme.vars.palette.divider}`,
          paddingBlock: 7,
          paddingInline: 12,
          fontSize: "0.8125rem",
          // Filets verticaux de la grille.
          "&:not(:first-of-type)": { borderLeft: `1px solid ${theme.vars.palette.divider}` },
        }),
        head: ({ theme }) => ({
          backgroundColor: "var(--grid-chrome)",
          color: theme.vars.palette.text.secondary,
          fontSize: "0.6875rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          lineHeight: 1.4,
          paddingBlock: 8,
          whiteSpace: "nowrap",
          borderBottomColor: "var(--grid-rule-strong)",
        }),
        stickyHeader: ({ theme }) => ({
          backgroundColor: "var(--grid-chrome)",
          [theme.breakpoints.up("lg")]: { top: TOPBAR_HEIGHT },
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.MuiTableRow-hover:hover": { backgroundColor: theme.vars.palette.action.hover },
          "&.Mui-selected, &.Mui-selected:hover": {
            backgroundColor: theme.vars.palette.action.selected,
          },
          "&:last-child > .MuiTableCell-body": { borderBottom: 0 },
        }),
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: { "&:hover": { color: "inherit" } },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: { borderTop: "1px solid var(--grid-rule-strong)" },
        toolbar: { minHeight: 44, paddingInline: 12 },
        displayedRows: { fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontSize: "0.75rem" },
        selectLabel: { fontSize: "0.75rem" },
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { height: 2 } },
    },
    MuiSkeleton: {
      defaultProps: { animation: "wave" },
      styleOverrides: {
        rounded: { borderRadius: 2 },
        wave: { "@media (prefers-reduced-motion: reduce)": { "&::after": { animation: "none" } } },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 2,
          fontSize: "0.8125rem",
          paddingBlock: 2,
          paddingInline: 12,
          border: "1px solid",
          variants: (["error", "warning", "info", "success"] as const).map((severity) => {
            const light = theme.colorSchemes.light!.palette[severity].main;
            const dark = theme.colorSchemes.dark!.palette[severity].main;
            return {
              props: { severity, variant: "standard" },
              style: {
                borderColor: alpha(light, 0.4),
                backgroundColor: alpha(light, 0.06),
                color: theme.vars.palette.text.primary,
                "& .MuiAlert-icon": { color: theme.vars.palette[severity].main },
                ...theme.applyStyles("dark", {
                  borderColor: alpha(dark, 0.45),
                  backgroundColor: alpha(dark, 0.08),
                }),
              },
            };
          }),
        }),
        icon: { marginRight: 10, paddingBlock: 8, fontSize: 18 },
        message: { paddingBlock: 8 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 2,
          fontSize: "0.75rem",
          fontWeight: 500,
          backgroundColor: GRID.light.ink,
          paddingBlock: 4,
          paddingInline: 8,
          ":root.dark &": { backgroundColor: GRID.dark.ruleStrong, color: GRID.dark.ink },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 2,
          border: `1px solid ${theme.vars.palette.divider}`,
          boxShadow: FLOAT_SHADOW.dialog(GRID.light.ink, 0.35),
          ...theme.applyStyles("dark", { boxShadow: FLOAT_SHADOW.dialog("#000000", 0.7) }),
        }),
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: "1rem",
          fontWeight: 700,
          paddingBlock: 14,
          paddingInline: 20,
          borderBottom: `1px solid ${theme.vars.palette.divider}`,
          "& + .MuiDialogContent-root": { paddingTop: "20px !important" },
        }),
      },
    },
    MuiDialogContent: {
      styleOverrides: { root: { paddingInline: 20 } },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingBlock: 10,
          paddingInline: 20,
          gap: 4,
          backgroundColor: "var(--grid-chrome)",
          borderTop: `1px solid ${theme.vars.palette.divider}`,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 0,
          borderColor: theme.vars.palette.divider,
          boxShadow: FLOAT_SHADOW.drawer(GRID.light.ink, 0.3),
          ...theme.applyStyles("dark", { boxShadow: FLOAT_SHADOW.drawer("#000000", 0.6) }),
        }),
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 2,
          border: `1px solid ${theme.vars.palette.divider}`,
          boxShadow: FLOAT_SHADOW.popover(GRID.light.ink, 0.25),
          ...theme.applyStyles("dark", { boxShadow: FLOAT_SHADOW.popover("#000000", 0.6) }),
        }),
      },
    },
    MuiMenu: {
      styleOverrides: { list: { paddingBlock: 4 } },
    },
    MuiMenuItem: {
      styleOverrides: { root: { fontSize: "0.8125rem", minHeight: 34 } },
    },
    MuiListItemButton: {
      styleOverrides: { root: { borderRadius: 2 } },
    },
    MuiSnackbar: {
      styleOverrides: {
        // Au-dessus de la barre d'onglets du bas sur téléphone.
        root: ({ theme }) => ({
          [theme.breakpoints.down("md")]: {
            "&.MuiSnackbar-anchorOriginBottomCenter": {
              bottom: "calc(72px + env(safe-area-inset-bottom))",
            },
          },
        }),
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          fontSize: "0.8125rem",
          backgroundColor: GRID.light.ink,
          ":root.dark &": { backgroundColor: GRID.dark.ruleStrong, color: GRID.dark.ink },
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: { root: { borderRadius: 0 } },
    },
  },
});

// Nombres seuls : mono tabulaire (dates courtes, années, rangs, compteurs).
export const tabularNums = {
  fontFamily: MONO,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "-0.01em",
} as const;

// Texte mêlant mots et chiffres : police de l'interface, chiffres alignés.
export const tabularText = { fontVariantNumeric: "tabular-nums" } as const;
