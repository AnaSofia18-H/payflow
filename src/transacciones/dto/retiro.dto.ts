
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Max } from 'class-validator';

export class RetiroDto {
  @ApiProperty({ example: 10000 })
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
