import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Model, QueryFilter, Types, UpdateQuery } from 'mongoose';
import { cleanFileName } from '../applications/cv-file';
import { ORDER_MESSAGE } from '../common/dto/image-fields.dto';
import type {
  ImageFieldsDto,
  UpdateImageFieldsDto,
} from '../common/dto/image-fields.dto';
import { DEFAULT_FOCUS, MediaRef } from '../common/schemas/media-ref.schema';
import { detectImageType, IMAGE_TYPE_MESSAGE } from './image-file';
import {
  IMAGE_FIELD,
  IMAGE_FIELD_MESSAGE,
  UploadedImage,
} from './image-upload.interceptor';
import { ImageFolder, StorageError, StorageService } from './storage.service';

// Images rattachées à un contenu : ce qui est commun aux portraits et aux
// photographies, sans fournisseur. Ordre de toute écriture : dépôt, écriture,
// puis retrait du fichier déposé si l'écriture échoue.

export const PHOTOS_MAX = 20;
export const PHOTOS_FULL_MESSAGE = 'Ce contenu a déjà 20 photographies.';

function unavailable(error: unknown): never {
  if (error instanceof StorageError) {
    throw new ServiceUnavailableException();
  }
  throw error;
}

// Contrôle le fichier reçu, le dépose et renvoie l'image à écrire.
export async function storeImage(
  storage: StorageService,
  file: UploadedImage | undefined,
  folder: ImageFolder,
  fields: ImageFieldsDto,
): Promise<MediaRef> {
  if (!file || file.size === 0) {
    throw new BadRequestException({
      message: 'Données invalides.',
      details: [{ field: IMAGE_FIELD, message: IMAGE_FIELD_MESSAGE }],
    });
  }
  const mimeType = detectImageType(file.buffer);
  if (!mimeType) {
    throw new UnsupportedMediaTypeException(IMAGE_TYPE_MESSAGE);
  }
  const stored = await storage
    .uploadImage(file.buffer, folder)
    .catch((error: unknown) => unavailable(error));
  return {
    _id: new Types.ObjectId(),
    url: stored.url,
    publicId: stored.id,
    name: cleanFileName(file.originalname) || 'image',
    mimeType,
    size: file.size,
    width: stored.width,
    height: stored.height,
    alt: fields.alt,
    ...(fields.caption ? { caption: fields.caption } : {}),
    ...(fields.credit ? { credit: fields.credit } : {}),
    ...(fields.altEn ? { altEn: fields.altEn } : {}),
    ...(fields.captionEn ? { captionEn: fields.captionEn } : {}),
    focus: fields.focus ?? DEFAULT_FOCUS,
  };
}

// Retire un fichier sans faire échouer l'opération : un échec laisse un
// orphelin, journalisé.
export async function discardImage(
  storage: StorageService,
  publicId: string,
  logger: Logger,
): Promise<void> {
  await storage.deleteImage(publicId).catch(() => {
    logger.error(`Fichier orphelin au stockage : ${publicId}.`);
  });
}

// Retire un fichier avant de modifier le contenu : stockage indisponible,
// 503 et rien n'est modifié. Un fichier déjà absent n'empêche rien.
export async function removeImageFile(
  storage: StorageService,
  publicId: string,
  logger: Logger,
): Promise<void> {
  const deletion = await storage
    .deleteImage(publicId)
    .catch((error: unknown) => unavailable(error));
  if (deletion === 'absent') {
    logger.warn(`Fichier déjà absent du stockage : ${publicId}.`);
  }
}

// La liste demandée contient exactement toutes les photographies, chacune
// une fois.
export function assertCompleteOrder(
  current: string[],
  requested: string[],
): void {
  const complete =
    requested.length === current.length &&
    new Set(requested).size === requested.length &&
    requested.every((id) => current.includes(id));
  if (!complete) {
    throw new BadRequestException({
      message: 'Données invalides.',
      details: [{ field: 'photoIds', message: ORDER_MESSAGE }],
    });
  }
}

// Champs d'une image à modifier : $set et $unset pour un chemin donné
// (« portrait » ou « photos.$ »).
export function imageFieldsUpdate(
  path: string,
  fields: {
    alt?: string;
    caption?: string | null;
    credit?: string | null;
    focus?: string;
    altEn?: string | null;
    captionEn?: string | null;
  },
): { $set?: Record<string, string>; $unset?: Record<string, ''> } {
  const set: Record<string, string> = {};
  const unset: Record<string, ''> = {};
  if (fields.alt !== undefined) {
    set[`${path}.alt`] = fields.alt;
  }
  if (fields.focus !== undefined) {
    set[`${path}.focus`] = fields.focus;
  }
  for (const key of ['caption', 'credit', 'altEn', 'captionEn'] as const) {
    const value = fields[key];
    if (value === null) {
      unset[`${path}.${key}`] = '';
    } else if (value !== undefined) {
      set[`${path}.${key}`] = value;
    }
  }
  return {
    ...(Object.keys(set).length > 0 ? { $set: set } : {}),
    ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
  };
}

// --- Photographies d'un contenu (actions, actualités) ---

type WithPhotos = { photos: MediaRef[] };

// Ajoute une photographie en dernier. Le contenu et la limite de 20 sont
// vérifiés avant tout dépôt, puis de nouveau à l'écriture.
export async function addPhoto<T extends WithPhotos>(
  model: Model<T>,
  storage: StorageService,
  logger: Logger,
  id: string,
  file: UploadedImage | undefined,
  fields: ImageFieldsDto,
  folder: ImageFolder,
): Promise<void> {
  const existing = await model.findById(id).select('photos').lean().exec();
  if (!existing) {
    throw new NotFoundException();
  }
  if ((existing as WithPhotos).photos.length >= PHOTOS_MAX) {
    throw new ConflictException(PHOTOS_FULL_MESSAGE);
  }
  const image = await storeImage(storage, file, folder, fields);
  let written: { matchedCount: number };
  try {
    written = await model
      .updateOne(
        {
          _id: id,
          [`photos.${PHOTOS_MAX - 1}`]: { $exists: false },
        } as QueryFilter<T>,
        { $push: { photos: image } } as UpdateQuery<T>,
      )
      .exec();
  } catch (error) {
    await discardImage(storage, image.publicId, logger);
    throw error;
  }
  if (written.matchedCount === 0) {
    await discardImage(storage, image.publicId, logger);
    if (!(await model.exists({ _id: id } as QueryFilter<T>).exec())) {
      throw new NotFoundException();
    }
    throw new ConflictException(PHOTOS_FULL_MESSAGE);
  }
}

export async function updatePhoto<T extends WithPhotos>(
  model: Model<T>,
  id: string,
  photoId: string,
  fields: UpdateImageFieldsDto,
): Promise<void> {
  const filter = { _id: id, 'photos._id': photoId } as QueryFilter<T>;
  const update = imageFieldsUpdate('photos.$', fields);
  const found =
    Object.keys(update).length > 0
      ? (await model.updateOne(filter, update as UpdateQuery<T>).exec())
          .matchedCount > 0
      : (await model.exists(filter).exec()) !== null;
  if (!found) {
    throw new NotFoundException();
  }
}

// Le fichier d'abord : stockage indisponible, rien n'est modifié.
export async function removePhoto<T extends WithPhotos>(
  model: Model<T>,
  storage: StorageService,
  logger: Logger,
  id: string,
  photoId: string,
): Promise<void> {
  const existing = await model.findById(id).select('photos').lean().exec();
  const photo = (existing as WithPhotos | null)?.photos.find(
    (candidate) => candidate._id.toString() === photoId,
  );
  if (!photo) {
    throw new NotFoundException();
  }
  await removeImageFile(storage, photo.publicId, logger);
  await model
    .updateOne(
      { _id: id } as QueryFilter<T>,
      { $pull: { photos: { _id: photo._id } } } as UpdateQuery<T>,
    )
    .exec();
}

export async function reorderPhotos<T extends WithPhotos>(
  model: Model<T>,
  id: string,
  photoIds: string[],
): Promise<void> {
  const existing = await model.findById(id).select('photos').lean().exec();
  if (!existing) {
    throw new NotFoundException();
  }
  const photos = (existing as WithPhotos).photos;
  assertCompleteOrder(
    photos.map((photo) => photo._id.toString()),
    photoIds,
  );
  const byId = new Map(photos.map((photo) => [photo._id.toString(), photo]));
  await model
    .updateOne(
      { _id: id } as QueryFilter<T>,
      {
        $set: { photos: photoIds.map((photoId) => byId.get(photoId)) },
      } as UpdateQuery<T>,
    )
    .exec();
}

// Avant la suppression d'un contenu : tous ses fichiers, un par un. Le premier
// échec du stockage arrête tout (503) et le contenu est conservé.
export async function removeImageFiles(
  storage: StorageService,
  logger: Logger,
  images: MediaRef[],
): Promise<void> {
  for (const image of images) {
    await removeImageFile(storage, image.publicId, logger);
  }
}
