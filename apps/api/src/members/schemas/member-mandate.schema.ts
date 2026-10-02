import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { MemberRole } from '../../common/enums/member-role.enum';

// La présence d'un membre au club pendant une année Rotary.
@Schema({ timestamps: true })
export class MemberMandate {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Member', required: true })
  member: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'RotaryYear', required: true })
  rotaryYear: Types.ObjectId;

  @Prop({ type: [String], enum: Object.values(MemberRole), default: [] })
  roles: MemberRole[];

  // Entier à partir de 1, unique dans son année. Pas de borne ici : le
  // réordonnancement passe par des valeurs négatives dans sa transaction.
  @Prop({ type: Number, required: true })
  order: number;

  createdAt: Date;
  updatedAt: Date;
}

export const MemberMandateSchema = SchemaFactory.createForClass(MemberMandate);

MemberMandateSchema.index({ member: 1, rotaryYear: 1 }, { unique: true });
MemberMandateSchema.index({ rotaryYear: 1, order: 1 }, { unique: true });
MemberMandateSchema.index({ rotaryYear: 1, roles: 1 });
