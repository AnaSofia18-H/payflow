import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AsignarRolDto {
  @ApiProperty({ example: 1, description: 'id del rol (ver GET /api/roles)' })
  @IsInt({ message: 'rolId debe ser un número entero' })
  @IsPositive({ message: 'rolId debe ser mayor que 0' })
  rolId!: number;
}