import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { isEmail } from 'class-validator';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { ConfigValidationError } from '../config/env.validation';
import { Admin, ADMIN_ROLE } from './schemas/admin.schema';

// Commande manuelle : npm run seed:admin --workspace=api
// Crée l'unique compte d'administration, ou remplace son mot de passe.
// Contrat : specs/003-admin-auth/contracts/seed-admin.md. Rien de ce qu'elle
// écrit ne contient le mot de passe, son hachage, l'email du compte existant
// ni l'adresse de la base.

const MIN_PASSWORD_LENGTH = 12;
const MAX_EMAIL_LENGTH = 254;

function fail(message: string): number {
  console.error(message);
  return 1;
}

async function seedAdmin(): Promise<number> {
  const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? '';

  if (!isEmail(email) || email.length > MAX_EMAIL_LENGTH) {
    return fail('ADMIN_EMAIL : email valide obligatoire.');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return fail('ADMIN_PASSWORD : 12 caractères au moins.');
  }

  let app: Awaited<ReturnType<typeof NestFactory.createApplicationContext>>;
  try {
    // Sans le journal de NestJS, qui écrirait l'erreur d'origine d'une
    // connexion ratée, avec le nom d'hôte de la base.
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: false,
      abortOnError: false,
    });
  } catch (error) {
    return fail(
      error instanceof ConfigValidationError
        ? error.message
        : 'Connexion à la base de données impossible.',
    );
  }

  try {
    const adminModel = app.get<Model<Admin>>(getModelToken(Admin.name));
    const existing = await adminModel.findOne().exec();

    if (existing && existing.email !== email) {
      return fail(
        "Un compte d'administration existe déjà avec un autre email. Aucune modification.",
      );
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    if (existing) {
      existing.passwordHash = passwordHash;
      await existing.save();
      console.log("Mot de passe du compte d'administration mis à jour.");
    } else {
      await adminModel.create({ email, passwordHash, role: ADMIN_ROLE });
      console.log("Compte d'administration créé.");
    }
    return 0;
  } catch {
    return fail('Connexion à la base de données impossible.');
  } finally {
    await app.close();
  }
}

void seedAdmin().then((code) => process.exit(code));
