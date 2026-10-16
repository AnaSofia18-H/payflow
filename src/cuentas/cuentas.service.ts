import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cuenta } from './entities/cuenta.entity';

@Injectable()
export class CuentasService {
  constructor(
    @InjectRepository(Cuenta)
    private readonly cuentaRepository: Repository<Cuenta>,
  ) {}

  async miCuenta(usuarioId: number) {
    const cuenta = await this.cuentaRepository.findOne({
      where: { usuario: { id: usuarioId } },
      relations: { usuario: true },
    });
    if (!cuenta) {
      throw new NotFoundException('Este usuario no tiene cuenta');
    }
    return cuenta;
  }

  async miSaldo(usuarioId: number) {
    const cuenta = await this.miCuenta(usuarioId);
    return { cuentaId: cuenta.id, saldo: cuenta.saldo };
  }

  async listar() {
    return this.cuentaRepository.find({
      relations: { usuario: true },
      order: { id: 'ASC' },
    });
  }
}
