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

  @IsString()
  @Matches(/^\d+[smhd]$/)
  JWT_EXPIRES_IN: string = '8h';

  @Validate(IsOriginList)
  CORS_ORIGINS: string = '';
}

const RULES: Record<keyof EnvironmentVariables, string> = {
  MONGODB_URI: 'obligatoire ; commence par mongodb:// ou mongodb+srv://',
  JWT_SECRET: 'obligatoire ; 32 caractères au moins',
  PORT: 'entier de 1 à 65535',
  NODE_ENV: 'development ou production',
  JWT_EXPIRES_IN: 'nombre suivi de s, m, h ou d',
  CORS_ORIGINS:
    'origines séparées par des virgules ; chacune avec schéma et hôte, sans chemin',
};

const NAMES = Object.keys(RULES) as (keyof EnvironmentVariables)[];

export class ConfigValidationError extends Error {}

// Seules les variables du socle sont lues. Une variable vide compte comme absente.
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
