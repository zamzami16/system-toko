import { Module } from '@nestjs/common';
import { AkunService } from './akun.service';
import { AkunController } from './akun.controller';

@Module({
  providers: [AkunService],
  controllers: [AkunController],
  exports: [AkunService],
})
export class AkunModule {}
