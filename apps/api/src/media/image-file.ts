// 5 Mo.
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const IMAGE_TYPE_MESSAGE =
  "Format d'image non accepté : JPEG, PNG ou WebP.";

export type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const RIFF = Buffer.from('RIFF');
const WEBP = Buffer.from('WEBP');

function startsWith(content: Buffer, signature: Buffer, at = 0): boolean {
  return content.subarray(at, at + signature.length).equals(signature);
}

// Type constaté sur le contenu, jamais celui qu'annonce le client. null : ni
// JPEG, ni PNG, ni WebP.
export function detectImageType(content: Buffer): ImageMimeType | null {
  if (startsWith(content, JPEG_SIGNATURE)) {
    return 'image/jpeg';
  }
  if (startsWith(content, PNG_SIGNATURE)) {
    return 'image/png';
  }
  if (startsWith(content, RIFF) && startsWith(content, WEBP, 8)) {
    return 'image/webp';
  }
  return null;
}
