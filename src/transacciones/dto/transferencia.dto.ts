
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive, Max } from 'class-validator';

export class TransferenciaDto {
  @ApiProperty({
    example: 3,
    description: 'Id de la cuenta que recibe',
  })
  @IsInt({
    message: 'cuentaDestinoId debe ser un número entero',
  })
  @IsPositive({
    message: 'cuentaDestinoId debe ser mayor a 0',
  })
  cuentaDestinoId!: number;

  @ApiProperty({ example: 15000 })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El monto debe ser un número con máximo 2 decimales' },
  )
  @IsPositive({ message: 'El monto debe ser mayor a 0' })
  @Max(1000000000, {
    message: 'El monto no puede ser mayor a 1.000.000.000',
  })
  monto!: number;
}
