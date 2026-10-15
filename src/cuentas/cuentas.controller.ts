import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CuentasService } from './cuentas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import type { UsuarioToken } from '../auth/interfaces/usuario-token.interface';

@ApiTags('Cuentas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cuentas')
export class CuentasController {
  constructor(private readonly cuentasService: CuentasService) {}

  @Get('mi-cuenta')
  @ApiOperation({ summary: 'Ver la información de mi cuenta' })
  miCuenta(@UsuarioActual() usuario: UsuarioToken) {
    return this.cuentasService.miCuenta(usuario.id);
  }

  @Get('mi-cuenta/saldo')
  @ApiOperation({ summary: 'Ver solo mi saldo' })
  miSaldo(@UsuarioActual() usuario: UsuarioToken) {
    return this.cuentasService.miSaldo(usuario.id);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar todas las cuentas (solo ADMIN)' })
  listar() {
    return this.cuentasService.listar();
  }
}
