import { HttpException, Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcryt from 'bcrypt';
import { AuthValidation } from './auth.validation';
import { AuthSignIn } from '../model/auth.model';
import { ValidationService } from '../common/validation.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private validationService: ValidationService,
  ) {}

  async signIn(request: AuthSignIn): Promise<{ access_token: string }> {
    const signInRequest: AuthSignIn = this.validationService.validate(
      AuthValidation.SIGN_IN,
      request,
    );

    const user = await this.userService.findFromUsername(
      signInRequest.username,
    );
    if (!user) {
      throw new HttpException('Username or password wrong.', 400);
    }

    const isValidPassword = await bcryt.compare(
      signInRequest.password,
      user.password,
    );
    if (!isValidPassword) {
      throw new HttpException('Username or password wrong.', 400);
    }

    const payload = { sub: user.contact_id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
