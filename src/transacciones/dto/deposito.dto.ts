
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive, Max } from 'class-validator';

export class DepositoDto {
  @ApiProperty({
    example: 2,
    description: 'Id de la cuenta que recibe el dinero',
  })
  @IsInt({ message: 'cuentaId debe ser un número entero' })
  @IsPositive({ message: 'cuentaId debe ser mayor a 0' })
  cuentaId!: number;

  @ApiProperty({ example: 50000 })
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
