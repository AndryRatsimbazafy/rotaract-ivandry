import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export const ADMIN_ROLE = 'ADMIN';

// Le compte d'administration, unique en V1. Créé et modifié uniquement par la
// commande seed:admin (seed-admin.ts).
@Schema({ timestamps: true })
export class Admin {
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: String, required: true, enum: [ADMIN_ROLE] })
  role: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
