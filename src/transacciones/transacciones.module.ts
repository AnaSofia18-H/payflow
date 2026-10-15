
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaccion } from './entities/transaccion.entity';
import { Cuenta } from '../cuentas/entities/cuenta.entity';
import { TransaccionesController } from './transacciones.controller';
import { TransaccionesService } from './transacciones.service';
import { TiposTransaccionModule } from '../tipos-transaccion/tipos-transaccion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaccion, Cuenta]),
    TiposTransaccionModule,
  ],
  controllers: [TransaccionesController],
  providers: [TransaccionesService],
})
export class TransaccionesModule {}
