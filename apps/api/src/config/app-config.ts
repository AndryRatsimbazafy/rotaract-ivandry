import { ConfigService } from '@nestjs/config';
import {
  durationToSeconds,
  EnvironmentVariables,
  parseOrigins,
} from './env.validation';

export type AppConfig = {
  port: number;
  nodeEnv: 'development' | 'production';
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtExpiresInSeconds: number;
  corsOrigins: string[];
};

export function getAppConfig(
  config: ConfigService<EnvironmentVariables, true>,
): AppConfig {
  return {
    port: config.get('PORT', { infer: true }),
    nodeEnv: config.get('NODE_ENV', { infer: true }),
    mongodbUri: config.get('MONGODB_URI', { infer: true }),
    jwtSecret: config.get('JWT_SECRET', { infer: true }),
    jwtExpiresIn: config.get('JWT_EXPIRES_IN', { infer: true }),
    jwtExpiresInSeconds: durationToSeconds(
      config.get('JWT_EXPIRES_IN', { infer: true }),
    ),
    corsOrigins: parseOrigins(config.get('CORS_ORIGINS', { infer: true })),
  };
}
