import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { RolesService } from '../roles/roles.service';
import { AsignarRolDto } from './dto/asignar-rol.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly authService: AuthService,
    private readonly rolesService: RolesService,
  ) {}

  async crear(createUsuarioDto: CreateUsuarioDto) {
    const { rolId, ...datos } = createUsuarioDto;
    const rol = await this.rolesService.findOne(rolId);
    const resultado = await this.authService.crearUsuarioConCuenta(datos, rol);
    return { message: 'Usuario creado exitosamente', ...resultado };
  }

  async listar() {
    return this.usuarioRepository.find({ order: { id: 'ASC' } });
  }

  async perfil(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: { cuenta: true },
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async asignarRol(id: number, asignarRolDto: AsignarRolDto) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    usuario.rol = await this.rolesService.findOne(asignarRolDto.rolId);
    await this.usuarioRepository.save(usuario);
    return {
      message: `Rol actualizado a ${usuario.rol.nombre}. El usuario debe volver a iniciar sesión para que el cambio se refleje en su token.`,
      usuario,
    };
  }
}
