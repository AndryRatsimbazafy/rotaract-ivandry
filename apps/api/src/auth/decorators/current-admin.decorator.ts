import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedAdmin } from '../auth.service';

export type AuthenticatedRequest = Request & { admin?: AuthenticatedAdmin };

// Le compte attaché à la requête par JwtAuthGuard.
export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().admin,
);
