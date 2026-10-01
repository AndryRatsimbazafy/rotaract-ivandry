import { join } from 'node:path';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getAppConfig } from './config/app-config';
import { EnvironmentVariables, validate } from './config/env.validation';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // apps/api/.env, quel que soit le dossier de lancement.
      envFilePath: join(__dirname, '..', '.env'),
      validate,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        uri: getAppConfig(config).mongodbUri,
        retryAttempts: 3,
        retryDelay: 2000,
        serverSelectionTimeoutMS: 5000,
        verboseRetryLog: false,
        onConnectionCreate: (connection) => {
          connection.on('connected', () => {
            new Logger('Database').log(
              'Connexion à la base de données établie.',
            );
          });
        },
      }),
    }),
    HealthModule,
  ],
})
export class AppModule {}
