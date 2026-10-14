import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';

@Entity('cuentas')
export class Cuenta {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  saldo!: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;

  @OneToOne(() => Usuario, (usuario) => usuario.cuenta, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;
}