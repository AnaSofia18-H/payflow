import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { RolesModule } from './roles/roles.module';
import { TiposTransaccionModule } from './tipos-transaccion/tipos-transaccion.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CuentasModule } from './cuentas/cuentas.module';
import { TransaccionesModule } from './transacciones/transacciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RolesModule,
    TiposTransaccionModule,
    UsuariosModule,
    CuentasModule,
    TransaccionesModule,
  ],
})
export class AppModule {}