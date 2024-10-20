import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from 'src/user/user.service';
import { UseGuards } from '@nestjs/common';
import { signUpLocalInput } from './inputs/signupLocal.input';
import { AuthService } from './auth.service';
import { SessionService } from 'src/session/session.service';
import { refreshDto } from './dtos/refresh.dto';
import { GqlRefreshTokenGuard } from './strategies';
import { PublicResolver } from 'src/common/decorators/publicResolver.decorator';
import { MailService } from 'src/mail/mail.service';
import { signUpLocalDto } from './dtos/signUpLocal.dto';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@exceptions/GqlExceptionsShortcuts';

@Resolver()
export class AuthResolver {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private sessionService: SessionService,
    private mailService: MailService,
  ) {}

  @PublicResolver()
  @Mutation(() => signUpLocalDto)
  async signUpLocal(@Args('signUpLocal') signUpLocal: signUpLocalInput) {
    const { repeated_password, ...userData } = signUpLocal;

    const user = await this.userService.findUserByEmail(userData.email);

    if (user) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует',
      );
    }

    // TODO: отправляем ссылку на подтверждение аккаунта
    // await this.mailService.sendMsg();

    const createdUserAndLink = await this.authService.signUpLocalUser(userData);

    return createdUserAndLink;
  }

  @PublicResolver()
  @UseGuards(GqlRefreshTokenGuard)
  @Mutation(() => refreshDto)
  async refresh(@Context('req') req: any) {
    const refreshToken = req.headers['refresh-token'];

    const session =
      await this.sessionService.getSessionByRefreshToken(refreshToken);

    if (!session || !session.is_active) {
      throw new UnauthorizedException('Данная сессия не найдена или закрыта');
    }

    const user = await this.userService.findUserByUuid(session.user_uuid);

    if (!user || user.is_deleted) {
      throw new NotFoundException('Пользователь не найден');
    }

    return await this.authService.refresh(
      session.refresh_token,
      user.uuid,
      user.email,
    );
  }
}
