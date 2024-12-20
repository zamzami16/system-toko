import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcryt from 'bcrypt';
import { AuthValidation } from './auth.validation';
import { AuthSignIn } from '../model/auth.model';
import { ValidationService } from '../common/validation.service';
import { ConfigService } from '@nestjs/config';
import { Tokens } from '../model/token.model';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private validationService: ValidationService,
    private configService: ConfigService,
  ) {}

  async signIn(request: AuthSignIn): Promise<Tokens> {
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

    const tokens = await this.getTokens(user.contactId, user.username);
    await this.userService.updateRefreshToken(
      user.username,
      tokens.refreshToken,
    );

    return tokens;
  }

  async refreshToken(username: string, refreshToken: string): Promise<Tokens> {
    const user = await this.userService.findFromUsername(username);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('forbidden.');
    const refreshTokenMatches = await bcryt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) throw new UnauthorizedException('forbidden.');
    const tokens = await this.getTokens(user.contactId, user.username);
    await this.userService.updateRefreshToken(
      user.username,
      tokens.refreshToken,
    );
    return tokens;
  }

  async logout(username: string): Promise<Tokens> {
    const user = await this.userService.findFromUsername(username);
    if (!user) {
      throw new UnauthorizedException('forbidden.');
    }
    await this.userService.deleteRefreshToken(user.username);
    return {
      accessToken: '',
      refreshToken: '',
    };
  }

  async getTokens(userId: number, username: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
