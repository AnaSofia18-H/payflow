import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoTransaccion } from './entities/tipo-transaccion.entity';

export const TIPO_DEPOSITO = 'DEPOSITO';
export const TIPO_RETIRO = 'RETIRO';
export const TIPO_TRANSFERENCIA = 'TRANSFERENCIA';

@Injectable()
export class TiposTransaccionService implements OnModuleInit {
  constructor(
    @InjectRepository(TipoTransaccion)
    private readonly tipoRepository: Repository<TipoTransaccion>,
  ) {}

  async onModuleInit() {
    const tiposBase = [
      {
        nombre: TIPO_DEPOSITO,
        descripcion: 'El ADMIN agrega dinero a una cuenta',
      },
      {
        nombre: TIPO_RETIRO,
        descripcion: 'El usuario saca dinero de su cuenta',
      },
      {
        nombre: TIPO_TRANSFERENCIA,
        descripcion: 'Dinero de una cuenta a otra',
      },
    ];
    for (const tipo of tiposBase) {
      const existe = await this.tipoRepository.findOne({
        where: { nombre: tipo.nombre },
      });
      if (!existe) {
        await this.tipoRepository.save(this.tipoRepository.create(tipo));
      }
    }
  }

  async findByNombre(nombre: string) {
    const tipo = await this.tipoRepository.findOne({ where: { nombre } });
    if (!tipo) {
      throw new NotFoundException(
        `Tipo de transacción ${nombre} no encontrado`,
      );
    }
    return tipo;
  }
}