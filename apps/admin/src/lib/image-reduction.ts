// Préparation d'une image dans le navigateur, avant l'envoi
// (specs/011-image-storage, research R6) : contrôle du type et du poids, puis
// réduction à 3000 px au plus sur le côté le plus long et réencodage. Une
// image de 5 Mo passe ainsi sous les limites du serveur et de l'hébergement.
// L'API reste l'autorité : elle refait ses propres contrôles.

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_SIDE = 3000;
const QUALITY = 0.85;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

// Les mêmes textes que l'API.
export const IMAGE_TYPE_MESSAGE =
  "Format d'image non accepté : JPEG, PNG ou WebP.";
export const IMAGE_SIZE_MESSAGE = "L'image dépasse 5 Mo.";

export type PreparedImage = {
  blob: Blob;
  name: string;
  // Dimensions de l'image envoyée ; 0 si elles n'ont pas pu être lues.
  width: number;
  height: number;
};

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function renamed(name: string, type: string): string {
  const stem = name.replace(/\.[^.]*$/, "") || "image";
  return `${stem}${EXTENSIONS[type] ?? ""}`;
}

function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

// Refuse un fichier hors limites (Error dont le message s'affiche), sinon
// renvoie l'image à envoyer : réduite si possible, l'original sinon.
export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!TYPES.includes(file.type)) {
    throw new Error(IMAGE_TYPE_MESSAGE);
  }
  if (file.size > MAX_BYTES) {
    throw new Error(IMAGE_SIZE_MESSAGE);
  }

  let bitmap: ImageBitmap;
  try {
    // Orientation EXIF appliquée : une photo de téléphone reste à l'endroit.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Image illisible ici : l'original part, l'API tranchera.
    return { blob: file, name: file.name, width: 0, height: 0 };
  }

  const original = { blob: file, name: file.name, width: bitmap.width, height: bitmap.height };
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      return original;
    }
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    let blob = await encode(canvas, "image/webp");
    // Sans encodeur WebP, le navigateur renvoie un autre format.
    if (!blob || blob.type !== "image/webp") {
      blob = await encode(canvas, "image/jpeg");
    }
    // Rien de gagné : l'original, avec ses métadonnées, reste préférable à
    // un fichier plus lourd.
    if (!blob || !TYPES.includes(blob.type) || blob.size >= file.size) {
      return original;
    }
    return { blob, name: renamed(file.name, blob.type), width, height };
  } catch {
    return original;
  } finally {
    bitmap.close();
  }
}
