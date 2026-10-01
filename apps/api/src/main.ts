import { ConsoleLogger, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { Request, Response } from 'express';
import helmet from 'helmet';
import { Error as MongooseError } from 'mongoose';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { createValidationPipe } from './common/pipes/validation.pipe';
import { getAppConfig } from './config/app-config';
import { ConfigValidationError } from './config/env.validation';

const logger = new Logger('Bootstrap');

// NestJS et son module Mongoose journalisent eux-mêmes l'erreur d'origine d'un
// démarrage raté, avec sa trace et le nom d'hôte de la base. Ce journal retire
// ce détail ; le message utile est écrit par bootstrap().
class StartupLogger extends ConsoleLogger {
  error(message: unknown, ...optionalParams: unknown[]): void {
    const context = optionalParams.at(-1);
    if (context === 'ExceptionHandler') {
      return;
    }
    if (context === 'MongooseModule') {
      super.error(message, context);
      return;
    }
    super.error(message, ...optionalParams);
  }
}

// Le message de validation nomme les variables sans afficher de valeur ; toute
// autre erreur d'origine reste hors du journal.
function startupFailureMessage(error: unknown): string {
  if (error instanceof ConfigValidationError) {
    return error.message;
  }
  if (error instanceof MongooseError || isDriverError(error)) {
    return 'Connexion à la base de données impossible.';
  }
  return "Le démarrage de l'API a échoué.";
}

function isDriverError(error: unknown): boolean {
  return error instanceof Error && error.name.startsWith('Mongo');
}

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      abortOnError: false,
      logger: new StartupLogger(),
    });
    const config = getAppConfig(app.get(ConfigService));

    app.setGlobalPrefix('api/v1');
    app.use(helmet());
    const exceptionFilter = new AllExceptionsFilter();
    app.useGlobalFilters(exceptionFilter);
    app.useGlobalPipes(createValidationPipe());
    if (config.corsOrigins.length > 0) {
      app.enableCors({ origin: config.corsOrigins });
    }

    // Hors du préfixe, aucune route NestJS ne répond et Express renverrait une
    // page HTML : cette dernière étape garde le format d'erreur commun.
    await app.init();
    app.use((_request: Request, response: Response) => {
      exceptionFilter.respond(new NotFoundException(), response);
    });

    await app.listen(config.port);
    logger.log(`API à l'écoute sur le port ${config.port}.`);
  } catch (error) {
    logger.error(startupFailureMessage(error));
    process.exit(1);
  }
}
void bootstrap();
