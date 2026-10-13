// Le stockage n'a pas pu répondre. Ne porte aucun détail du fournisseur.
export class StorageError extends Error {
  constructor() {
    super('Stockage indisponible.');
  }
}

export type StorageDeletion = 'deleted' | 'absent';

// Dossier d'une image au stockage, selon le contenu qui la porte ; pages :
// photographies fixes du site.
export type ImageFolder = 'membres' | 'actions' | 'actualites' | 'pages';

// Image déposée : identifiant interne, adresse publique et ce que le stockage
// a constaté (dimensions après orientation, poids, format).
export type StoredImage = {
  id: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
};

// Seule vue du stockage qu'ont les modules métier : aucun fournisseur n'y est
// nommé.
export abstract class StorageService {
  // Envoie un fichier et renvoie son identifiant au stockage.
  abstract upload(content: Buffer): Promise<string>;

  // Contenu du fichier, ou null s'il n'existe plus.
  abstract read(id: string): Promise<Buffer | null>;

  // Un fichier déjà absent n'est pas une erreur.
  abstract delete(id: string): Promise<StorageDeletion>;

  // Images : publiques, servies au navigateur par leur adresse.
  abstract uploadImage(
    content: Buffer,
    folder: ImageFolder,
  ): Promise<StoredImage>;

  // Un fichier déjà absent n'est pas une erreur.
  abstract deleteImage(id: string): Promise<StorageDeletion>;
}
