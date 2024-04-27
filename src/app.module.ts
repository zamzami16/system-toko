import { Module } from '@nestjs/common';
import { UserModule } from './users/user.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { DataMasterModule } from './data_master/data.master.module';
import { ContactModule } from './data_master/contact/contact.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    AuthModule,
    DataMasterModule,
    ContactModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
