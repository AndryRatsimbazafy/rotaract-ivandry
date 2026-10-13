import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tabularText } from "@/theme/theme";

export type Field = {
  label: string;
  value: React.ReactNode;
  // Valeur chiffrée mêlée de mots (date, taille) : chiffres alignés.
  numeric?: boolean;
};

const empty = (value: React.ReactNode) =>
  value === undefined || value === null || value === "";

// Liste libellé / valeur en lignes réglées, comme deux colonnes de tableur.
// Une valeur absente s'affiche « — ».
export default function FieldList({
  fields,
  labelWidth = 136,
}: {
  fields: Field[];
  labelWidth?: number;
}) {
  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: `${labelWidth}px minmax(0, 1fr)` },
      }}
    >
      {fields.map(({ label, value, numeric }) => (
        <Box key={label} sx={{ display: "contents" }}>
          <Typography
            component="dt"
            variant="body2"
            color="text.secondary"
            sx={{
              pt: 1,
              pb: { xs: 0, sm: 1 },
              borderBottom: { sm: 1 },
              borderColor: { sm: "divider" },
            }}
          >
            {label}
          </Typography>
          <Typography
            component="dd"
            variant="body2"
            sx={{
              m: 0,
              pt: { xs: 0.25, sm: 1 },
              pb: 1,
              borderBottom: 1,
              borderColor: "divider",
              overflowWrap: "anywhere",
              fontWeight: 500,
              ...(numeric && tabularText),
              ...(empty(value) && { color: "text.secondary", fontWeight: 400 }),
            }}
          >
            {empty(value) ? "—" : value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
