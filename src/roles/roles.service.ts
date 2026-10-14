import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

export const ROL_ADMIN = 'ADMIN';
export const ROL_USUARIO = 'USUARIO';
const ROLES_BASE = [ROL_ADMIN, ROL_USUARIO];

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async onModuleInit() {
    const rolesBase = [
      { nombre: ROL_ADMIN, descripcion: 'Administrador del sistema' },
      { nombre: ROL_USUARIO, descripcion: 'Usuario normal de la billetera' },
    ];
    for (const rol of rolesBase) {
      const existe = await this.findByNombreOrNull(rol.nombre);
      if (!existe) {
        await this.rolRepository.save(this.rolRepository.create(rol));
      }
    }
  }

  async create(createRolDto: CreateRolDto) {
    const existe = await this.findByNombreOrNull(createRolDto.nombre);
    if (existe) {
      throw new ConflictException(
        `El rol con el nombre "${createRolDto.nombre}" ya existe`,
      );
    }
    const rol = await this.rolRepository.save(
      this.rolRepository.create(createRolDto),
    );
    return { message: 'Rol creado exitosamente', data: rol };
  }

  findAll() {
    return this.rolRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const rol = await this.rolRepository.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException(`Rol con id ${id} no encontrado`);
    }
    return rol;
  }

  async findByNombre(nombre: string) {
    const rol = await this.findByNombreOrNull(nombre);
    if (!rol) {
      throw new NotFoundException(`Rol ${nombre} no encontrado`);
    }
    return rol;
  }

  async update(id: number, updateRolDto: UpdateRolDto) {
    const rol = await this.findOne(id);

    if (
      updateRolDto.nombre &&
      updateRolDto.nombre !== rol.nombre &&
      ROLES_BASE.includes(rol.nombre)
    ) {
      throw new BadRequestException(
        `El rol ${rol.nombre} es del sistema y no se puede renombrar`,
      );
    }

    if (updateRolDto.nombre && updateRolDto.nombre !== rol.nombre) {
      const existe = await this.findByNombreOrNull(updateRolDto.nombre);
      if (existe) {
        throw new ConflictException(
          `El rol con el nombre "${updateRolDto.nombre}" ya existe`,
        );
      }
    }

    this.rolRepository.merge(rol, updateRolDto);
    const guardado = await this.rolRepository.save(rol);
    return { message: 'Rol actualizado exitosamente', data: guardado };
  }

  async remove(id: number) {
    const rol = await this.rolRepository.findOne({
      where: { id },
      relations: { usuarios: true },
    });
    if (!rol) {
      throw new NotFoundException(`Rol con id ${id} no encontrado`);
    }
    if (ROLES_BASE.includes(rol.nombre)) {
      throw new BadRequestException(
        `El rol ${rol.nombre} es del sistema y no se puede eliminar`,
      );
    }
    if (rol.usuarios.length > 0) {
      throw new ConflictException(
        `No se puede eliminar el rol ${rol.nombre}: lo tienen ${rol.usuarios.length} usuario(s)`,
      );
    }
    await this.rolRepository.remove(rol);
    return {
      message: `Rol "${rol.nombre}" con id ${id} eliminado exitosamente`,
    };
  }

  private findByNombreOrNull(nombre: string) {
    return this.rolRepository.findOne({ where: { nombre } });
  }
}