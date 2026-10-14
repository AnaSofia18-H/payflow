import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Laura Gómez' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  nombre!: string;

  @ApiProperty({ example: 'laura@correo.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(150, { message: 'El email no puede tener más de 150 caracteres' })
  email!: string;

  @ApiProperty({ example: 'Clave123*' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password!: string;
}
