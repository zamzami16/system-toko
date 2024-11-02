import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignIn } from '../model/auth.model';
import { WebResponse } from '../model/web.response';
import { Public } from '../common/public.decorator';
import { Tokens } from '../model/token.model';
import { RefreshToken } from '../common/refresh.token.decorator';
import { Auth } from '../common/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @HttpCode(200)
  @Public()
  async signIn(@Body() authRequest: AuthSignIn): Promise<WebResponse<Tokens>> {
    const result = await this.authService.signIn(authRequest);
    return {
      data: result,
    };
  }

  @Post('/logout')
  @HttpCode(200)
  async logout(@Auth() user): Promise<WebResponse<Tokens>> {
    const result = await this.authService.logout(user.username);
    return {
      data: result,
    };
  }

  @Get('/refresh')
  @HttpCode(200)
  @RefreshToken()
  async refresh(@Auth() user) {
    const result = await this.authService.refreshToken(
      user.username,
      user.refreshToken,
    );
    return {
      data: result,
    };
  }
}
