import { randomBytes } from 'node:crypto';
import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { isValidObjectId, Model } from 'mongoose';
import { getAppConfig } from '../config/app-config';
import { EnvironmentVariables } from '../config/env.validation';
import { LoginDto } from './dto/login.dto';
import { Admin } from './schemas/admin.schema';

export type AuthenticatedAdmin = {
  id: string;
  email: string;
  role: string;
};

export type LoginResult = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  admin: AuthenticatedAdmin;
};

@Injectable()
export class AuthService implements OnModuleInit {
  private dummyHash: string;

  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  async onModuleInit(): Promise<void> {
    // Vérifié quand l'email est inconnu, pour que la durée de la réponse ne
    // révèle pas si un compte existe.
    this.dummyHash = await argon2.hash(randomBytes(16).toString('hex'));
  }

  async login({ email, password }: LoginDto): Promise<LoginResult> {
    const admin = await this.adminModel
      .findOne({ email: email.trim().toLowerCase() })
      .exec();
    const passwordMatches = await this.verifyPassword(
      admin?.passwordHash ?? this.dummyHash,
      password,
    );

    if (!admin || !passwordMatches) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    return {
      accessToken: await this.jwtService.signAsync({
        sub: admin.id as string,
        role: admin.role,
      }),
      tokenType: 'Bearer',
      expiresIn: getAppConfig(this.configService).jwtExpiresInSeconds,
      admin: { id: admin.id as string, email: admin.email, role: admin.role },
    };
  }

  // Le compte désigné par un jeton valide, relu en base ; null si le jeton est
  // invalide ou expiré, ou si le compte n'existe plus.
  async authenticate(token: string): Promise<AuthenticatedAdmin | null> {
    let subject: unknown;
    try {
      ({ sub: subject } = await this.jwtService.verifyAsync<{ sub?: unknown }>(
        token,
      ));
    } catch {
      return null;
    }
    if (typeof subject !== 'string' || !isValidObjectId(subject)) {
      return null;
    }

    const admin = await this.adminModel.findById(subject).exec();
    return admin
      ? { id: admin.id as string, email: admin.email, role: admin.role }
      : null;
  }

  private async verifyPassword(
    passwordHash: string,
    password: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(passwordHash, password);
    } catch {
      return false;
    }
  }
}
