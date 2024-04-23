import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { AuthModule } from '../src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [TestService],
})
export class TestModule {}
