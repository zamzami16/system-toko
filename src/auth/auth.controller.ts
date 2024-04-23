import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignIn } from '../model/auth.model';
import { WebResponse } from '../model/web.response';
import { Public } from '../common/public.decorator';

@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @HttpCode(200)
  @Public()
  async signIn(
    @Body() authRequest: AuthSignIn,
  ): Promise<WebResponse<{ access_token: string }>> {
    const result = await this.authService.signIn(authRequest);

    return {
      data: result,
    };
  }
}
