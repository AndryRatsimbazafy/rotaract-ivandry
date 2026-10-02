"use client";

import { createTheme } from "@mui/material/styles";

// Thème unique du Back Office : fonctionnel, dense, clair. Il ne reprend pas
// le système éditorial du Front Office (DESIGN.md ne régit pas cette
// application) ; seules les couleurs du club sont recopiées ici.
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#17458f" },
    secondary: { main: "#d41367" },
    error: { main: "#b3261e" },
    success: { main: "#0b6b34" },
    warning: { main: "#7a4a00" },
    text: { primary: "#0f1c36", secondary: "#54565a" },
    background: { default: "#f3f6f9", paper: "#ffffff" },
    divider: "#d0cfcd",
  },
  typography: {
    fontFamily: "var(--font-open-sans), Arial, sans-serif",
    fontSize: 14,
    h1: { fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.3 },
    h2: { fontSize: "1.125rem", fontWeight: 700, lineHeight: 1.4 },
    h3: { fontSize: "1rem", fontWeight: 700, lineHeight: 1.4 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { elevation: 0, variant: "outlined" } },
    MuiTable: { defaultProps: { size: "small" } },
    MuiTextField: { defaultProps: { size: "small", fullWidth: true } },
    MuiFormControl: { defaultProps: { size: "small" } },
    MuiTableCell: {
      styleOverrides: { head: { fontWeight: 700, whiteSpace: "nowrap" } },
    },
  },
});

export default theme;
