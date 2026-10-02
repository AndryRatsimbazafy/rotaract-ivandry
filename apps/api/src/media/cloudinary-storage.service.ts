import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { getAppConfig } from '../config/app-config';
import { EnvironmentVariables } from '../config/env.validation';
import {
  StorageDeletion,
  StorageError,
  StorageService,
} from './storage.service';

const FOLDER = 'candidatures/cv';
// Fichier brut, conservé à l'identique, sans adresse publique.
const RESOURCE = { resource_type: 'raw', type: 'authenticated' } as const;
const TIMEOUT_MS = 10_000;
const SIGNED_URL_SECONDS = 60;

type Operation = 'envoi' | 'lecture' | 'suppression';

// Seule partie du code qui connaît le fournisseur.
@Injectable()
export class CloudinaryStorageService extends StorageService {
  private readonly logger = new Logger('Storage');

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    super();
    const { cloudName, apiKey, apiSecret } = getAppConfig(config).cloudinary;
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async upload(content: Buffer): Promise<string> {
    // Identifiant aléatoire : aucune donnée de la personne.
    const publicId = `${FOLDER}/${randomUUID()}`;
    try {
      await new Promise<void>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              ...RESOURCE,
              public_id: publicId,
              overwrite: false,
              timeout: TIMEOUT_MS,
            },
            (error, result) => {
              if (error || !result) {
                reject(error ?? new Error());
              } else {
                resolve();
              }
            },
          )
          .end(content);
      });
    } catch (error) {
      throw this.failure('envoi', error);
    }
    return publicId;
  }

  async read(id: string): Promise<Buffer | null> {
    let response: Response;
    try {
      // Adresse signée de courte durée, consommée ici : elle ne quitte jamais
      // le serveur et n'est pas journalisée.
      const url = cloudinary.utils.private_download_url(id, '', {
        ...RESOURCE,
        expires_at: Math.floor(Date.now() / 1000) + SIGNED_URL_SECONDS,
      });
      response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (response.ok) {
        return Buffer.from(await response.arrayBuffer());
      }
    } catch (error) {
      throw this.failure('lecture', error);
    }
    if (response.status === 404) {
      return null;
    }
    throw this.failure('lecture', { http_code: response.status });
  }

  async delete(id: string): Promise<StorageDeletion> {
    let outcome: unknown;
    try {
      const result = (await cloudinary.uploader.destroy(id, {
        ...RESOURCE,
        invalidate: true,
      })) as { result?: unknown };
      outcome = result.result;
    } catch (error) {
      throw this.failure('suppression', error);
    }
    if (outcome === 'ok') {
      return 'deleted';
    }
    if (outcome === 'not found') {
      return 'absent';
    }
    throw this.failure('suppression', new Error());
  }

  // Le message d'une erreur du fournisseur peut contenir une adresse signée ou
  // la clé d'API : seuls l'opération, le type de l'erreur et son code HTTP sont
  // journalisés.
  private failure(operation: Operation, error: unknown): StorageError {
    const type = error instanceof Error ? error.constructor.name : typeof error;
    const code = (error as { http_code?: unknown } | null)?.http_code;
    this.logger.error(
      `Erreur du stockage (${operation}, ${type}${
        typeof code === 'number' ? `, HTTP ${code}` : ''
      }).`,
    );
    return new StorageError();
  }
}
