import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cuenta } from './entities/cuenta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cuenta])],
})
export class CuentasModule {}