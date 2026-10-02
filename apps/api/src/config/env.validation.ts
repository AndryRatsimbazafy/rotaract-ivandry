import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  validateSync,
} from 'class-validator';

function isOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.origin === value
    );
  } catch {
    return false;
  }
}

export function parseOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin !== '');
}

const SECONDS_PER_UNIT = { s: 1, m: 60, h: 3600, d: 86400 } as const;

export const MAX_TOKEN_DURATION_SECONDS = 8 * 3600;

// « 8h », « 480m »… en secondes ; NaN si la valeur n'a pas ce format.
export function durationToSeconds(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) {
    return Number.NaN;
  }
  return (
    Number(match[1]) *
    SECONDS_PER_UNIT[match[2] as keyof typeof SECONDS_PER_UNIT]
  );
}

@ValidatorConstraint({ name: 'isTokenDuration' })
class IsTokenDuration implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const seconds = durationToSeconds(value);
    return seconds > 0 && seconds <= MAX_TOKEN_DURATION_SECONDS;
  }
}

@ValidatorConstraint({ name: 'isOriginList' })
class IsOriginList implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && parseOrigins(value).every(isOrigin);
  }
}

export class EnvironmentVariables {
  @IsString()
  @Matches(/^mongodb(\+srv)?:\/\//)
  MONGODB_URI: string;

  @IsString()
  @MinLength(32)
  JWT_SECRET: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 4000;

  @IsIn(['development', 'production'])
  NODE_ENV: 'development' | 'production' = 'development';

  @Validate(IsTokenDuration)
  JWT_EXPIRES_IN: string = '8h';

  @Validate(IsOriginList)
  CORS_ORIGINS: string = '';

  // Stockage des CV des candidatures.
  @IsString()
  CLOUDINARY_CLOUD_NAME: string;

  @IsString()
  CLOUDINARY_API_KEY: string;

  @IsString()
  CLOUDINARY_API_SECRET: string;
}

const RULES: Record<keyof EnvironmentVariables, string> = {
  MONGODB_URI: 'obligatoire ; commence par mongodb:// ou mongodb+srv://',
  JWT_SECRET: 'obligatoire ; 32 caractères au moins',
  PORT: 'entier de 1 à 65535',
  NODE_ENV: 'development ou production',
  JWT_EXPIRES_IN:
    'nombre suivi de s, m, h ou d ; durée strictement positive et de 8 heures au plus',
  CORS_ORIGINS:
    'origines séparées par des virgules ; chacune avec schéma et hôte, sans chemin',
  CLOUDINARY_CLOUD_NAME: 'obligatoire ; nom du compte Cloudinary',
  CLOUDINARY_API_KEY: "obligatoire ; clé d'API Cloudinary",
  CLOUDINARY_API_SECRET: 'obligatoire ; secret Cloudinary',
};

const NAMES = Object.keys(RULES) as (keyof EnvironmentVariables)[];

export class ConfigValidationError extends Error {}

// Seules les variables déclarées ici sont lues. Une variable vide compte comme absente.
export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const known: Record<string, unknown> = {};
  for (const name of NAMES) {
    const value = config[name];
    if (value !== undefined && value !== '') {
      known[name] = value;
    }
  }

  const validated = plainToInstance(EnvironmentVariables, known, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    // Le message nomme les variables et leur règle, jamais leur valeur.
    const invalid = errors
      .map((error) => error.property as keyof EnvironmentVariables)
      .map((name) => `${name} (${RULES[name]})`)
      .join(', ');
    throw new ConfigValidationError(`Configuration invalide : ${invalid}.`);
  }

  return validated;
}
