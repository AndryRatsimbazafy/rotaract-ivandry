import { basename, extname } from 'node:path';

// 5 Mo.
export const CV_MAX_BYTES = 5 * 1024 * 1024;
const NAME_MAX_LENGTH = 255;

const PDF_SIGNATURE = Buffer.from('%PDF-');
// Commune aux anciens documents Office.
const DOC_SIGNATURE = Buffer.from([
  0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
]);
const ZIP_SIGNATURE = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
// Entrée propre à un document Word ; les noms d'entrées d'une archive ZIP y
// figurent en clair.
const DOCX_ENTRY = 'word/document.xml';

const TYPES = [
  {
    extension: '.pdf',
    mimeType: 'application/pdf',
    matches: (content: Buffer) => startsWith(content, PDF_SIGNATURE),
  },
  {
    extension: '.doc',
    mimeType: 'application/msword',
    matches: (content: Buffer) => startsWith(content, DOC_SIGNATURE),
  },
  {
    extension: '.docx',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    matches: (content: Buffer) =>
      startsWith(content, ZIP_SIGNATURE) && content.includes(DOCX_ENTRY),
  },
];

function startsWith(content: Buffer, signature: Buffer): boolean {
  return content.subarray(0, signature.length).equals(signature);
}

// Type constaté sur le contenu, jamais celui qu'annonce le client. L'extension
// doit concorder. null : ni PDF, ni DOC, ni DOCX.
export function detectCvType(content: Buffer, name: string): string | null {
  const type = TYPES.find(({ matches }) => matches(content));
  return type && extname(name).toLowerCase() === type.extension
    ? type.mimeType
    : null;
}

// Nom d'origine réduit à son dernier segment, sans caractère de contrôle. Il
// sert à l'affichage et au téléchargement, jamais d'adresse.
export function cleanFileName(name: string): string {
  const last = basename(name.replace(/\\/g, '/'));
  // oxlint-disable-next-line no-control-regex
  const cleaned = last.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  const extension = extname(cleaned);
  const stem = extension ? cleaned.slice(0, -extension.length) : cleaned;
  return stem.slice(0, NAME_MAX_LENGTH - extension.length) + extension;
}
