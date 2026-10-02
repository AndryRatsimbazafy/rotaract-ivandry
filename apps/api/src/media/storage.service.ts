// Le stockage n'a pas pu répondre. Ne porte aucun détail du fournisseur.
export class StorageError extends Error {
  constructor() {
    super('Stockage indisponible.');
  }
}

export type StorageDeletion = 'deleted' | 'absent';

// Seule vue du stockage qu'ont les modules métier : aucun fournisseur n'y est
// nommé.
export abstract class StorageService {
  // Envoie un fichier et renvoie son identifiant au stockage.
  abstract upload(content: Buffer): Promise<string>;

  // Contenu du fichier, ou null s'il n'existe plus.
  abstract read(id: string): Promise<Buffer | null>;

  // Un fichier déjà absent n'est pas une erreur.
  abstract delete(id: string): Promise<StorageDeletion>;
}
