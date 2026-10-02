import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../decorators/current-admin.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Se place après JwtAuthGuard. Le refus lève l'exception sans message : le
// filtre d'erreurs répond alors « Accès refusé. ».
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!roles || roles.length === 0) {
      return true;
    }

    const { admin } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!admin || !roles.includes(admin.role)) {
      throw new ForbiddenException();
    }
    return true;
  }
}
