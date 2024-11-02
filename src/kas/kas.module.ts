import { Module } from '@nestjs/common';
import { KasService } from './kas.service';
import { KasController } from './kas.controller';
import { AkunModule } from '../akun/akun.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [AkunModule, CommonModule],
  providers: [KasService],
  controllers: [KasController],
  exports: [KasService],
})
export class KasModule {}
