
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransaccionesService } from './transacciones.service';
import { DepositoDto } from './dto/deposito.dto';
import { RetiroDto } from './dto/retiro.dto';
import { TransferenciaDto } from './dto/transferencia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import type { UsuarioToken } from '../auth/interfaces/usuario-token.interface';

@ApiTags('Transacciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transacciones')
export class TransaccionesController {
  constructor(private readonly transaccionesService: TransaccionesService) {}

  @Post('deposito')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Depositar dinero en una cuenta (solo ADMIN)' })
  depositar(@Body() dto: DepositoDto) {
    return this.transaccionesService.depositar(dto);
  }

  @Post('retiro')
  @Roles('USUARIO')
  @ApiOperation({ summary: 'Retirar de mi cuenta (solo USUARIO)' })
  retirar(@UsuarioActual() usuario: UsuarioToken, @Body() dto: RetiroDto) {
    return this.transaccionesService.retirar(usuario, dto);
  }

  @Post('transferencia')
  @ApiOperation({ summary: 'Transferir desde mi cuenta a otra cuenta' })
  transferir(
    @UsuarioActual() usuario: UsuarioToken,
    @Body() dto: TransferenciaDto,
  ) {
    return this.transaccionesService.transferir(usuario, dto);
  }

  @Get('mis-transacciones')
  @ApiOperation({ summary: 'Mi historial de movimientos' })
  misTransacciones(@UsuarioActual() usuario: UsuarioToken) {
    return this.transaccionesService.misTransacciones(usuario);
  }

  @Get('usuario/:usuarioId')
  @ApiOperation({
    summary:
      'Transacciones de un usuario (ADMIN: cualquiera; USUARIO: solo el suyo)',
  })
  porUsuario(
    @UsuarioActual() usuario: UsuarioToken,
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
  ) {
    return this.transaccionesService.porUsuario(usuario, usuarioId);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Todas las transacciones (solo ADMIN)' })
  listarTodas() {
    return this.transaccionesService.listarTodas();
  }
}
