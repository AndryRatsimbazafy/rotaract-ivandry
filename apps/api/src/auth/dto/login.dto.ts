import { IsNotEmpty, IsString } from 'class-validator';

// Présence seulement : ni format d'email ni longueur de mot de passe ne sont
// contrôlés à la connexion.
export class LoginDto {
  @IsString({ message: "L'email est obligatoire." })
  @IsNotEmpty({ message: "L'email est obligatoire." })
  email: string;

  @IsString({ message: 'Le mot de passe est obligatoire.' })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  password: string;
}
