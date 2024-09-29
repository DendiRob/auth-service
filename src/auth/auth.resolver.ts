import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { UserService } from 'src/user/user.service';
import { HttpStatus, UseGuards } from '@nestjs/common';
import { authDto } from './dtos/auth.dto';
import { signUpLocalInput } from './inputs/signupLocal.input';
import { AuthService } from './auth.service';
import {
  TUserAgentAndIp,
  UserAgentAndIp,
} from 'src/common/decorators/userAgentAndIp.decorator';
import { SessionService } from 'src/session/session.service';
import { refreshDto } from './dtos/refresh.dto';
import { GqlRefreshTokenGuard } from './strategies';
import { PublicResolver } from 'src/common/decorators/publicResolver.decorator';
import { MailService } from 'src/mail/mail.service';

@Resolver()
export class AuthResolver {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private sessionService: SessionService,
    private mailService: MailService,
  ) {}

  @PublicResolver()
  @Mutation(() => authDto)
  async signUpLocal(
    @Args('signUpLocal') signUpLocal: signUpLocalInput,
    @UserAgentAndIp() sessionInfo: TUserAgentAndIp,
  ) {
    const { repeated_password, ...userData } = signUpLocal;

    const user = await this.userService.findUserByEmail(userData.email);

    if (user) {
      throw new GraphQLError('Пользователь с таким email уже существует', {
        extensions: { code: HttpStatus.BAD_REQUEST },
      });
    }

    await this.mailService.sendMsg();
    // TODO: отправляем ссылку на подтверждение аккаунта
    const createdUserWithTokens = await this.authService.signupLocalUser(
      userData,
      sessionInfo,
    );

    return createdUserWithTokens;
  }

  @PublicResolver()
  @UseGuards(GqlRefreshTokenGuard)
  @Mutation(() => refreshDto)
  async refresh(@Context('req') req: any) {
    const refreshToken = req.headers['refresh-token'];

    const session =
      await this.sessionService.getSessionByRefreshToken(refreshToken);

    if (!session || !session.is_active) {
      throw new GraphQLError('Данная сессия не найдена или закрыта', {
        extensions: { code: HttpStatus.UNAUTHORIZED },
      });
    }

    const user = await this.userService.findUserByUuid(session.user_uuid);

    if (!user || user.is_deleted) {
      throw new GraphQLError('Пользователь не найден', {
        extensions: { code: HttpStatus.NOT_FOUND },
      });
    }

    return await this.authService.refresh(
      session.refresh_token,
      user.uuid,
      user.email,
    );
  }
}
