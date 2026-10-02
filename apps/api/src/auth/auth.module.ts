import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { getAppConfig } from '../config/app-config';
import { EnvironmentVariables } from '../config/env.validation';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Admin, AdminSchema } from './schemas/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => {
        const { jwtSecret, jwtExpiresInSeconds } = getAppConfig(config);
        return {
          secret: jwtSecret,
          signOptions: { algorithm: 'HS256', expiresIn: jwtExpiresInSeconds },
          verifyOptions: { algorithms: ['HS256'] },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  // Les modules de ressources importent AuthModule pour garder leur contrôleur
  // d'administration.
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
