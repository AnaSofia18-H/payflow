import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaccion } from './entities/transaccion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaccion])],
})
export class TransaccionesModule {}