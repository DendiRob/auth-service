import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessionService } from 'src/session/session.service';
import { UserService } from 'src/user/user.service';
import { TUserAgentAndIp } from 'src/common/decorators/userAgentAndIp.decorator';
import { CreateUserInput } from 'src/user/inputs/createUser.input';
import { JwtService } from '@nestjs/jwt';
import { TTokens } from './types';
import { authDto } from './dtos/auth.dto';
import { UserConfirmationService } from 'src/userConfirmation/userConfirmation.service';
import { signUpLocalDto } from './dtos/signUpLocal.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private sessionService: SessionService,
    private jwtService: JwtService,
    private userConfirmationService: UserConfirmationService,
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
          expiresIn: Number(process.env.ACCESS_TOKEN_LIFE),
          secret: process.env.ACCESS_SECRET,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userUuid,
          email,
        },
        {
          expiresIn: Number(process.env.REFRESH_TOKEN_LIFE),
          secret: process.env.REFRESH_SECRET,
        },
      ),
    ]);
    return { access_token: at, refresh_token: rt };
  }

  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }

  async signUpLocalUser(userInput: CreateUserInput): Promise<signUpLocalDto> {
    const { password, ...restData } = userInput;

    const hashedPasssword = await this.hashData(password);

    const userData = {
      password: hashedPasssword,
      ...restData,
    };

    const user = await this.userService.createUser(userData);

    const confirmation = await this.userConfirmationService.createConfirmation(
      user.uuid,
    );

    const confirmationLink = `${process.env.CONFIRMATION_DOMAIN}/${confirmation.user_uuid}/${confirmation.uuid}`;

    // TODO: может быть нужно всё в один сделать запрос
    // const tokens = await this.getTokens(user.uuid, user.email);

    // const decodedRefreshToken = this.decodeToken(tokens.refresh_token);
    // const refreshExpiresAt = new Date(decodedRefreshToken.exp * 1000);

    // const sessionData = {
    //   user_uuid: user.uuid,
    //   refresh_token: tokens.refresh_token,
    //   refresh_expires_at: refreshExpiresAt,
    //   ...sessionInfo,
    // };

    // await this.sessionService.createSession(sessionData, tx);

    return { user, confirmation_link: confirmationLink };
  }

  async refresh(oldRefreshToken: string, userUuid: string, userEmail: string) {
    const tokens = await this.getTokens(userUuid, userEmail);

    const decodedRefreshToken = this.decodeToken(tokens.refresh_token);

    const refreshExpiresAt = new Date(decodedRefreshToken.exp * 1000);

    await this.sessionService.updateSession(oldRefreshToken, {
      refresh_expires_at: refreshExpiresAt,
      refresh_token: tokens.refresh_token,
    });

    return tokens;
  }
}
