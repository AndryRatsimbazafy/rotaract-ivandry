import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthenticatedRequest } from '../decorators/current-admin.decorator';

// Tout refus lève l'exception sans message : le filtre d'erreurs répond alors
// « Authentification requise. », avec le même corps dans tous les cas.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [type, token] = (request.headers.authorization ?? '').split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException();
    }

    const admin = await this.authService.authenticate(token);
    if (!admin) {
      throw new UnauthorizedException();
    }

    request.admin = admin;
    return true;
  }
}
