import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserRequestDto, UserResponse } from '../model/user.model';
import { WebResponse } from '../model/web.response';
import { Public } from '../common/public.decorator';

@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @HttpCode(200)
  @Public()
  async register(
    @Body() request: RegisterUserRequestDto,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.register(request);

    return {
      data: result,
    };
  }
}
