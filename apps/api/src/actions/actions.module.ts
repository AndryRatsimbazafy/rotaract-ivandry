import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import {
  RotaryYear,
  RotaryYearSchema,
} from '../rotary-years/schemas/rotary-year.schema';
import { ActionsAdminController } from './actions.admin.controller';
import { ActionsPublicController } from './actions.public.controller';
import { ActionsService } from './actions.service';
import { Action, ActionSchema } from './schemas/action.schema';

@Module({
  imports: [
    AuthModule,
    // Le module lit les années Rotary sans importer leur module, qui lit lui-même
    // les actions : chacun déclare les modèles qu'il lit.
    MongooseModule.forFeature([
      { name: Action.name, schema: ActionSchema },
      { name: RotaryYear.name, schema: RotaryYearSchema },
    ]),
  ],
  controllers: [ActionsPublicController, ActionsAdminController],
  providers: [ActionsService],
})
export class ActionsModule {}
