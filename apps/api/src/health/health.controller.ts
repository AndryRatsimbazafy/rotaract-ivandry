import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  check(): { status: 'ok'; database: 'up' } {
    if (this.connection.readyState !== ConnectionStates.connected) {
      throw new ServiceUnavailableException(
        'La base de données ne répond pas.',
      );
    }
    return { status: 'ok', database: 'up' };
  }
}
