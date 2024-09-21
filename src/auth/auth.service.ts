import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessionService } from 'src/session/session.service';
import { UserService } from 'src/user/user.service';
import { TUserAgentAndIp } from 'src/common/decorators/userAgentAndIp.decorator';
import { CreateUserInput } from 'src/user/inputs/create-user.input';
import { JwtService } from '@nestjs/jwt';
import { TTokens } from './types';
import { signupLocalDto } from './dtos/registration.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private sessionService: SessionService,
    private jwtService: JwtService,
  ) {}

  async hashData(data: string | Buffer) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(data, salt);
  }

  async getTokens(userUuid: string, email: string): Promise<TTokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userUuid,
          email,
        },
        {
          expiresIn: 60 * 10,
          secret: process.env.ACCESS_SECRET,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userUuid,
          email,
        },
        {
          expiresIn: 60 * 60 * 24 * 7,
          secret: process.env.REFRESH_SECRET,
        },
      ),
    ]);
    return { access_token: at, refresh_token: rt };
  }

  async signupLocalUser(
    userInput: CreateUserInput,
    sessionInfo: TUserAgentAndIp,
  ): Promise<signupLocalDto> {
    const { password, ...restData } = userInput;

    const hashedPasssword = await this.hashData(password);

    const userData = {
      password: hashedPasssword,
      ...restData,
    };

    const data = await this.prisma.$transaction(async (tx) => {
      const user = await this.userService.createUser(userData, tx);

      const tokens = await this.getTokens(user.uuid, user.email);

      const sessionData = {
        user_uuid: user.uuid,
        refresh_token: tokens.refresh_token,
        refresh_expires_at: 123123,
        ...sessionInfo,
      };

      await this.sessionService.createSession(sessionData, tx);

      return { user, ...tokens };
    });
    return data;
  }
}
