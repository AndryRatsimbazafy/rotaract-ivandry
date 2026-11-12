import { createHash, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import {
  InjectThrottlerOptions,
  InjectThrottlerStorage,
  normalizeIp,
  ThrottlerGuard,
} from '@nestjs/throttler';
import type {
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { getAppConfig } from '../../config/app-config';
import type { EnvironmentVariables } from '../../config/env.validation';

// En-têtes posés par les serveurs Next.js (site et Back Office) : l'adresse
// du visiteur, et le secret partagé qui l'authentifie.
export const CLIENT_IP_HEADER = 'x-client-ip';
export const INTERNAL_SECRET_HEADER = 'x-internal-secret';

// Empreintes de même longueur : la comparaison à temps constant ne dit rien
// de la longueur du secret attendu.
function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

function header(req: Record<string, any>, name: string): string | undefined {
  const value: unknown = req.headers?.[name];
  return typeof value === 'string' ? value.trim() : undefined;
}

// Limitation de fréquence comptée par visiteur. Le navigateur n'appelle
// jamais l'API : sans l'en-tête X-Client-Ip, tous les visiteurs du site
// partageraient l'adresse du serveur Next.js. L'en-tête n'est cru que si le
// secret INTERNAL_API_SECRET est configuré et concorde ; sinon, l'adresse de
// la requête (trust proxy, main.ts) est comptée, comme avant.
@Injectable()
export class ClientIpThrottlerGuard extends ThrottlerGuard {
  private readonly expectedSecret: Buffer | null;

  constructor(
    @InjectThrottlerOptions() options: ThrottlerModuleOptions,
    @InjectThrottlerStorage() storageService: ThrottlerStorage,
    reflector: Reflector,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    super(options, storageService, reflector);
    const secret = getAppConfig(config).internalApiSecret;
    this.expectedSecret = secret ? digest(secret) : null;
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const clientIp = this.trustedClientIp(req);
    return clientIp
      ? normalizeIp(clientIp, this.ipv6SubnetPrefix)
      : super.getTracker(req);
  }

  private trustedClientIp(req: Record<string, any>): string | null {
    if (!this.expectedSecret) {
      return null;
    }
    const secret = header(req, INTERNAL_SECRET_HEADER);
    const clientIp = header(req, CLIENT_IP_HEADER);
    if (!secret || !clientIp || isIP(clientIp) === 0) {
      return null;
    }
    return timingSafeEqual(digest(secret), this.expectedSecret)
      ? clientIp
      : null;
  }
}
