import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

type FieldError = { field: string; message: string };

function toDetails(errors: ValidationError[], parent = ''): FieldError[] {
  return errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const constraints = error.constraints ?? {};
    const own: FieldError[] = [];

    if ('whitelistValidation' in constraints) {
      own.push({ field, message: 'Champ non autorisé.' });
    } else if (Object.keys(constraints).length > 0) {
      own.push({ field, message: Object.values(constraints)[0] });
    }

    return [...own, ...toDetails(error.children ?? [], field)];
  });
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) =>
      new BadRequestException({
        message: 'Données invalides.',
        details: toDetails(errors),
      }),
  });
}
