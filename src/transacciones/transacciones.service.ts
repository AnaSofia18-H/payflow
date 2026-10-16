

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Transaccion } from './entities/transaccion.entity';
import { Cuenta } from '../cuentas/entities/cuenta.entity';
import {
  TIPO_DEPOSITO,
  TIPO_RETIRO,
  TIPO_TRANSFERENCIA,
  TiposTransaccionService,
} from '../tipos-transaccion/tipos-transaccion.service';
import type { UsuarioToken } from '../auth/interfaces/usuario-token.interface';
import { DepositoDto } from './dto/deposito.dto';
import { RetiroDto } from './dto/retiro.dto';
import { TransferenciaDto } from './dto/transferencia.dto';

const aCentavos = (valor: number) => Math.round(valor * 100);
const aPesos = (centavos: number) => centavos / 100;

@Injectable()
export class TransaccionesService {
  constructor(
    @InjectRepository(Transaccion)
    private readonly transaccionRepository: Repository<Transaccion>,
    @InjectRepository(Cuenta)
    private readonly cuentaRepository: Repository<Cuenta>,
    private readonly dataSource: DataSource,
    private readonly tiposService: TiposTransaccionService,
  ) {}

  async depositar(dto: DepositoDto) {
    const tipo = await this.tiposService.findByNombre(TIPO_DEPOSITO);

    return this.dataSource.transaction(async (manager) => {
      const cuenta = await this.bloquearCuentaPorId(manager, dto.cuentaId);

      cuenta.saldo = aPesos(aCentavos(cuenta.saldo) + aCentavos(dto.monto));
      await this.guardarSaldo(manager, cuenta);

      const transaccion = await manager.save(
        manager.create(Transaccion, {
          tipo,
          monto: dto.monto,
          cuentaOrigen: cuenta,
          cuentaDestino: null,
        }),
      );

      return {
        message: 'Depósito realizado',
        transaccionId: transaccion.id,
        cuentaId: cuenta.id,
        saldoNuevo: cuenta.saldo,
      };
    });
  }

  async retirar(usuario: UsuarioToken, dto: RetiroDto) {
    const tipo = await this.tiposService.findByNombre(TIPO_RETIRO);

    return this.dataSource.transaction(async (manager) => {
      const cuenta = await this.bloquearCuentaDeUsuario(manager, usuario.id);

      if (aCentavos(cuenta.saldo) < aCentavos(dto.monto)) {
        throw new BadRequestException(
          `Saldo insuficiente. Saldo actual: ${cuenta.saldo}`,
        );
      }

      cuenta.saldo = aPesos(aCentavos(cuenta.saldo) - aCentavos(dto.monto));
      await this.guardarSaldo(manager, cuenta);

      const transaccion = await manager.save(
        manager.create(Transaccion, {
          tipo,
          monto: dto.monto,
          cuentaOrigen: cuenta,
          cuentaDestino: null,
        }),
      );

      return {
        message: 'Retiro realizado',
        transaccionId: transaccion.id,
        cuentaId: cuenta.id,
        saldoNuevo: cuenta.saldo,
      };
    });
  }

  async transferir(usuario: UsuarioToken, dto: TransferenciaDto) {
    const tipo = await this.tiposService.findByNombre(TIPO_TRANSFERENCIA);

    return this.dataSource.transaction(async (manager) => {
      const cuentaUsuario = await manager.findOne(Cuenta, {
        where: { usuario: { id: usuario.id } },
      });

      if (!cuentaUsuario) {
        throw new NotFoundException('No tienes una cuenta asociada');
      }

      if (cuentaUsuario.id === dto.cuentaDestinoId) {
        throw new BadRequestException(
          'No puedes transferirte a tu propia cuenta',
        );
      }

      const cuentas = await manager.find(Cuenta, {
        where: { id: In([cuentaUsuario.id, dto.cuentaDestinoId]) },
        order: { id: 'ASC' },
        lock: { mode: 'pessimistic_write' },
      });

      const origen = cuentas.find((c) => c.id === cuentaUsuario.id);
      const destino = cuentas.find((c) => c.id === dto.cuentaDestinoId);

      if (!origen) {
        throw new NotFoundException('No tienes una cuenta asociada');
      }

      if (!destino) {
        throw new NotFoundException(
          `La cuenta destino ${dto.cuentaDestinoId} no existe`,
        );
      }

      if (aCentavos(origen.saldo) < aCentavos(dto.monto)) {
        throw new BadRequestException(
          `Saldo insuficiente. Saldo actual: ${origen.saldo}`,
        );
      }

      origen.saldo = aPesos(aCentavos(origen.saldo) - aCentavos(dto.monto));
      destino.saldo = aPesos(aCentavos(destino.saldo) + aCentavos(dto.monto));

      await this.guardarSaldo(manager, origen);

    
      await this.guardarSaldo(manager, destino);

      const transaccion = await manager.save(
        manager.create(Transaccion, {
          tipo,
          monto: dto.monto,
          cuentaOrigen: origen,
          cuentaDestino: destino,
        }),
      );

      return {
        message: 'Transferencia realizada',
        transaccionId: transaccion.id,
        cuentaOrigenId: origen.id,
        cuentaDestinoId: destino.id,
        monto: dto.monto,
        saldoNuevo: origen.saldo,
      };
    });
  }

  async misTransacciones(usuario: UsuarioToken) {
    return this.transaccionesDeUsuario(usuario.id);
  }

  async porUsuario(solicitante: UsuarioToken, usuarioId: number) {
    if (solicitante.rol !== 'ADMIN' && solicitante.id !== usuarioId) {
      throw new ForbiddenException(
        'Solo puedes consultar tus propias transacciones',
      );
    }

    return this.transaccionesDeUsuario(usuarioId);
  }

  async listarTodas() {
    return this.transaccionRepository.find({
      relations: { cuentaOrigen: true, cuentaDestino: true },
      order: { fecha: 'DESC', id: 'DESC' },
    });
  }

  private async transaccionesDeUsuario(usuarioId: number) {
    const cuenta = await this.cuentaRepository.findOne({
      where: { usuario: { id: usuarioId } },
    });

    if (!cuenta) {
      throw new NotFoundException(`El usuario ${usuarioId} no tiene cuenta`);
    }

    return this.transaccionRepository.find({
      where: [
        { cuentaOrigen: { id: cuenta.id } },
        { cuentaDestino: { id: cuenta.id } },
      ],
      relations: { cuentaOrigen: true, cuentaDestino: true },
      order: { fecha: 'DESC', id: 'DESC' },
    });
  }

  private async guardarSaldo(manager: EntityManager, cuenta: Cuenta) {
    await manager.update(Cuenta, { id: cuenta.id }, { saldo: cuenta.saldo });
  }

  private async bloquearCuentaPorId(manager: EntityManager, cuentaId: number) {
    const cuenta = await manager.findOne(Cuenta, {
      where: { id: cuentaId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!cuenta) {
      throw new NotFoundException(`La cuenta ${cuentaId} no existe`);
    }

    return cuenta;
  }

  private async bloquearCuentaDeUsuario(
    manager: EntityManager,
    usuarioId: number,
  ) {
    const cuenta = await manager.findOne(Cuenta, {
      where: { usuario: { id: usuarioId } },
    });

    if (!cuenta) {
      throw new NotFoundException('No tienes una cuenta asociada');
    }

    return this.bloquearCuentaPorId(manager, cuenta.id);
  }
}
