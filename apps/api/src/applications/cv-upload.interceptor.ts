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
import { CV_MAX_BYTES } from './cv-file';

export const CV_FIELD = 'cv';
export const SINGLE_FILE_MESSAGE =
  'Un seul fichier est attendu, dans le champ « cv ».';

// Fichier reçu, tenu en mémoire le temps de la demande.
export type UploadedCv = { originalname: string; size: number; buffer: Buffer };

const OPTIONS = {
  limits: { files: 1, fileSize: CV_MAX_BYTES, fields: 20, fieldSize: 2048 },
  // Les noms de fichier sont lus en UTF-8, accents compris.
  defParamCharset: 'utf8',
};

// Reçoit le fichier du champ « cv ». Les erreurs de réception portent un
// message anglais : elles sont relancées au format du socle.
@Injectable()
export class CvUploadInterceptor implements NestInterceptor {
  private readonly fileInterceptor: NestInterceptor = new (FileInterceptor(
    CV_FIELD,
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
            details: [{ field: CV_FIELD, message: SINGLE_FILE_MESSAGE }],
          });
        }
        throw new BadRequestException();
      }
      throw error;
    }
  }
}
