import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  PayloadTooLargeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Observable } from 'rxjs';
import { IMAGE_MAX_BYTES } from './image-file';

export const IMAGE_FIELD = 'image';
export const IMAGE_FIELD_MESSAGE =
  'Une image est attendue, dans le champ « image ».';

// Fichier reçu, tenu en mémoire le temps de la demande.
export type UploadedImage = {
  originalname: string;
  size: number;
  buffer: Buffer;
};

const OPTIONS = {
  limits: { files: 1, fileSize: IMAGE_MAX_BYTES, fields: 10, fieldSize: 2048 },
  // Les noms de fichier sont lus en UTF-8, accents compris.
  defParamCharset: 'utf8',
};

// Reçoit l'image du champ « image ». Les erreurs de réception portent un
// message anglais : elles sont relancées au format du socle.
@Injectable()
export class ImageUploadInterceptor implements NestInterceptor {
  private readonly fileInterceptor: NestInterceptor = new (FileInterceptor(
    IMAGE_FIELD,
    OPTIONS,
  ))();

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    try {
      return await this.fileInterceptor.intercept(context, next);
    } catch (error) {
      if (error instanceof PayloadTooLargeException) {
        throw new PayloadTooLargeException();
      }
      if (error instanceof BadRequestException) {
        // Fichier dans un autre champ, ou plusieurs fichiers.
        if (/^(Unexpected (file )?field|Too many files)/.test(error.message)) {
          throw new BadRequestException({
            message: 'Données invalides.',
            details: [{ field: IMAGE_FIELD, message: IMAGE_FIELD_MESSAGE }],
          });
        }
        throw new BadRequestException();
      }
      throw error;
    }
  }
}
