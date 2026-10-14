import {
  ConflictException,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Cuenta } from '../cuentas/entities/cuenta.entity';
import { Rol } from '../roles/entities/rol.entity';
import { ROL_ADMIN, ROL_USUARIO, RolesService } from '../roles/roles.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly rolesService: RolesService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const cantidadAdmins = await this.usuarioRepository.count({
      where: { rol: { nombre: ROL_ADMIN } },
    });
    if (cantidadAdmins > 0) {
      return;
    }

    const nombre = this.configService.get<string>('ADMIN_NOMBRE');
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    if (!nombre || !email || !password) {
      this.logger.warn(
        'No hay ningún ADMIN. Llena ADMIN_NOMBRE, ADMIN_EMAIL y ADMIN_PASSWORD en el .env y reinicia.',
      );
      return;
    }

    const existe = await this.usuarioRepository.findOne({ where: { email } });
    if (existe) {
      this.logger.warn(
        `El correo ${email} ya existe como ${existe.rol.nombre}. Usa otro ADMIN_EMAIL en el .env.`,
      );
      return;
    }

    const rolAdmin = await this.rolesService.findByNombre(ROL_ADMIN);
    await this.crearUsuarioConCuenta({ nombre, email, password }, rolAdmin);
    this.logger.log(`ADMIN inicial creado: ${email}`);
  }

  async register(registerDto: RegisterDto) {
    const rolUsuario = await this.rolesService.findByNombre(ROL_USUARIO);
    const resultado = await this.crearUsuarioConCuenta(registerDto, rolUsuario);
    return { message: 'Usuario registrado exitosamente', ...resultado };
  }

  async crearUsuarioConCuenta(datos: RegisterDto, rol: Rol) {
    const existe = await this.usuarioRepository.findOne({
      where: { email: datos.email },
    });
    if (existe) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(datos.password, 10);

    return this.dataSource.transaction(async (manager) => {
      const usuario = manager.create(Usuario, {
        nombre: datos.nombre,
        email: datos.email,
        password: passwordHash,
        rol,
      });
      const usuarioGuardado = await manager.save(usuario);

      const cuenta = manager.create(Cuenta, {
        saldo: 0,
        usuario: usuarioGuardado,
      });
      const cuentaGuardada = await manager.save(cuenta);

      return {
        usuario: {
          id: usuarioGuardado.id,
          nombre: usuarioGuardado.nombre,
          email: usuarioGuardado.email,
          rol: usuarioGuardado.rol.nombre,
        },
        cuenta: {
          id: cuentaGuardada.id,
          saldo: cuentaGuardada.saldo,
          fechaCreacion: cuentaGuardada.fechaCreacion,
        },
      };
    });
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.password')
      .leftJoinAndSelect('usuario.rol', 'rol')
      .where('usuario.email = :email', { email: loginDto.email })
      .getOne();

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const passwordValido = await bcrypt.compare(
      loginDto.password,
      usuario.password,
    );
    if (!passwordValido) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol.nombre,
    };
    const token = await this.jwtService.signAsync(payload);

    return { message: 'Inicio de sesión exitoso', access_token: token };
  }
}
