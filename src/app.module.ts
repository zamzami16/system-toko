import { Module } from '@nestjs/common';
import { UserModule } from './users/user.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { DataMasterModule } from './data_master/data.master.module';
import { ContactModule } from './data_master/contact/contact.module';
import { HealthModule } from './health/health.module';
import { AkunModule } from './akun/akun.module';
import { KasModule } from './kas/kas.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    AuthModule,
    DataMasterModule,
    ContactModule,
    HealthModule,
    KasModule,
    AkunModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
