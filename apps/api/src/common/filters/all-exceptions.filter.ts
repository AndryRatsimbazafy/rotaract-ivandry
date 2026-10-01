import { STATUS_CODES } from 'node:http';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'Requête mal formée.',
  401: 'Authentification requise.',
  403: 'Accès refusé.',
  404: 'Ressource introuvable.',
  405: 'Méthode non autorisée.',
  409: 'Conflit avec une ressource existante.',
  413: 'Contenu trop volumineux.',
  415: 'Type de contenu non pris en charge.',
  429: 'Trop de requêtes. Réessayez plus tard.',
  500: 'Une erreur interne est survenue.',
  503: 'Service indisponible.',
};

type ErrorBody = {
  statusCode: number;
  error: string;
  message: string;
  details?: unknown[];
};

function defaultMessage(status: number): string {
  return (
    DEFAULT_MESSAGES[status] ?? DEFAULT_MESSAGES[status >= 500 ? 500 : 400]
  );
}

// Messages produits par le framework lui-même (libellé standard du code,
// « Cannot GET /… », erreur d'analyse du corps ou de l'adresse) : ils sont en
// anglais et peuvent répéter l'adresse appelée, donc jamais renvoyés.
function isFrameworkMessage(status: number, message: string): boolean {
  return (
    message === STATUS_CODES[status] ||
    /^Cannot [A-Z]+ /.test(message) ||
    (status === 400 && /JSON|^Failed to decode param/.test(message))
  );
}

// Erreur des intergiciels d'Express (bibliothèque http-errors), par exemple un
// corps trop volumineux.
function clientErrorStatus(exception: unknown): number | undefined {
  if (typeof exception !== 'object' || exception === null) {
    return undefined;
  }
  const { expose, statusCode } = exception as {
    expose?: unknown;
    statusCode?: unknown;
  };
  return expose === true &&
    typeof statusCode === 'number' &&
    statusCode >= 400 &&
    statusCode < 500
    ? statusCode
    : undefined;
}

// Le message d'une erreur interne peut contenir un nom d'hôte, une adresse ou
// un identifiant de la base : seuls le type de l'erreur et les lignes d'appel
// de sa trace sont journalisés, jamais le message.
function errorType(exception: unknown): string {
  return exception instanceof Error
    ? exception.constructor.name
    : typeof exception;
}

function callFrames(exception: unknown): string | undefined {
  if (!(exception instanceof Error) || !exception.stack) {
    return undefined;
  }
  const frames = exception.stack
    .split('\n')
    .filter((line) => /^\s+at /.test(line));
  return frames.length > 0 ? frames.join('\n') : undefined;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    this.respond(exception, host.switchToHttp().getResponse<Response>());
  }

  respond(exception: unknown, response: Response): void {
    const body = this.toBody(exception);
    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ErrorBody {
    if (!(exception instanceof HttpException)) {
      const status = clientErrorStatus(exception);
      if (status !== undefined) {
        return this.body(status, defaultMessage(status));
      }
      this.logger.error(
        `Erreur interne non gérée (${errorType(exception)}).`,
        callFrames(exception),
      );
      return this.body(
        HttpStatus.INTERNAL_SERVER_ERROR,
        defaultMessage(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }

    const status = exception.getStatus();
    const payload = exception.getResponse();
    const provided =
      typeof payload === 'string'
        ? payload
        : (payload as { message?: unknown }).message;
    const message =
      typeof provided === 'string' && !isFrameworkMessage(status, provided)
        ? provided
        : defaultMessage(status);
    const details =
      typeof payload === 'object'
        ? (payload as { details?: unknown }).details
        : undefined;

    return this.body(status, message, details);
  }

  private body(status: number, message: string, details?: unknown): ErrorBody {
    return {
      statusCode: status,
      error: STATUS_CODES[status] ?? 'Error',
      message,
      ...(Array.isArray(details) ? { details } : {}),
    };
  }
}
