// Présentation du CV d'une candidature : type lisible et taille.

const CV_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "Word (DOC)",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word (DOCX)",
};

export function cvType(mimeType: string): string {
  return CV_TYPES[mimeType] ?? "Document";
}

export function fileSize(bytes: number): string {
  const format = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
  return bytes < 1024 * 1024
    ? `${format.format(Math.max(1, Math.round(bytes / 1024)))} Ko`
    : `${format.format(bytes / (1024 * 1024))} Mo`;
}
