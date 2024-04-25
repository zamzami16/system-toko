import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { UserModule } from '../users/user.module';
import { AccessTokenStrategy } from './access.token.strategy';
import { RefreshTokenStrategy } from './refresh.token.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '15m' },
    }),
  ],

  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],

  controllers: [AuthController],

  exports: [AuthService],
})
export class AuthModule {}
