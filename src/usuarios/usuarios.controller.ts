import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { AsignarRolDto } from './dto/asignar-rol.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import type { UsuarioToken } from '../auth/interfaces/usuario-token.interface';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Crear usuario con rol (solo ADMIN). También crea su cuenta.',
  })
  crear(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.crear(createUsuarioDto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar usuarios (solo ADMIN)' })
  listar() {
    return this.usuariosService.listar();
  }

  @Get('perfil')
  @ApiOperation({ summary: 'Ver mi propio perfil' })
  perfil(@UsuarioActual() usuario: UsuarioToken) {
    return this.usuariosService.perfil(usuario.id);
  }

  @Patch(':id/rol')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Asignar rol a un usuario (solo ADMIN)' })
  asignarRol(
    @Param('id', ParseIntPipe) id: number,
    @Body() asignarRolDto: AsignarRolDto,
  ) {
    return this.usuariosService.asignarRol(id, asignarRolDto);
  }
}
