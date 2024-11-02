import {
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { Logger } from 'winston';
import { RegisterUserRequestDto, UserResponse } from '../model/user.model';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private validationService: ValidationService,
  ) {}

  async findFromUsername(username: string): Promise<User> {
    return await this.prismaService.user.findUnique({
      where: {
        username: username,
      },
    });
  }

  async updateRefreshToken(username: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prismaService.user.update({
      data: {
        refreshToken: hashedRefreshToken,
      },
      where: {
        username: username,
      },
    });
  }

  async deleteRefreshToken(username: string): Promise<UserResponse> {
    let user = await this.findFromUsername(username);
    if (!user) {
      throw new UnauthorizedException();
    }
    user = await this.prismaService.user.update({
      where: {
        username: user.username,
      },
      data: {
        refreshToken: null,
      },
    });

    return {
      username: user.username,
      token: user.refreshToken,
    };
  }

  async register(request: RegisterUserRequestDto): Promise<UserResponse> {
    const registerRequest: RegisterUserRequestDto =
      this.validationService.validate(UserValidation.REGISTER, request);

    const is_exists = await this.prismaService.user
      .count({
        where: {
          username: registerRequest.username,
        },
      })
      .then(Boolean);

    if (is_exists) {
      throw new HttpException('Username already used.', 400);
    }

    let contact = await this.prismaService.contact.findFirst({
      where: {
        nama: registerRequest.nama,
      },
    });

    if (!contact) {
      contact = await this.prismaService.contact.create({
        data: {
          nama: registerRequest.nama,
          alamat: registerRequest.alamat,
          email: registerRequest.email,
          noHp: registerRequest.noHp,
        },
      });
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);
    const user = await this.prismaService.user.create({
      data: {
        username: registerRequest.username,
        password: registerRequest.password,
        contactId: contact.id,
      },
    });

    return {
      username: user.username,
      token: user.refreshToken,
    };
  }
}
