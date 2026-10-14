import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoTransaccion } from './entities/tipo-transaccion.entity';
import { TiposTransaccionService } from './tipos-transaccion.service';

@Module({
  imports: [TypeOrmModule.forFeature([TipoTransaccion])],
  providers: [TiposTransaccionService],
  exports: [TiposTransaccionService],
})
export class TiposTransaccionModule {}