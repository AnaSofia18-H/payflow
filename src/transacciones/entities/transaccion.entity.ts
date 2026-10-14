import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TipoTransaccion } from '../../tipos-transaccion/entities/tipo-transaccion.entity';
import { Cuenta } from '../../cuentas/entities/cuenta.entity';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';

@Entity('transacciones')
export class Transaccion {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => TipoTransaccion, (tipo) => tipo.transacciones, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'tipo_id' })
  tipo!: TipoTransaccion;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: decimalTransformer,
  })
  monto!: number;

  @CreateDateColumn()
  fecha!: Date;

  @ManyToOne(() => Cuenta, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cuenta_origen_id' })
  cuentaOrigen!: Cuenta;

  @ManyToOne(() => Cuenta, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cuenta_destino_id' })
  cuentaDestino!: Cuenta | null;
}