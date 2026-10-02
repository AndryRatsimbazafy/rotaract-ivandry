import { join } from 'node:path';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { ActionsModule } from './actions/actions.module';
import { AuthModule } from './auth/auth.module';
import { getAppConfig } from './config/app-config';
import { EnvironmentVariables, validate } from './config/env.validation';
import { HealthModule } from './health/health.module';
import { MembersModule } from './members/members.module';
import { RotaryYearsModule } from './rotary-years/rotary-years.module';

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
    // Aucune garde de limitation globale : elle n'est posée que sur la
    // connexion (auth.controller.ts). Compteur en mémoire.
    ThrottlerModule.forRoot({
      throttlers: [{ limit: 5, ttl: 60_000 }],
      errorMessage: 'Trop de requêtes. Réessayez plus tard.',
    }),
    HealthModule,
    AuthModule,
    RotaryYearsModule,
    MembersModule,
    ActionsModule,
  ],
})
export class AppModule {}
