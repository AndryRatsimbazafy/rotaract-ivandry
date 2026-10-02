import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import type { AuthenticatedAdmin, LoginResult } from './auth.service';
import { CurrentAdmin } from './decorators/current-admin.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Seule route limitée en fréquence : 5 demandes par minute et par adresse IP,
  // réussies ou non (réglage dans app.module.ts).
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  login(@Body() loginDto: LoginDto): Promise<LoginResult> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentAdmin() admin: AuthenticatedAdmin): AuthenticatedAdmin {
    return admin;
  }
}
